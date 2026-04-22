import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, TrendingDown, TrendingUp, Search, X, ChevronRight } from 'lucide-react-native';
import { useRef, useState, useMemo } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View, Modal, TextInput, FlatList, BlurView } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchMarketSnapshot } from '@/src/services/newsApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
type ChartType = 'line' | 'candle' | 'area';

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.statLabel, { color: colors.icon }]}>{label}</Text>
      <Text style={[styles.statValue, { color: color || colors.text }]}>{value}</Text>
    </View>
  );
}

export default function MarketDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
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
          symbol: symbol,
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
    refetchInterval: 10000,
  });

  const allAssetsQuery = useQuery({
    queryKey: ['market-snapshot'],
    queryFn: fetchMarketSnapshot,
  });

  const filteredAssets = useMemo(() => {
    const assets = allAssetsQuery.data ?? [];
    if (!switcherSearch.trim()) return assets;
    return assets.filter(a => 
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

  const tradingViewHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: ${colorScheme === 'dark' ? '#000000' : '#FFFFFF'}; overflow: hidden; }
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
            "theme": "${colorScheme === 'dark' ? 'dark' : 'light'}",
            "style": "${chartType === 'candle' ? '1' : chartType === 'area' ? '3' : '2'}",
            "locale": "en",
            "toolbar_bg": "${colorScheme === 'dark' ? '#000000' : '#FFFFFF'}",
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
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Asset Switcher Modal - REDESIGNED */}
      <Modal 
        visible={isSwitcherOpen} 
        animationType="slide" 
        transparent={true}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissArea} onPress={() => setIsSwitcherOpen(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Switch Asset</Text>
                <Text style={[styles.modalSubtitle, { color: colors.secondary }]}>Select from 50+ global assets</Text>
              </View>
              <Pressable onPress={() => setIsSwitcherOpen(false)} style={[styles.closeCircle, { backgroundColor: colors.surface }]}>
                <X size={20} color={colors.text} />
              </Pressable>
            </View>
            
            <View style={[styles.modalSearchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Search size={18} color={colors.secondary} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Find crypto or stocks..."
                placeholderTextColor={colors.secondary}
                value={switcherSearch}
                onChangeText={setSwitcherSearch}
                autoFocus
              />
              {switcherSearch.length > 0 && (
                <Pressable onPress={() => setSwitcherSearch('')}>
                  <X size={16} color={colors.secondary} />
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
                      pressed && { backgroundColor: colors.surface }
                    ]} 
                    onPress={() => {
                      setIsSwitcherOpen(false);
                      setSwitcherSearch('');
                      router.setParams({ symbol: item.symbol, type: item.type });
                    }}
                  >
                    <View style={styles.assetLeft}>
                      <View style={[styles.assetIcon, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.assetIconText, { color: colors.text }]}>{item.symbol.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={[styles.assetSymbolText, { color: colors.text }]}>{item.symbol}</Text>
                        <Text style={[styles.assetNameText, { color: colors.secondary }]} numberOfLines={1}>{item.name}</Text>
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

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerSymbol, { color: colors.text }]}>{detail.symbol}</Text>
          <Text style={[styles.headerType, { color: colors.icon }]}>
            {detail.type === 'crypto' ? 'Cryptocurrency' : 'Stock'}
          </Text>
        </View>

        <Pressable onPress={() => setIsSwitcherOpen(true)} style={styles.moreButton}>
          <Search size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.priceSection}>
          <Text style={[styles.currentPrice, { color: colors.text }]}>
            ${detail.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: detail.price > 100 ? 2 : 6 })}
          </Text>
          <View style={styles.changeRow}>
            {positive ? <TrendingUp size={20} color={colors.success} strokeWidth={2} /> : <TrendingDown size={20} color={colors.error} strokeWidth={2} />}
            <Text style={[styles.changeText, { color: positive ? colors.success : colors.error }]}>
              {positive ? '+' : ''}{detail.change24h.toFixed(2)} ({positive ? '+' : ''}{detail.changePercent24h.toFixed(2)}%)
            </Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsScroll}>
            {(['line', 'candle', 'area'] as ChartType[]).map((type) => (
              <Pressable
                key={type}
                onPress={() => setChartType(type)}
                style={[styles.controlButton, { backgroundColor: chartType === type ? colors.accent : colors.surface }]}
              >
                <Text style={[styles.controlText, { color: chartType === type ? (colorScheme === 'dark' ? '#000' : '#FFF') : colors.secondary }]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => setShowIndicators(!showIndicators)}
              style={[styles.controlButton, { backgroundColor: showIndicators ? colors.accent : colors.surface }]}
            >
              <Text style={[styles.controlText, { color: showIndicators ? (colorScheme === 'dark' ? '#000' : '#FFF') : colors.secondary }]}>
                Indicators: {showIndicators ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
          {Platform.OS === 'web' ? (
            <iframe
              src={`data:text/html;charset=utf-8,${encodeURIComponent(tradingViewHTML)}`}
              style={{ width: '100%', height: 500, border: 'none' }}
            />
          ) : (
            <WebView
              ref={webViewRef}
              source={{ html: tradingViewHTML }}
              style={styles.webView}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeFrameContainer} contentContainerStyle={styles.timeFrameContent}>
          {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeFrame[]).map((tf) => (
            <Pressable
              key={tf}
              onPress={() => setTimeFrame(tf)}
              style={[styles.timeFrameButton, { backgroundColor: timeFrame === tf ? colors.accent : colors.surface }]}
            >
              <Text style={[styles.timeFrameText, { color: timeFrame === tf ? (colorScheme === 'dark' ? '#000' : '#FFF') : colors.secondary }]}>{tf}</Text>
            </Pressable>
          ))}
        </ScrollView>

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

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSymbol: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  headerType: { fontSize: 12, fontWeight: '500', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  moreButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  priceSection: { padding: 24, alignItems: 'center' },
  currentPrice: { fontSize: 44, fontWeight: '900', letterSpacing: -1.5 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  changeText: { fontSize: 18, fontWeight: '700' },
  controlsRow: { paddingHorizontal: 16, marginBottom: 16 },
  controlsScroll: { gap: 8, alignItems: 'center' },
  controlButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, alignItems: 'center' },
  controlText: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  divider: { width: 1, height: 20, marginHorizontal: 4 },
  chartContainer: { height: 500, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden' },
  webView: { flex: 1, backgroundColor: 'transparent' },
  timeFrameContainer: { marginTop: 16, paddingHorizontal: 16 },
  timeFrameContent: { gap: 8 },
  timeFrameButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  timeFrameText: { fontSize: 14, fontWeight: '700' },
  statsSection: { padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20, letterSpacing: -0.5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '45%', padding: 20, borderRadius: 20 },
  statLabel: { fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { fontSize: 18, fontWeight: '900', letterSpacing: -0.4 },
  loadingText: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginTop: 100 },
  
  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalDismissArea: { flex: 1 },
  modalContent: { 
    height: '85%', 
    borderTopLeftRadius: 36, 
    borderTopRightRadius: 36, 
    borderTopWidth: 1,
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  modalTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  modalSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  closeCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  modalSearchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 18, 
    height: 56, 
    borderRadius: 18, 
    marginBottom: 24, 
    gap: 14,
    borderWidth: 1,
  },
  modalSearchInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  assetListContent: { paddingBottom: 40 },
  assetItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18, 
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 16,
  },
  assetLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  assetIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  assetIconText: { fontSize: 18, fontWeight: '900' },
  assetSymbolText: { fontSize: 17, fontWeight: '800' },
  assetNameText: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  assetRight: { alignItems: 'flex-end', gap: 4 },
  assetPriceText: { fontSize: 17, fontWeight: '800' },
  assetChangeText: { fontSize: 13, fontWeight: '700' },
});
