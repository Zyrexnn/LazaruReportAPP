import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useIsDark } from '@/hooks/use-color-scheme';
import { initializeDatabase } from '@/src/services/db';
import { BootScreen } from '@/components/BootScreen';
import { useState } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Export queryClient if needed elsewhere
export const queryClient = new QueryClient();

export default function RootLayout() {
  const isDark = useIsDark();
  const [isBooting, setIsBooting] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    initializeDatabase().catch(() => undefined);
    
    const prefetchData = async () => {
      try {
        // Prefetch multiple critical queries
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ['news-feed'],
            queryFn: () => import('@/src/services/newsApi').then(m => m.fetchUnifiedNews()),
          }),
          queryClient.prefetchQuery({
            queryKey: ['market-snapshot'],
            queryFn: () => import('@/src/services/newsApi').then(m => m.fetchMarketSnapshot()),
          })
        ]);
      } catch (e) {
        console.log('Prefetch failed, probably offline');
      } finally {
        setIsDataReady(true);
      }
    };
    
    prefetchData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="news/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="market/[symbol]" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {isBooting && (
          <BootScreen 
            isReady={isDataReady} 
            onFinish={() => setIsBooting(false)} 
          />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
