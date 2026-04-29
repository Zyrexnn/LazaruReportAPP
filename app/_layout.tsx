import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { BootScreen } from '@/components/BootScreen';
import { useIsDark } from '@/hooks/use-color-scheme';
import { initializeDatabase } from '@/src/services/db';
import { useAuthStore } from '@/src/store/useAuthStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export const queryClient = new QueryClient();

export default function RootLayout() {
  const isDark = useIsDark();
  const [isBooting, setIsBooting] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  
  const { isAuthenticated, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initializeDatabase().catch(() => undefined);
    
    const prefetchData = async () => {
      try {
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
        console.log('Prefetch failed');
      } finally {
        setIsDataReady(true);
      }
    };
    
    prefetchData();
  }, []);

  useEffect(() => {
    // Only redirect after boot is done
    if (isBooting) return;

    const isLoginPage = segments[0] === 'login';

    if (!isAuthenticated) {
      if (!isLoginPage) {
        router.replace('/login');
      }
    } else if (isAuthenticated) {
      if (isLoginPage) {
        if (user?.is_admin) {
          router.replace('/admin');
        } else {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, segments, isBooting]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
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
