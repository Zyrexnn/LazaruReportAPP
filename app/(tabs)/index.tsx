import { StyleSheet, FlatList, View } from 'react-native';
import { NewsCard } from '@/components/NewsCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MOCK_NEWS } from '@/constants/MockData';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={MOCK_NEWS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <ThemedText type="title" style={styles.appTitle}>
              LAZARUS <ThemedText type="title" style={{ color: colors.gold }}>REPORT</ThemedText>
            </ThemedText>
            <ThemedText style={styles.subtitle}>INTELLIGENCE & ANALYSIS</ThemedText>
          </View>
        )}
        renderItem={({ item }) => (
          <NewsCard 
            item={item} 
            onPress={() => {
              router.push({
                pathname: '/news/[id]',
                params: { id: item.id }
              });
            }} 
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 4,
    opacity: 0.7,
    marginTop: 4,
  },
});

