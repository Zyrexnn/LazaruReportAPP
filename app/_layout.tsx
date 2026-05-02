import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
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
  const [isMounted, setIsMounted] = useState(false);
  
  const { isAuthenticated, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hard-kill timer for web: if booting isn't done in 4 seconds, force it.
  useEffect(() => {
    if (Platform.OS === 'web') {
      const timer = setTimeout(() => {
        if (isBooting) {
          console.log('Web: Forced boot exit');
          setIsBooting(false);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isBooting]);

  useEffect(() => {
    initializeDatabase().catch(() => undefined);
    
    const prefetchData = async () => {
      // Offline handling: skip prefetch if no internet to avoid hangs
      if (Platform.OS === 'web' && !navigator.onLine) {
        console.log('Device is offline, skipping prefetch');
        setIsDataReady(true);
        return;
      }

      try {
        const fetchPromise = Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ['news-feed'],
            queryFn: () => import('@/src/services/newsApi').then(m => m.fetchUnifiedNews()),
          }),
          queryClient.prefetchQuery({
            queryKey: ['market-snapshot'],
            queryFn: () => import('@/src/services/newsApi').then(m => m.fetchMarketSnapshot()),
          })
        ]);

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Prefetch timeout')), 8000)
        );

        await Promise.race([fetchPromise, timeoutPromise]);
      } catch (e) {
        console.log('Prefetch failed or timed out:', e);
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
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, segments, isBooting]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="admin/index" options={{ headerShown: false }} />
          <Stack.Screen name="news/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="market/[symbol]" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {isMounted && isBooting && (
          <BootScreen 
            isReady={isDataReady} 
            onFinish={() => {
              console.log('Boot finished');
              setIsBooting(false);
            }} 
          />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
