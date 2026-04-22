import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Activity, BarChart3, ChevronLeft, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
type ChartType = 'line' | 'candle' | 'area';

interface MarketDetail {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  type: 'crypto' | 'stock';
}

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
  const webViewRef = useRef<WebView>(null);

  const symbol = params.symbol as string;
  const type = params.type as 'crypto' | 'stock';

  // Fetch market detail
  const marketQuery = useQuery({
    queryKey: ['market-detail', symbol],
    queryFn: async () => {
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
      // For stocks, return mock data for now
      return {
        symbol,
        name: symbol,
        price: 150.25,
        change24h: 2.5,
        changePercent24h: 1.69,
        high24h: 152.0,
        low24h: 148.5,
        volume24h: 50000000,
        type: 'stock' as const,
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const detail = marketQuery.data;
  const positive = (detail?.changePercent24h ?? 0) >= 0;

  // TradingView chart configuration
  const getTradingViewSymbol = () => {
    if (type === 'crypto') {
      return `BINANCE:${symbol}USDT`;
    }
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
          body { 
            background: ${colorScheme === 'dark' ? '#000000' : '#FFFFFF'}; 
            overflow: hidden;
          }
          #tradingview_chart { 
            width: 100vw; 
            height: 100vh; 
          }
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
            "studies": [
              "MASimple@tv-basicstudies",
              "RSI@tv-basicstudies",
              "MACD@tv-basicstudies"
            ],
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

        <Pressable style={styles.moreButton}>
          <Activity size={20} color={colors.icon} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={[styles.currentPrice, { color: colors.text }]}>
            ${detail.price.toLocaleString('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: detail.price > 100 ? 2 : 6 
            })}
          </Text>
          <View style={styles.changeRow}>
            {positive ? (
              <TrendingUp size={20} color={colors.success} strokeWidth={2} />
            ) : (
              <TrendingDown size={20} color={colors.error} strokeWidth={2} />
            )}
            <Text style={[styles.changeText, { color: positive ? colors.success : colors.error }]}>
              {positive ? '+' : ''}{detail.change24h.toFixed(2)} ({positive ? '+' : ''}{detail.changePercent24h.toFixed(2)}%)
            </Text>
          </View>
        </View>

        {/* Chart Type Selector */}
        <View style={styles.chartTypeContainer}>
          {(['line', 'candle', 'area'] as ChartType[]).map((type) => (
            <Pressable
              key={type}
              onPress={() => setChartType(type)}
              style={[
                styles.chartTypeButton,
                {
                  backgroundColor: chartType === type ? colors.accent : colors.card,
                }
              ]}
            >
              <Text style={[
                styles.chartTypeText,
                { color: chartType === type ? '#FFFFFF' : colors.text }
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* TradingView Chart */}
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
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}
        </View>

        {/* Time Frame Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.timeFrameContainer}
          contentContainerStyle={styles.timeFrameContent}
        >
          {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeFrame[]).map((tf) => (
            <Pressable
              key={tf}
              onPress={() => setTimeFrame(tf)}
              style={[
                styles.timeFrameButton,
                {
                  backgroundColor: timeFrame === tf ? colors.accent : colors.card,
                }
              ]}
            >
              <Text style={[
                styles.timeFrameText,
                { color: timeFrame === tf ? '#FFFFFF' : colors.text }
              ]}>
                {tf}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>24h Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              label="High" 
              value={`$${detail.high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color={colors.success}
            />
            <StatCard 
              label="Low" 
              value={`$${detail.low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color={colors.error}
            />
            <StatCard 
              label="Volume" 
              value={`${(detail.volume24h / 1000000).toFixed(2)}M`}
            />
            <StatCard 
              label="Change" 
              value={`${positive ? '+' : ''}${detail.changePercent24h.toFixed(2)}%`}
              color={positive ? colors.success : colors.error}
            />
          </View>
        </View>

        {/* Indicators Info */}
        <View style={styles.indicatorsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Indicators</Text>
          <View style={[styles.indicatorCard, { backgroundColor: colors.card }]}>
            <BarChart3 size={20} color={colors.accent} strokeWidth={2} />
            <View style={styles.indicatorInfo}>
              <Text style={[styles.indicatorName, { color: colors.text }]}>Moving Average (MA)</Text>
              <Text style={[styles.indicatorDesc, { color: colors.icon }]}>Simple moving average overlay</Text>
            </View>
          </View>
          <View style={[styles.indicatorCard, { backgroundColor: colors.card }]}>
            <Activity size={20} color={colors.accent} strokeWidth={2} />
            <View style={styles.indicatorInfo}>
              <Text style={[styles.indicatorName, { color: colors.text }]}>RSI</Text>
              <Text style={[styles.indicatorDesc, { color: colors.icon }]}>Relative Strength Index</Text>
            </View>
          </View>
          <View style={[styles.indicatorCard, { backgroundColor: colors.card }]}>
            <TrendingUp size={20} color={colors.accent} strokeWidth={2} />
            <View style={styles.indicatorInfo}>
              <Text style={[styles.indicatorName, { color: colors.text }]}>MACD</Text>
              <Text style={[styles.indicatorDesc, { color: colors.icon }]}>Moving Average Convergence Divergence</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSymbol: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerType: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  priceSection: {
    padding: 20,
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  changeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  chartTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    height: 500,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  timeFrameContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  timeFrameContent: {
    gap: 8,
  },
  timeFrameButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  indicatorsSection: {
    padding: 20,
  },
  indicatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  indicatorInfo: {
    flex: 1,
  },
  indicatorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  indicatorDesc: {
    fontSize: 13,
    fontWeight: '400',
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 100,
  },
});
