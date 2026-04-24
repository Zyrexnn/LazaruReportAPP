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
    <View style={[styles.statBento, { backgroundColor: colors.cardBg, borderColor: colors.borderStrong }]}>
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
        { backgroundColor: colors.cardBg, borderColor: colors.borderStrong },
        pressed && styles.rowPressed,
      ]}
    >
      {/* Symbol */}
      <View style={styles.leftSection}>
        <View style={[styles.symbolIcon, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
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
        <View style={[styles.changeBadge, { backgroundColor: positive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', borderColor: changeColor }]}>
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
      <View style={[styles.header, { borderBottomColor: colors.borderStrong }]}>
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

        {/* ── Controls ──────────────────────────────────────────── */}
        <View style={styles.controlsSection}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.tabRow}>
            {(['crypto', 'stocks'] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={({ pressed }) => [
                    styles.tabBtn,
                    {
                      backgroundColor: active ? colors.accent : colors.surface,
                      borderColor: active ? colors.borderStrong : colors.border,
                    },
                    active && { transform: [{ translateY: -2 }, { translateX: -2 }] },
                    pressed && !active && { backgroundColor: colors.accentSoft },
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
          </View>
          <View style={{ alignItems: 'flex-end', marginTop: -4 }}>
            <Text style={[styles.assetCount, { color: colors.textSecondary }]}>
              {filteredData.length} assets
            </Text>
          </View>
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
    paddingBottom: Spacing.md,
    borderBottomWidth: BorderWidth.thick,
    borderBottomColor: '#000',
  },
  headerTitle: {
    ...Typography.display,
    fontSize: 42,
    lineHeight: 46,
  },
  sentimentBox: {
    marginTop: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.normal,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  sentimentText: {
    ...Typography.caption,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ── Scroll Content ─────────────────────────────────────────
  scrollContent: {
    paddingBottom: 120,
  },

  // ── Bento Grid ─────────────────────────────────────────────
  bentoGrid: {
    padding: BentoConfig.paddingH,
    gap: BentoConfig.gap,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: BentoConfig.gap,
  },
  bentoStack: {
    flex: 1,
    gap: BentoConfig.gap,
  },
  statBento: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    justifyContent: 'center',
    ...Shadows.md,
  },
  statLabel: {
    ...Typography.overline,
    fontSize: 10,
    fontWeight: '900',
  },
  statValue: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  statSub: {
    ...Typography.caption,
    fontWeight: '800',
    marginTop: 2,
  },
  miniBento: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.normal,
    justifyContent: 'center',
    ...Shadows.sm,
  },
  miniLabel: {
    ...Typography.overline,
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
  },
  miniValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
  },

  // ── Controls ───────────────────────────────────────────────
  controlsSection: {
    paddingHorizontal: BentoConfig.paddingH,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  assetCount: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: Spacing.xs,
  },

  // ── List ───────────────────────────────────────────────────
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: BentoConfig.paddingH + Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  listLabel: {
    ...Typography.overline,
    fontSize: 11,
    fontWeight: '900',
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: BentoConfig.paddingH,
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  rowPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    ...Shadows.none,
  },
  leftSection: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  symbolIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  symbolIconText: {
    fontSize: 16,
    fontWeight: '900',
  },
  symbolInfo: {
    gap: 0,
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  rightSection: {
    flex: 1.5,
    alignItems: 'flex-end',
    gap: 6,
  },
  price: {
    ...Typography.mono,
    fontSize: 17,
    fontWeight: '900',
  },
  changeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.normal,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    fontWeight: '700',
  },
});
