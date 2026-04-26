import { BentoConfig, BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { useIsOffline } from '@/hooks/use-network-status';
import { OfflineGate } from '@/components/OfflineGate';
import { fetchTradingIdeas } from '@/src/services/ideasApi';
import type { TradingIdea, IdeaCategory, IdeaType } from '@/src/types/ideas';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Code, MessageSquare, ThumbsUp, Filter, TrendingUp, Cpu } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Linking,
} from 'react-native';

function IdeaCard({ item }: { item: TradingIdea }) {
  const colors = useThemeColors();
  const isScript = item.type === 'script';

  return (
    <Pressable
      onPress={() => item.tradingViewUrl && Linking.openURL(item.tradingViewUrl)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.cardBg, borderColor: colors.borderStrong },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: isScript ? '#FF3366' : colors.accent, borderColor: colors.borderStrong }]}>
          {isScript ? <Code size={12} color="#FFF" /> : <TrendingUp size={12} color="#FFF" />}
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
        <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
          {item.category.toUpperCase()}
        </Text>
      </View>

      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.cardImage, { borderColor: colors.borderStrong }]}
          contentFit="cover"
        />
      )}

      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text style={[styles.cardSummary, { color: colors.textSecondary }]} numberOfLines={3}>
        {item.summary}
      </Text>

      {isScript && item.content && (
        <View style={[styles.codeSnippet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.codeText, { color: colors.textSecondary }]} numberOfLines={3}>
            {item.content}
          </Text>
        </View>
      )}

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={styles.authorSection}>
          <View style={[styles.avatar, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>{item.author.charAt(0)}</Text>
          </View>
          <Text style={[styles.authorName, { color: colors.text }]}>{item.author}</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThumbsUp size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageSquare size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function IdeasScreen() {
  const colors = useThemeColors();
  const isDark = useIsDark();
  const isOffline = useIsOffline();
  const [activeCategory, setActiveCategory] = useState<IdeaCategory | 'all'>('all');
  const [activeType, setActiveType] = useState<IdeaType | 'all'>('all');

  const ideasQuery = useQuery({
    queryKey: ['trading-ideas', activeCategory, activeType],
    queryFn: () => fetchTradingIdeas(
      activeCategory === 'all' ? undefined : activeCategory,
      activeType === 'all' ? undefined : activeType
    ),
  });

  const featuredIdea = useMemo(() => {
    return ideasQuery.data?.find(i => i.type === 'idea');
  }, [ideasQuery.data]);

  const otherIdeas = useMemo(() => {
    return ideasQuery.data?.filter(i => i.id !== featuredIdea?.id) ?? [];
  }, [ideasQuery.data, featuredIdea]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Header ────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.borderStrong }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerSubtitle, { color: colors.accent }]}>ALPHA INTELLIGENCE</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Trade Ideas</Text>
          </View>
          <Image 
            source={require('@/assets/assets/idea.svg')}
            style={styles.headerAsset}
            contentFit="contain"
          />
        </View>

        {/* ── Filters ──────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <View style={styles.filterGroup}>
            {(['all', 'stock', 'crypto'] as const).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.filterBtn,
                  { backgroundColor: activeCategory === cat ? colors.accent : colors.surface, borderColor: colors.borderStrong },
                  activeCategory === cat && Shadows.sm
                ]}
              >
                <Text style={[styles.filterText, { color: activeCategory === cat ? colors.badgeText : colors.textSecondary }]}>
                  {cat.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.filterDivider} />
          <View style={styles.filterGroup}>
            {(['all', 'idea', 'script', 'post'] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => setActiveType(type)}
                style={[
                  styles.filterBtn,
                  { backgroundColor: activeType === type ? '#FF3366' : colors.surface, borderColor: colors.borderStrong },
                  activeType === type && Shadows.sm
                ]}
              >
                <Text style={[styles.filterText, { color: activeType === type ? '#FFF' : colors.textSecondary }]}>
                  {type.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <OfflineGate isOffline={isOffline} onRetry={() => ideasQuery.refetch()}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={ideasQuery.isRefetching}
              onRefresh={ideasQuery.refetch}
              tintColor={colors.accent}
            />
          }
        >
        {ideasQuery.isLoading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>DECODING ALPHA STRATEGIES...</Text>
          </View>
        ) : (
          <View style={styles.bentoGrid}>
            {/* ── Featured Card ────────────────────────────────── */}
            {featuredIdea && activeType !== 'script' && activeType !== 'post' && (
              <IdeaCard item={featuredIdea} />
            )}

            {/* ── Grid Items ───────────────────────────────────── */}
            <View style={styles.gridRow}>
              {otherIdeas.map((item) => (
                <View key={item.id} style={styles.gridItem}>
                  <IdeaCard item={item} />
                </View>
              ))}
            </View>

            {ideasQuery.data?.length === 0 && (
              <View style={styles.emptyContainer}>
                <Image 
                  source={require('@/assets/assets/blue-star-card.svg')}
                  style={{ width: 80, height: 80, marginBottom: 20 }}
                  contentFit="contain"
                />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>NO ALPHA DETECTED IN THIS SECTOR</Text>
              </View>
            )}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      </OfflineGate>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.md,
    borderBottomWidth: BorderWidth.thick,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: BentoConfig.paddingH,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.display,
    fontSize: 42,
    lineHeight: 46,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerAsset: {
    width: 60,
    height: 60,
  },
  filterScroll: {
    paddingHorizontal: BentoConfig.paddingH,
    gap: 12,
    paddingBottom: 4,
  },
  filterGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  filterDivider: {
    width: 2,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
  },
  filterText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
  },
  loadingCenter: {
    flex: 1,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bentoGrid: {
    paddingHorizontal: BentoConfig.paddingH,
    gap: BentoConfig.gap,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: BentoConfig.gap,
  },
  gridItem: {
    width: '100%',
  },
  card: {
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    padding: Spacing.lg,
    ...Shadows.md,
    marginBottom: Spacing.sm,
  },
  cardPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    ...Shadows.none,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 8,
    fontWeight: '900',
  },
  cardSummary: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  codeSnippet: {
    padding: 12,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  codeText: {
    ...Typography.mono,
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '900',
  },
  authorName: {
    fontSize: 12,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
});
