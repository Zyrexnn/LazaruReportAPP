import { SkeletonBlock } from '@/components/Skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Sparkline } from '@/src/components/Sparkline';
import { fetchMarketSnapshot } from '@/src/services/newsApi';
import type { MarketTicker } from '@/src/types/news';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

function MarketSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 60, backgroundColor: colors.background, flex: 1 }}>
      <SkeletonBlock height={60} radius={8} style={{ marginBottom: 24 }} />
      <SkeletonBlock height={70} radius={8} style={{ marginBottom: 8 }} />
      <SkeletonBlock height={70} radius={8} style={{ marginBottom: 8 }} />
      <SkeletonBlock height={70} radius={8} />
    </View>
  );
}

function MarketRow({ item, onPress }: { item: MarketTicker; onPress: () => void }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const positive = item.changePercent24h >= 0;

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.row, 
        { 
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
        pressed && { opacity: 0.6 }
      ]}
    >
      <View style={styles.leftSection}>
        <Text style={[styles.symbol, { color: colors.text }]}>{item.symbol}</Text>
        <Text style={[styles.type, { color: colors.icon }]}>
          {item.type === 'crypto' ? 'Crypto' : 'Stock'}
        </Text>
      </View>
      
      <View style={styles.chartSection}>
        <Sparkline 
          data={item.sparkline} 
          color={positive ? colors.success : colors.error} 
          width={80} 
          height={32} 
        />
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.price, { color: colors.text }]}>
          ${item.price.toLocaleString('en-US', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: item.price > 100 ? 2 : 4 
          })}
        </Text>
        <Text style={[styles.change, { color: positive ? colors.success : colors.error }]}>
          {positive ? '+' : ''}{item.changePercent24h.toFixed(2)}%
        </Text>
      </View>
    </Pressable>
  );
}

export default function MarketScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [filter, setFilter] = useState<'all' | 'crypto' | 'stock'>('all');
  const router = useRouter();
  
  const marketQuery = useQuery({
    queryKey: ['market-snapshot'],
    queryFn: fetchMarketSnapshot,
    refetchInterval: 30000,
  });

  const filteredData = useMemo(() => {
    const data = marketQuery.data ?? [];
    if (filter === 'all') return data;
    return data.filter(item => item.type === filter);
  }, [marketQuery.data, filter]);

  const stats = useMemo(() => {
    const data = marketQuery.data ?? [];
    const gainers = data.filter(t => t.changePercent24h > 0).length;
    const losers = data.filter(t => t.changePercent24h < 0).length;
    return { gainers, losers, total: data.length };
  }, [marketQuery.data]);

  if (marketQuery.isLoading) {
    return <MarketSkeleton />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header with Logo */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Image 
            source={require('@/assets/logolazarusreport.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerRight}>
            <Text style={[styles.marketLabel, { color: colors.icon }]}>Markets</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <TrendingUp size={12} color={colors.success} strokeWidth={2} />
                <Text style={[styles.statText, { color: colors.success }]}>{stats.gainers}</Text>
              </View>
              <View style={styles.statBadge}>
                <TrendingDown size={12} color={colors.error} strokeWidth={2} />
                <Text style={[styles.statText, { color: colors.error }]}>{stats.losers}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'crypto', 'stock'] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setFilter(type)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filter === type ? colors.accent : 'transparent',
                  borderColor: filter === type ? colors.accent : colors.border,
                }
              ]}
            >
              <Text style={[  
                styles.filterText,
                { color: filter === type ? '#FFFFFF' : colors.text }
              ]}>
                {type === 'all' ? 'All' : type === 'crypto' ? 'Crypto' : 'Stocks'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlashList
        data={filteredData}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={marketQuery.isRefetching} 
            onRefresh={marketQuery.refetch} 
            tintColor={colors.accent} 
          />
        }
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No market data</Text>
            <Text style={[styles.emptyBody, { color: colors.icon }]}>Pull to refresh</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MarketRow 
            item={item} 
            onPress={() => {
              router.push({
                pathname: '/market/[symbol]',
                params: { 
                  symbol: item.symbol,
                  type: item.type
                }
              });
            }} 
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logo: {
    width: 180,
    height: 48,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  marketLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  leftSection: {
    width: 80,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  type: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 100,
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptyBody: {
    fontSize: 15,
  },
});
