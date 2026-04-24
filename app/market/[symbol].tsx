import { BentoConfig, BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, TrendingDown, TrendingUp, Search, X } from 'lucide-react-native';
import { useRef, useState, useMemo, useEffect } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View, Modal, TextInput, FlatList } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, interpolateColor } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { fetchMarketSnapshot } from '@/src/services/newsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
type ChartType = 'line' | 'candle' | 'area';

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }, Shadows.sm]}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: color || colors.text }]}>{value}</Text>
    </View>
  );
}

function OrderBook({ symbol, type }: { symbol: string, type: 'crypto' | 'stock' }) {
  const colors = useThemeColors();
  
  const orderBookQuery = useQuery({
    queryKey: ['order-book', symbol],
    queryFn: async () => {
      if (type !== 'crypto') return null;
      try {
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}USDT&limit=10`);
        return await res.json();
      } catch (err) {
        console.error('Order book fetch failed', err);
        return null;
      }
    },
    refetchInterval: 2000,
    enabled: type === 'crypto',
  });

  if (type !== 'crypto' || !orderBookQuery.data) return null;

  const bids = orderBookQuery.data.bids || [];
  const asks = orderBookQuery.data.asks || [];

  return (
    <View style={styles.orderBookSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Book (Binance Live)</Text>
      <View style={[styles.orderBookContainer, { backgroundColor: colors.cardBg, borderColor: colors.borderStrong }]}>
        <View style={styles.orderBookSide}>
          <Text style={[styles.orderSideHeader, { color: colors.success }]}>BID (BUY)</Text>
          {bids.slice(0, 8).map((bid: string[], i: number) => (
            <View key={`bid-${i}`} style={styles.orderRow}>
              <Text style={[styles.orderPriceText, { color: colors.success }]}>{parseFloat(bid[0]).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              <Text style={[styles.orderAmountText, { color: colors.textSecondary }]}>{parseFloat(bid[1]).toFixed(4)}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.orderBookDivider, { backgroundColor: colors.border }]} />
        <View style={styles.orderBookSide}>
          <Text style={[styles.orderSideHeader, { color: colors.error }]}>ASK (SELL)</Text>
          {asks.slice(0, 8).map((ask: string[], i: number) => (
            <View key={`ask-${i}`} style={styles.orderRow}>
              <Text style={[styles.orderPriceText, { color: colors.error }]}>{parseFloat(ask[0]).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              <Text style={[styles.orderAmountText, { color: colors.textSecondary }]}>{parseFloat(ask[1]).toFixed(4)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function PriceHeader({ detail, colors, positive }: { detail: any, colors: any, positive: boolean }) {
  const prevPrice = useRef(detail.price);
  const flashValue = useSharedValue(0);

  useEffect(() => {
    if (detail.price > prevPrice.current) {
      flashValue.value = withSequence(withTiming(1, { duration: 150 }), withTiming(0, { duration: 600 }));
    } else if (detail.price < prevPrice.current) {
      flashValue.value = withSequence(withTiming(-1, { duration: 150 }), withTiming(0, { duration: 600 }));
    }
    prevPrice.current = detail.price;
  }, [detail.price]);

  const animatedPriceStyle = useAnimatedStyle(() => ({
    color: interpolateColor(flashValue.value, [-1, 0, 1], [colors.error, colors.text, colors.success])
  }));

  return (
    <View style={styles.priceSection}>
      <Animated.Text style={[styles.currentPrice, animatedPriceStyle]}>
        ${detail.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: detail.price > 100 ? 2 : 6 })}
      </Animated.Text>
      <View style={[styles.changePill, { backgroundColor: positive ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 0, 51, 0.1)' }]}>
        {positive ? <TrendingUp size={16} color={colors.success} strokeWidth={2.5} /> : <TrendingDown size={16} color={colors.error} strokeWidth={2.5} />}
        <Text style={[styles.changeText, { color: positive ? colors.success : colors.error }]}>
          {positive ? '+' : ''}{detail.change24h.toFixed(2)} ({positive ? '+' : ''}{detail.changePercent24h.toFixed(2)}%)
        </Text>
      </View>
    </View>
  );
}

export default function MarketDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useThemeColors();
  const isDark = useIsDark();

  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [showIndicators, setShowIndicators] = useState(true);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');

  const webViewRef = useRef<WebView>(null);

  const symbol = params.symbol as string;
  const type = params.type as 'crypto' | 'stock';

  const marketQuery = useQuery({
    queryKey: ['market-detail', symbol],
    queryFn: async () => {
      const { env, hasConfiguredKey } = await import('@/src/config/env');
      if (type === 'crypto') {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
        const data = await response.json();
        return {
          symbol,
          name: symbol,
          price: Number(data.lastPrice),
          change24h: Number(data.priceChange),
          changePercent24h: Number(data.priceChangePercent),
          high24h: Number(data.highPrice),
          low24h: Number(data.lowPrice),
          volume24h: Number(data.volume),
          type: 'crypto' as const,
        };
      }

      if (hasConfiguredKey(env.finnhubApiKey)) {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${env.finnhubApiKey}`);
        const data = await response.json();
        const currentPrice = Number(data.c ?? 0);
        const previousClose = Number(data.pc ?? currentPrice);
        const changePercent = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;

        return {
          symbol,
          name: symbol,
          price: currentPrice,
          change24h: currentPrice - previousClose,
          changePercent24h: changePercent,
          high24h: Number(data.h ?? currentPrice),
          low24h: Number(data.l ?? currentPrice),
          volume24h: 0,
          type: 'stock' as const,
        };
      }

      return { symbol, name: symbol, price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, type: 'stock' as const };
    },
    refetchInterval: 3000, // Faster updates for real-time feel
  });

  const allAssetsQuery = useQuery({
    queryKey: ['market-snapshot'],
    queryFn: fetchMarketSnapshot,
  });

  const filteredAssets = useMemo(() => {
    const assets = allAssetsQuery.data ?? [];
    if (!switcherSearch.trim()) return assets;
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(switcherSearch.toLowerCase()) ||
        a.name.toLowerCase().includes(switcherSearch.toLowerCase())
    );
  }, [allAssetsQuery.data, switcherSearch]);

  const detail = marketQuery.data;
  const positive = (detail?.changePercent24h ?? 0) >= 0;

  const getTradingViewSymbol = () => {
    if (type === 'crypto') return `BINANCE:${symbol}USDT`;
    return `NASDAQ:${symbol}`;
  };

  const getIntervalFromTimeFrame = (tf: TimeFrame) => {
    switch (tf) {
      case '1D': return '15';
      case '1W': return '60';
      case '1M': return '240';
      case '3M': return 'D';
      case '1Y': return 'D';
      case 'ALL': return 'W';
      default: return '60';
    }
  };

  const chartBg = isDark ? colors.background : '#FFFFFF';
  const tradingViewHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: ${chartBg}; overflow: hidden; }
          #tradingview_chart { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="tradingview_chart"></div>
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
          new TradingView.widget({
            "autosize": true,
            "symbol": "${getTradingViewSymbol()}",
            "interval": "${getIntervalFromTimeFrame(timeFrame)}",
            "timezone": "Etc/UTC",
            "theme": "${isDark ? 'dark' : 'light'}",
            "style": "${chartType === 'candle' ? '1' : chartType === 'area' ? '3' : '2'}",
            "locale": "en",
            "toolbar_bg": "${chartBg}",
            "enable_publishing": false,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "save_image": false,
            "container_id": "tradingview_chart",
            "studies": ${showIndicators ? '["MASimple@tv-basicstudies", "RSI@tv-basicstudies", "MACD@tv-basicstudies"]' : '[]'},
            "show_popup_button": true,
            "popup_width": "1000",
            "popup_height": "650",
            "support_host": "https://www.tradingview.com"
          });
        </script>
      </body>
    </html>
  `;

  if (!detail) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Asset Switcher Modal ───────────────────────────── */}
      <Modal visible={isSwitcherOpen} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissArea} onPress={() => setIsSwitcherOpen(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Switch Asset</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Select from 50+ global assets</Text>
              </View>
              <Pressable onPress={() => setIsSwitcherOpen(false)} style={[styles.closeCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <X size={18} color={colors.text} />
              </Pressable>
            </View>

            <View style={[styles.modalSearchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Search size={16} color={colors.textSecondary} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Find crypto or stocks..."
                placeholderTextColor={colors.textSecondary}
                value={switcherSearch}
                onChangeText={setSwitcherSearch}
                autoFocus
              />
              {switcherSearch.length > 0 && (
                <Pressable onPress={() => setSwitcherSearch('')}>
                  <X size={14} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>

            <FlatList
              data={filteredAssets}
              keyExtractor={(item) => `${item.type}-${item.symbol}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.assetListContent}
              renderItem={({ item }) => {
                const itemPositive = item.changePercent24h >= 0;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.assetItem,
                      { borderBottomColor: colors.border },
                      pressed && { backgroundColor: colors.accentSoft },
                    ]}
                    onPress={() => {
                      setIsSwitcherOpen(false);
                      setSwitcherSearch('');
                      router.setParams({ symbol: item.symbol, type: item.type });
                    }}
                  >
                    <View style={styles.assetLeft}>
                      <View style={[styles.assetIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.assetIconText, { color: colors.text }]}>{item.symbol.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={[styles.assetSymbolText, { color: colors.text }]}>{item.symbol}</Text>
                        <Text style={[styles.assetNameText, { color: colors.textSecondary }]} numberOfLines={1}>{item.name}</Text>
                      </View>
                    </View>
                    <View style={styles.assetRight}>
                      <Text style={[styles.assetPriceText, { color: colors.text }]}>
                        ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                      <Text style={[styles.assetChangeText, { color: itemPositive ? colors.success : colors.error }]}>
                        {itemPositive ? '+' : ''}{item.changePercent24h.toFixed(2)}%
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: '#000', borderBottomWidth: BorderWidth.thick }]}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { borderColor: '#000' }, Shadows.sm]}>
          <ChevronLeft size={22} color={colors.text} strokeWidth={2.5} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerSymbol, { color: colors.text }]}>{detail.symbol.toUpperCase()}</Text>
          <Text style={[styles.headerType, { color: colors.textSecondary }]}>
            {detail.type.toUpperCase()}
          </Text>
        </View>

        <Pressable onPress={() => setIsSwitcherOpen(true)} style={[styles.moreButton, { borderColor: '#000' }, Shadows.sm]}>
          <Search size={20} color={colors.text} strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ── Price Section ─────────────────────────────────── */}
        <PriceHeader detail={detail} colors={colors} positive={positive} />

        {/* ── Chart Controls ───────────────────────────────── */}
        <View style={styles.controlsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsScroll}>
            {(['line', 'candle', 'area'] as ChartType[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setChartType(t)}
                style={[styles.controlButton, {
                  backgroundColor: chartType === t ? colors.accent : colors.surface,
                  borderColor: chartType === t ? colors.accent : colors.border,
                }]}
              >
                <Text style={[styles.controlText, { color: chartType === t ? colors.badgeText : colors.textSecondary }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </Pressable>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => setShowIndicators(!showIndicators)}
              style={[styles.controlButton, {
                backgroundColor: showIndicators ? colors.accent : colors.surface,
                borderColor: showIndicators ? colors.accent : colors.border,
              }]}
            >
              <Text style={[styles.controlText, { color: showIndicators ? colors.badgeText : colors.textSecondary }]}>
                Indicators
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* ── Chart ────────────────────────────────────────── */}
        <View style={[styles.chartContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {Platform.OS === 'web' ? (
            <iframe
              src={`data:text/html;charset=utf-8,${encodeURIComponent(tradingViewHTML)}`}
              style={{ width: '100%', height: 480, border: 'none' }}
            />
          ) : (
            <WebView
              ref={webViewRef}
              source={{ html: tradingViewHTML }}
              style={styles.webView}
              scrollEnabled={false}
              javaScriptEnabled
              domStorageEnabled
            />
          )}
        </View>

        {/* ── Time Frame ───────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeFrameContainer} contentContainerStyle={styles.timeFrameContent}>
          {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeFrame[]).map((tf) => (
            <Pressable
              key={tf}
              onPress={() => setTimeFrame(tf)}
              style={[styles.timeFrameButton, {
                backgroundColor: timeFrame === tf ? colors.accent : colors.surface,
                borderColor: timeFrame === tf ? colors.accent : colors.border,
              }]}
            >
              <Text style={[styles.timeFrameText, { color: timeFrame === tf ? colors.badgeText : colors.textSecondary }]}>{tf}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Stats Bento Grid ─────────────────────────────── */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>24h Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard label="High" value={`$${detail.high24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color={colors.success} />
            <StatCard label="Low" value={`$${detail.low24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color={colors.error} />
            <StatCard label="Volume" value={`$${(detail.volume24h / 1000000).toFixed(2)}M`} />
            <StatCard
              label="Change"
              value={`${positive ? '+' : ''}${detail.changePercent24h.toFixed(2)}%`}
              color={positive ? colors.success : colors.error}
            />
          </View>
        </View>

        {/* ── Order Book (Crypto Only) ────────────────────── */}
        <OrderBook symbol={symbol} type={type} />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: BentoConfig.paddingH,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.normal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSymbol: { ...Typography.h2, fontSize: 18 },
  headerType: { ...Typography.overline, marginTop: 2 },
  moreButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.normal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: { flex: 1 },
  priceSection: { padding: Spacing['2xl'], alignItems: 'center' },
  currentPrice: { ...Typography.display, fontSize: 40 },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  changeText: { fontSize: 16, fontWeight: '700' },
  controlsRow: { paddingHorizontal: BentoConfig.paddingH, marginBottom: Spacing.lg },
  controlsScroll: { gap: Spacing.sm, alignItems: 'center' },
  controlButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.normal,
  },
  controlText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { width: 1, height: 20, marginHorizontal: Spacing.xs },
  chartContainer: {
    height: 480,
    marginHorizontal: BentoConfig.paddingH,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.normal,
    overflow: 'hidden',
  },
  webView: { flex: 1, backgroundColor: 'transparent' },
  timeFrameContainer: { marginTop: Spacing.lg, paddingHorizontal: BentoConfig.paddingH },
  timeFrameContent: { gap: Spacing.sm },
  timeFrameButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.normal,
  },
  timeFrameText: { fontSize: 13, fontWeight: '800' },
  statsSection: { padding: Spacing['2xl'] },
  sectionTitle: { ...Typography.h2, marginBottom: Spacing.xl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: BentoConfig.gap },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.normal,
  },
  statLabel: { ...Typography.overline, marginBottom: Spacing.sm },
  statValue: { ...Typography.mono, fontSize: 18 },
  loadingText: { ...Typography.h3, textAlign: 'center', marginTop: 100 },

  // ── Order Book ─────────────────────────────────────────────
  orderBookSection: {
    paddingHorizontal: BentoConfig.paddingH,
    marginTop: Spacing.xl,
  },
  orderBookContainer: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thick,
    padding: Spacing.md,
    ...Shadows.md,
  },
  orderBookSide: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
  },
  orderSideHeader: {
    ...Typography.overline,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  orderPriceText: {
    ...Typography.mono,
    fontSize: 11,
    fontWeight: '700',
  },
  orderAmountText: {
    ...Typography.mono,
    fontSize: 10,
  },
  orderBookDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: Spacing.sm,
  },

  // ── Modal ──────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalDismissArea: { flex: 1 },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    borderTopWidth: 1,
    padding: Spacing['2xl'],
    paddingTop: Spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  modalTitle: { ...Typography.h1, fontSize: 22 },
  modalSubtitle: { ...Typography.caption, marginTop: 2 },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.normal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: Radius.md,
    marginBottom: Spacing['2xl'],
    gap: Spacing.md,
    borderWidth: BorderWidth.normal,
  },
  modalSearchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  assetListContent: { paddingBottom: 40 },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
  },
  assetLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.thin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetIconText: { fontSize: 16, fontWeight: '900' },
  assetSymbolText: { fontSize: 16, fontWeight: '700' },
  assetNameText: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  assetRight: { alignItems: 'flex-end', gap: 4 },
  assetPriceText: { ...Typography.mono, fontSize: 16 },
  assetChangeText: { fontSize: 12, fontWeight: '800' },
});
