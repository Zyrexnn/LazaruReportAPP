import { SkeletonBlock } from '@/components/Skeleton';
import { BentoConfig, BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { fetchMarketSnapshot } from '@/src/services/newsApi';
import type { MarketTicker } from '@/src/types/news';
import { Sparkline } from '@/src/components/Sparkline';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Search, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

function MarketSkeleton() {
  const colors = useThemeColors();
  return (
    <View style={{ paddingHorizontal: BentoConfig.paddingH, paddingTop: 70, backgroundColor: colors.background, flex: 1 }}>
      <SkeletonBlock height={28} width={120} radius={Radius.sm} style={{ marginBottom: 8 }} />
      <SkeletonBlock height={14} width={180} radius={Radius.xs} style={{ marginBottom: 32 }} />
      <View style={{ flexDirection: 'row', gap: BentoConfig.gap, marginBottom: 24 }}>
        <SkeletonBlock height={90} radius={Radius.lg} style={{ flex: 1 }} />
        <SkeletonBlock height={90} radius={Radius.lg} style={{ flex: 1 }} />
      </View>
      <SkeletonBlock height={44} radius={Radius.md} style={{ marginBottom: 20 }} />
      {[1, 2, 3, 4].map((i) => (
        <SkeletonBlock key={i} height={64} radius={Radius.md} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
}

function StatBento({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.statBento, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: color || colors.text }]}>{value}</Text>
      {sub && <Text style={[styles.statSub, { color: colors.textSecondary }]}>{sub}</Text>}
    </View>
  );
}

function MarketRow({ item, onPress }: { item: MarketTicker; onPress: () => void }) {
  const colors = useThemeColors();
  const positive = item.changePercent24h >= 0;
  const changeColor = positive ? colors.success : colors.error;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.accentSoft },
      ]}
    >
      {/* Symbol */}
      <View style={styles.leftSection}>
        <View style={[styles.symbolIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.symbolIconText, { color: colors.text }]}>
            {item.symbol.charAt(0)}
          </Text>
        </View>
        <View style={styles.symbolInfo}>
          <Text style={[styles.symbol, { color: colors.text }]}>{item.symbol}</Text>
          <Text style={[styles.name, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      </View>

      {/* Sparkline */}
      <View style={styles.middleSection}>
        <Sparkline data={item.sparkline} color={changeColor} width={72} height={28} />
      </View>

      {/* Price */}
      <View style={styles.rightSection}>
        <Text style={[styles.price, { color: colors.text }]}>
          ${item.price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: item.price > 100 ? 2 : 4,
          })}
        </Text>
        <View style={[styles.changeBadge, { backgroundColor: positive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }]}>
          <Text style={[styles.changeText, { color: changeColor }]}>
            {positive ? '+' : ''}{item.changePercent24h.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function MarketScreen() {
  const colors = useThemeColors();
  const isDark = useIsDark();
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
    data = data.filter((item) => item.type === activeTab);
    if (searchQuery.trim() !== '') {
      data = data.filter(
        (item) =>
          item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data;
  }, [marketQuery.data, searchQuery, activeTab]);

  // Compute market stats
  const topGainer = useMemo(() => {
    const data = (marketQuery.data ?? []).filter((i) => i.type === activeTab);
    return data.reduce((best, item) => (item.changePercent24h > (best?.changePercent24h ?? -Infinity) ? item : best), data[0]);
  }, [marketQuery.data, activeTab]);

  const topLoser = useMemo(() => {
    const data = (marketQuery.data ?? []).filter((i) => i.type === activeTab);
    return data.reduce((worst, item) => (item.changePercent24h < (worst?.changePercent24h ?? Infinity) ? item : worst), data[0]);
  }, [marketQuery.data, activeTab]);

  if (marketQuery.isLoading) {
    return <MarketSkeleton />;
  }

  const sentiment = sentimentQuery.data;
  const sentimentValue = parseInt(sentiment?.value ?? '50');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Markets</Text>
          <View style={styles.sentimentRow}>
            <View style={[styles.sentimentDot, { backgroundColor: sentimentValue > 50 ? colors.success : colors.error }]} />
            <Text style={[styles.sentimentText, { color: colors.textSecondary }]}>
              {sentiment?.value_classification ?? 'Neutral'} · {sentiment?.value ?? '50'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={marketQuery.isRefetching}
            onRefresh={marketQuery.refetch}
            tintColor={colors.accent}
          />
        }
      >
        {/* ── Bento Stat Cards ────────────────────────────────── */}
        <View style={styles.bentoRow}>
          {topGainer && (
            <StatBento
              label="Top Gainer"
              value={topGainer.symbol}
              sub={`+${topGainer.changePercent24h.toFixed(2)}%`}
              color={colors.success}
            />
          )}
          {topLoser && (
            <StatBento
              label="Top Loser"
              value={topLoser.symbol}
              sub={`${topLoser.changePercent24h.toFixed(2)}%`}
              color={colors.error}
            />
          )}
        </View>

        {/* ── Search ──────────────────────────────────────────── */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* ── Tab Switcher ────────────────────────────────────── */}
        <View style={styles.tabContainer}>
          {(['crypto', 'stocks'] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: active ? colors.accent : 'transparent',
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: active ? colors.badgeText : colors.textSecondary },
                  ]}
                >
                  {tab === 'crypto' ? 'Crypto' : 'Stocks'}
                </Text>
              </Pressable>
            );
          })}
          <View style={{ flex: 1 }} />
          <Text style={[styles.assetCount, { color: colors.textSecondary }]}>
            {filteredData.length} assets
          </Text>
        </View>

        {/* ── List Header ─────────────────────────────────────── */}
        <View style={styles.listHeader}>
          <Text style={[styles.listLabel, { color: colors.textSecondary }]}>Asset</Text>
          <Text style={[styles.listLabel, { color: colors.textSecondary, textAlign: 'center' }]}>7h</Text>
          <Text style={[styles.listLabel, { color: colors.textSecondary, textAlign: 'right' }]}>Price</Text>
        </View>

        {/* ── Market List ─────────────────────────────────────── */}
        {filteredData.map((item) => (
          <MarketRow
            key={item.id}
            item={item}
            onPress={() =>
              router.push({
                pathname: '/market/[symbol]',
                params: { symbol: item.symbol, type: item.type },
              })
            }
          />
        ))}
        {filteredData.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No matches found</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Header ─────────────────────────────────────────────────
  header: {
    paddingHorizontal: BentoConfig.paddingH,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.display,
    fontSize: 32,
  },
  sentimentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sentimentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  sentimentText: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Bento Stats ────────────────────────────────────────────
  bentoRow: {
    flexDirection: 'row',
    paddingHorizontal: BentoConfig.paddingH,
    gap: BentoConfig.gap,
    marginBottom: Spacing.xl,
  },
  statBento: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.normal,
    gap: 4,
  },
  statLabel: {
    ...Typography.overline,
  },
  statValue: {
    ...Typography.h2,
    fontSize: 22,
  },
  statSub: {
    ...Typography.caption,
    marginTop: 2,
  },

  // ── Search ─────────────────────────────────────────────────
  searchSection: {
    paddingHorizontal: BentoConfig.paddingH,
    marginBottom: Spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.normal,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },

  // ── Tabs ───────────────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BentoConfig.paddingH,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tabBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.normal,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assetCount: {
    ...Typography.caption,
  },

  // ── List ───────────────────────────────────────────────────
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: BentoConfig.paddingH,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  listLabel: {
    ...Typography.overline,
    flex: 1,
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: BentoConfig.paddingH,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  symbolIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.thin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolIconText: {
    fontSize: 14,
    fontWeight: '900',
  },
  symbolInfo: {
    gap: 1,
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  name: {
    fontSize: 11,
    fontWeight: '500',
  },
  rightSection: {
    flex: 1.5,
    alignItems: 'flex-end',
    gap: 4,
  },
  price: {
    ...Typography.mono,
    fontSize: 16,
  },
  changeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
  },
});
