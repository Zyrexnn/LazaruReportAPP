import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNewsStore } from '@/src/store/useNewsStore';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';

export default function NewsDetailScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { selectedArticle } = useNewsStore();
  const [distractionFree, setDistractionFree] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Article unavailable.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={
            selectedArticle.imageUrl ||
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop'
          }
          contentFit="cover"
          cachePolicy="memory-disk"
          style={styles.heroImage}
        />
        <View style={styles.overlayControls}>
          <Pressable style={[styles.iconButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255,255,255,0.9)' }]} onPress={() => router.back()}>
            <ChevronLeft size={20} color={colors.text} strokeWidth={1.5} />
          </Pressable>
          <Pressable style={[styles.iconButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255,255,255,0.9)' }]} onPress={() => setDistractionFree((value) => !value)}>
            {distractionFree ? <Eye size={18} color={colors.text} strokeWidth={1.5} /> : <EyeOff size={18} color={colors.text} strokeWidth={1.5} />}
          </Pressable>
        </View>

        <View style={[styles.articleSheet, { backgroundColor: colors.background }]}>
          {!distractionFree ? (
            <>
              <Text style={[styles.source, { color: colors.icon }]}>{selectedArticle.source}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{selectedArticle.title}</Text>
              <Text style={[styles.meta, { color: colors.icon }]}>
                {new Date(selectedArticle.publishedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </>
          ) : null}
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: articleHtml }}
            baseStyle={distractionFree ? [styles.distractionBody, { color: colors.text }] : [styles.body, { color: colors.text }]}
            tagsStyles={{
              p: distractionFree ? styles.distractionParagraph : styles.paragraph,
              a: [styles.link, { color: colors.accent }],
              h1: [styles.heading, { color: colors.text }],
              h2: [styles.heading, { color: colors.text }],
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
    height: 300,
  },
  overlayControls: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleSheet: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  source: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  meta: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 20,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
  },
  distractionBody: {
    fontSize: 19,
    lineHeight: 30,
  },
  paragraph: {
    marginBottom: 16,
  },
  distractionParagraph: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  link: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
});
