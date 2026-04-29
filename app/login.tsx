import { BorderWidth, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const STAR_PATH = "M24.9778 49C26.5743 49 27.8824 47.825 28.1041 46.162C30.299 31.3511 32.3167 29.2892 46.5513 27.6707C48.1918 27.4711 49.4557 26.0965 49.4557 24.5001C49.4557 22.8814 48.2141 21.5512 46.5733 21.3073C32.4276 19.334 30.6761 17.6045 28.1041 2.81596C27.8158 1.17521 26.552 0 24.9778 0C23.3594 0 22.0732 1.17521 21.8073 2.83801C19.6566 17.6268 17.639 19.6888 3.42667 21.3073C1.74159 21.5291 0.5 22.8594 0.5 24.5001C0.5 26.0965 1.69726 27.4268 3.38234 27.6707C17.5501 29.6883 19.2795 31.3955 21.8073 46.1843C22.1398 47.8471 23.4257 49 24.9778 49Z";

export default function LoginScreen() {
  const router = useRouter();
  const { themeName } = useThemeStore();
  const theme = Colors[themeName];
  const setUser = useAuthStore(state => state.setUser);
  
  const [token, setToken] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (isAdminMode) {
      if (adminUsername === 'ikhsan' && adminPassword === '0721') {
        setUser({
          id: 'admin',
          username: 'ikhsan',
          token: 'ADMIN_SESSION',
          is_admin: true
        });
      } else {
        Alert.alert('Access Denied', 'Invalid admin credentials');
      }
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Please enter your access token');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        Alert.alert('Access Denied', 'Invalid token. Please check your credentials.');
      } else {
        setUser({
          id: data.id,
          username: data.username,
          token: data.token,
          is_admin: data.is_admin || false
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.logoBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderStrong }]}>
          <Svg width="40" height="40" viewBox="0 0 50 49">
            <Path d={STAR_PATH} fill={theme.text} />
          </Svg>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>LAZARUS_OS</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isAdminMode ? 'ADMIN_ACCESS_OVERRIDE' : 'SECURE_ACCESS_PROTOCOL'}
        </Text>
      </View>

      <View style={[styles.loginCard, { backgroundColor: theme.surface, borderColor: theme.borderStrong }, Shadows.lg]}>
        <View style={[styles.cardHeader, { borderBottomColor: theme.borderStrong }]}>
          <View style={[styles.dot, { backgroundColor: '#FF5F56' }]} />
          <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
          <View style={[styles.dot, { backgroundColor: '#27C93F' }]} />
          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>{isAdminMode ? 'SUDO_AUTH' : 'AUTH_V2.0'}</Text>
        </View>

        <View style={styles.cardContent}>
          {!isAdminMode ? (
            <>
              <Text style={[styles.label, { color: theme.text }]}>ACCESS_TOKEN</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background }]}
                placeholder="ENTER_TOKEN_HERE..."
                placeholderTextColor={theme.textSecondary}
                value={token}
                onChangeText={setToken}
                secureTextEntry
                autoCapitalize="none"
              />
            </>
          ) : (
            <>
              <Text style={[styles.label, { color: theme.text }]}>ADMIN_ID</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background }]}
                placeholder="USERNAME..."
                placeholderTextColor={theme.textSecondary}
                value={adminUsername}
                onChangeText={setAdminUsername}
                autoCapitalize="none"
              />
              <Text style={[styles.label, { color: theme.text }]}>PASSWORD</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background }]}
                placeholder="••••••••"
                placeholderTextColor={theme.textSecondary}
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry
              />
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: isAdminMode ? theme.error : theme.accent, borderColor: theme.borderStrong }, Shadows.md]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.text }]}>
                {isAdminMode ? 'OVERRIDE_LOGIN' : 'EXECUTE_LOGIN'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.modeSwitch}
            onPress={() => setIsAdminMode(!isAdminMode)}
          >
            <Text style={[styles.modeSwitchText, { color: theme.textSecondary }]}>
              {isAdminMode ? '← USE_TOKEN_ACCESS' : 'ADMIN_OVERRIDE_LOGIN →'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {'>'} {isAdminMode ? 'ADMIN_CREDENTIALS_REQUIRED' : 'NO_ACCOUNT? CONTACT_ADMIN'}
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {'>'} ENCRYPTION: AES_256_ACTIVE
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>©2026 LAZARUS_REPORT_CORE</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoBox: {
    width: 80,
    height: 80,
    borderWidth: BorderWidth.brutalist,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.display.fontSize,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: Spacing.xs,
  },
  loginCard: {
    borderWidth: BorderWidth.brutalist,
    borderRadius: 0,
  },
  cardHeader: {
    height: 40,
    borderBottomWidth: BorderWidth.normal,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginLeft: Spacing.sm,
  },
  cardContent: {
    padding: Spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: Spacing.sm,
    fontFamily: 'monospace',
  },
  input: {
    height: 56,
    borderWidth: BorderWidth.normal,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: Spacing.xl,
  },
  loginButton: {
    height: 60,
    borderWidth: BorderWidth.brutalist,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modeSwitch: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  modeSwitchText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    textDecorationLine: 'underline',
  },
  infoBox: {
    marginTop: Spacing.xl,
  },
  infoText: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: Spacing.xs,
  },
  footer: {
    marginTop: Spacing['4xl'],
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
