import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import { supabase } from '@/src/services/supabase';
import { Colors, Spacing, Typography, Shadows, Radius, BorderWidth } from '@/constants/theme';
import { useThemeStore } from '@/src/store/useThemeStore';
import { User, Key, Save, LogOut, Shield, Settings, LayoutDashboard } from 'lucide-react-native';
import AdminDashboard from '@/components/AdminDashboard';

export default function ProfileScreen() {
  const { themeName } = useThemeStore();
  const theme = Colors[themeName];
  const { user, setUser, logout } = useAuthStore();
  
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdateUsername = async () => {
    if (!newUsername || newUsername === user?.username) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('access_tokens')
        .update({ username: newUsername })
        .eq('id', user?.id);

      if (error) throw error;

      setUser({ ...user!, username: newUsername });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {user?.is_admin ? 'Admin Profile' : 'Settings'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.accent }]}>
          {user?.is_admin ? 'SUPERUSER MANAGEMENT' : 'ACCOUNT MANAGEMENT'}
        </Text>
      </View>

      <View style={styles.bentoGrid}>
        {/* Profile Card */}
        <View style={[styles.bentoCard, { backgroundColor: theme.surface, borderColor: theme.borderStrong }, Shadows.md]}>
          <View style={styles.cardHeader}>
            <User size={20} color={theme.accent} strokeWidth={3} />
            <Text style={[styles.cardLabel, { color: theme.text }]}>DISPLAY NAME</Text>
          </View>
          
          <TextInput
            style={[styles.input, { borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background }]}
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Username"
            placeholderTextColor={theme.textSecondary}
          />

          <Pressable 
            style={({ pressed }) => [
              styles.actionBtn, 
              { backgroundColor: theme.accent, borderColor: theme.borderStrong },
              !pressed && Shadows.sm,
              pressed && styles.btnPressed
            ]}
            onPress={handleUpdateUsername}
            disabled={updating || newUsername === user?.username}
          >
            {updating ? <ActivityIndicator size="small" color={theme.badgeText} /> : (
              <>
                <Save size={18} color={theme.badgeText} strokeWidth={3} />
                <Text style={[styles.btnText, { color: theme.badgeText }]}>SAVE CHANGES</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Security Card */}
        <View style={[styles.bentoCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderStrong }, Shadows.md]}>
          <View style={styles.cardHeader}>
            <Shield size={20} color={'#000'} strokeWidth={3} />
            <Text style={[styles.cardLabel, { color: '#000' }]}>ACCESS TOKEN</Text>
          </View>
          
          <View style={[styles.tokenBox, { backgroundColor: theme.surface, borderColor: theme.borderStrong }]}>
            <Key size={16} color={theme.accent} strokeWidth={3} />
            <Text style={[styles.tokenText, { color: theme.text }]}>{user?.token}</Text>
          </View>
          
          <Text style={[styles.disclaimer, { color: '#000' }]}>
            This token is your unique access key. Keep it secure.
          </Text>
        </View>

        {user?.is_admin ? <AdminDashboard /> : null}

        {/* Logout */}
        <Pressable 
          style={({ pressed }) => [
            styles.logoutCard, 
            { backgroundColor: theme.error, borderColor: theme.borderStrong },
            !pressed && Shadows.md,
            pressed && styles.btnPressed
          ]}
          onPress={logout}
        >
          <LogOut size={24} color={'#FFF'} strokeWidth={3} />
          <Text style={[styles.logoutText, { color: '#FFF' }]}>LOG OUT</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>LAZARUS REPORT v1.2</Text>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    ...Typography.display,
    fontSize: 42,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  bentoGrid: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  bentoCard: {
    padding: Spacing.xl,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  input: {
    height: 54,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
  },
  btnPressed: {
    transform: [{ translateX: 4 }, { translateY: 4 }],
    shadowOpacity: 0,
  },
  btnText: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  tokenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
    marginBottom: Spacing.sm,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  disclaimer: {
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.8,
    marginTop: 4,
  },
  logoutCard: {
    height: 80,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  adminCard: {
    height: 80,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  adminText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
