import { BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { useNewsStore } from '@/src/store/useNewsStore';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Eye, EyeOff, ExternalLink } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';

export default function NewsDetailScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { selectedArticle } = useNewsStore();
  const [distractionFree, setDistractionFree] = useState(false);
  const colors = useThemeColors();
  const isDark = useIsDark();

  const articleHtml = useMemo(() => {
    if (!selectedArticle) {
      return '<p>Article unavailable.</p>';
    }
    if (selectedArticle.content?.trim().startsWith('<')) {
      return selectedArticle.content;
    }
    return `<p>${selectedArticle.summary}</p><p>${selectedArticle.content ?? selectedArticle.summary}</p>`;
  }, [selectedArticle]);

  if (!selectedArticle) {
    return (
      <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Article unavailable.</Text>
      </View>
    );
  }

  const openExternal = async () => {
    const { openBrowserAsync } = await import('expo-web-browser');
    await openBrowserAsync(selectedArticle.contentUrl);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Image */}
        <Image
          source={
            selectedArticle.imageUrl ||
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop'
          }
          contentFit="cover"
          cachePolicy="memory-disk"
          style={styles.heroImage}
        />

        {/* Floating Controls */}
        <View style={styles.overlayControls}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: '#000' }]}
            onPress={() => router.back()}
          >
            <ChevronLeft size={22} color={colors.text} strokeWidth={2.5} />
          </Pressable>
          <View style={styles.controlsRight}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: '#000' }]}
              onPress={() => setDistractionFree((v) => !v)}
            >
              {distractionFree ? (
                <Eye size={18} color={colors.text} strokeWidth={2.5} />
              ) : (
                <EyeOff size={18} color={colors.text} strokeWidth={2.5} />
              )}
            </Pressable>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.accent, borderColor: '#000' }]}
              onPress={openExternal}
            >
              <ExternalLink size={18} color={'#FFF'} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        {/* Article Content Sheet */}
        <View style={[styles.articleSheet, { backgroundColor: colors.background, borderTopWidth: BorderWidth.thick, borderTopColor: '#000' }]}>
          {!distractionFree && (
            <>
              <View style={[styles.sourceBadge, { backgroundColor: '#FFE600', borderColor: '#000', borderWidth: BorderWidth.normal }, Shadows.sm]}>
                <Text style={[styles.sourceText, { color: '#000' }]}>
                  {selectedArticle.source.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>{selectedArticle.title}</Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {new Date(selectedArticle.publishedAt).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </>
          )}
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: articleHtml }}
            baseStyle={
              distractionFree
                ? { ...styles.distractionBody, color: colors.text }
                : { ...styles.body, color: colors.text }
            }
            tagsStyles={{
              p: distractionFree ? styles.distractionParagraph : styles.paragraph,
              a: { color: colors.accent, fontWeight: '600', textDecorationLine: 'underline' },
              h1: { ...styles.heading, color: colors.text },
              h2: { ...styles.heading, color: colors.text },
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 64,
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  overlayControls: {
    position: 'absolute',
    top: 56,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlsRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.normal,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  articleSheet: {
    marginTop: -Spacing['2xl'],
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.xs,
    marginBottom: Spacing.md,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...Typography.h1,
    fontSize: 26,
    lineHeight: 32,
    marginBottom: Spacing.md,
  },
  meta: {
    ...Typography.caption,
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.xl,
  },
  body: {
    fontSize: 17,
    lineHeight: 28,
  },
  distractionBody: {
    fontSize: 19,
    lineHeight: 32,
  },
  paragraph: {
    marginBottom: 16,
  },
  distractionParagraph: {
    marginBottom: 20,
  },
  heading: {
    ...Typography.h2,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...Typography.h3,
  },
});
