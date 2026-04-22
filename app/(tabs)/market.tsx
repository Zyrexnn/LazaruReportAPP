import { SkeletonBlock } from '@/components/Skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchMarketSnapshot } from '@/src/services/newsApi';
import type { MarketTicker } from '@/src/types/news';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Search, Sun, Moon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Sparkline } from '@/src/components/Sparkline';

function MarketSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 80, backgroundColor: colors.background, flex: 1 }}>
      <SkeletonBlock height={30} width={120} radius={4} style={{ marginBottom: 40 }} />
      <SkeletonBlock height={60} radius={12} style={{ marginBottom: 20 }} />
      <SkeletonBlock height={60} radius={12} style={{ marginBottom: 20 }} />
      <SkeletonBlock height={60} radius={12} />
    </View>
  );
}

function MarketRow({ item, onPress }: { item: MarketTicker; onPress: () => void }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const positive = item.changePercent24h >= 0;
  const indicatorColor = positive ? '#00FFA3' : '#FF3B3B';

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.row, 
        pressed && { backgroundColor: 'rgba(255,255,255,0.03)' }
      ]}
    >
      <View style={styles.leftSection}>
        <View style={styles.symbolContainer}>
          <Text style={[styles.symbol, { color: colors.text }]}>{item.symbol}</Text>
          <Text style={[styles.name, { color: colors.secondary }]} numberOfLines={1}>{item.name}</Text>
        </View>
      </View>

      <View style={styles.middleSection}>
        <Sparkline 
          data={item.sparkline} 
          color={indicatorColor} 
          width={80} 
          height={32} 
        />
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.price, { color: colors.text }]}>
          {item.price.toLocaleString('en-US', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: item.price > 100 ? 2 : 4 
          })}
        </Text>
        <Text style={[styles.changeText, { color: indicatorColor }]}>
          {positive ? '+' : ''}{item.changePercent24h.toFixed(2)}%
        </Text>
      </View>
    </Pressable>
  );
}

export default function MarketScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'crypto' | 'stocks'>('crypto');
  const router = useRouter();
  
  const marketQuery = useQuery({
    queryKey: ['market-snapshot'],
    queryFn: fetchMarketSnapshot,
    refetchInterval: 30000,
  });

  const sentimentQuery = useQuery({
    queryKey: ['market-sentiment'],
    queryFn: async () => {
      const res = await fetch('https://api.alternative.me/fng/');
      const data = await res.json();
      return data.data?.[0] ?? { value: '50', value_classification: 'Neutral' };
    },
    refetchInterval: 3600000,
  });

  const filteredData = useMemo(() => {
    let data = marketQuery.data ?? [];
    data = data.filter(item => item.type === activeTab);
    if (searchQuery.trim() !== '') {
      data = data.filter(item => 
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data;
  }, [marketQuery.data, searchQuery, activeTab]);

  if (marketQuery.isLoading) {
    return <MarketSkeleton />;
  }

  const sentiment = sentimentQuery.data;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Markets</Text>
          <View style={styles.sentimentMinimal}>
             <View style={[styles.sentimentDot, { backgroundColor: parseInt(sentiment?.value ?? '50') > 50 ? '#00FFA3' : '#FF3B3B' }]} />
             <Text style={[styles.sentimentText, { color: colors.secondary }]}>
               {sentiment?.value_classification} {sentiment?.value}
             </Text>
          </View>
        </View>
        
        <Pressable 
          onPress={toggleTheme} 
          style={({ pressed }) => [
            styles.themeButton,
            { backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent' }
          ]}
          hitSlop={30}
        >
          {colorScheme === 'dark' ? (
            <Sun size={24} color="#FFD700" />
          ) : (
            <Moon size={24} color="#555" />
          )}
        </Pressable>
      </View>

      <ScrollView 
        stickyHeaderIndices={[1]} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={marketQuery.isRefetching} 
            onRefresh={marketQuery.refetch} 
            tintColor={colors.accent}
          />
        }
      >
        {/* Search - Minimal Line */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBox, { borderBottomColor: colors.border }]}>
            <Search size={16} color={colors.secondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor="rgba(150,150,150,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Minimal Navigation */}
        <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
          <View style={styles.tabBar}>
             <Pressable 
               onPress={() => setActiveTab('crypto')}
               style={[styles.tabButton, activeTab === 'crypto' && styles.tabButtonActive]}
             >
               <Text style={[styles.tabText, { color: activeTab === 'crypto' ? colors.text : colors.secondary }]}>Crypto</Text>
               {activeTab === 'crypto' && <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />}
             </Pressable>
             <Pressable 
               onPress={() => setActiveTab('stocks')}
               style={[styles.tabButton, activeTab === 'stocks' && styles.tabButtonActive]}
             >
               <Text style={[styles.tabText, { color: activeTab === 'stocks' ? colors.text : colors.secondary }]}>Stocks</Text>
               {activeTab === 'stocks' && <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />}
             </Pressable>
          </View>
        </View>

        {/* List Section */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
             <Text style={[styles.listLabel, { color: colors.secondary }]}>Symbol</Text>
             <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.listLabel, { color: colors.secondary }]}>Trend</Text>
             </View>
             <Text style={[styles.listLabel, { color: colors.secondary, textAlign: 'right' }]}>Price</Text>
          </View>
          {filteredData.map((item) => (
            <MarketRow 
              key={item.id} 
              item={item} 
              onPress={() => router.push({ pathname: '/market/[symbol]', params: { symbol: item.symbol, type: item.type } })} 
            />
          ))}
          {filteredData.length === 0 && (
            <View style={styles.emptyContainer}>
               <Text style={[styles.emptyText, { color: colors.secondary }]}>No matches found</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  sentimentMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sentimentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
  },
  tabContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 32,
  },
  tabButton: {
    paddingVertical: 8,
    position: 'relative',
  },
  tabButtonActive: {
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  listContainer: {
    paddingTop: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  listLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  leftSection: {
    flex: 1.5,
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolContainer: {
    gap: 2,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  name: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.7,
  },
  rightSection: {
    flex: 1.5,
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});
