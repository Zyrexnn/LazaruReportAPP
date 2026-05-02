import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import { supabase } from '@/src/services/supabase';
import { Colors, Spacing, Typography, Shadows, Radius, BorderWidth } from '@/constants/theme';
import { useThemeStore } from '@/src/store/useThemeStore';
import { Plus, Trash2, Edit2, LogOut, Users, Key, BarChart3, RefreshCw } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const STAR_PATH = "M24.9778 49C26.5743 49 27.8824 47.825 28.1041 46.162C30.299 31.3511 32.3167 29.2892 46.5513 27.6707C48.1918 27.4711 49.4557 26.0965 49.4557 24.5001C49.4557 22.8814 48.2141 21.5512 46.5733 21.3073C32.4276 19.334 30.6761 17.6045 28.1041 2.81596C27.8158 1.17521 26.552 0 24.9778 0C23.3594 0 22.0732 1.17521 21.8073 2.83801C19.6566 17.6268 17.639 19.6888 3.42667 21.3073C1.74159 21.5291 0.5 22.8594 0.5 24.5001C0.5 26.0965 1.69726 27.4268 3.38234 27.6707C17.5501 29.6883 19.2795 31.3955 21.8073 46.1843C22.1398 47.8471 23.4257 49 24.9778 49Z";

interface TokenEntry {
  id: string;
  username: string;
  token: string;
  is_admin: boolean;
  created_at: string;
  expires_at?: string | null;
}

export default function AdminDashboard() {
  const { themeName } = useThemeStore();
  const theme = Colors[themeName];
  const { user } = useAuthStore();
  
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [newUsername, setNewUsername] = useState('');
  const [newToken, setNewToken] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [validityDays, setValidityDays] = useState<number | 'lifetime'>('lifetime');

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('access_tokens')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTokens(data || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch tokens');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleAddToken = async () => {
    if (!newUsername || !newToken) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    let expires_at = null;
    if (validityDays !== 'lifetime') {
      const date = new Date();
      date.setDate(date.getDate() + validityDays);
      expires_at = date.toISOString();
    }

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('access_tokens')
          .update({ username: newUsername, token: newToken, expires_at })
          .eq('id', isEditing);
        
        if (error) throw error;
        Alert.alert('Success', 'Token updated successfully');
      } else {
        const { error } = await supabase
          .from('access_tokens')
          .insert([{ username: newUsername, token: newToken, is_admin: false, expires_at }]);
        
        if (error) throw error;
        Alert.alert('Success', 'Token added successfully');
      }
      
      setNewUsername('');
      setNewToken('');
      setIsEditing(null);
      setValidityDays('lifetime');
      fetchTokens();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err?.message || 'Operation failed');
    }
  };

  const handleDeleteToken = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this token?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('access_tokens')
                .delete()
                .eq('id', id);
              if (error) throw error;
              fetchTokens();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete token');
            }
          }
        }
      ]
    );
  };

  const startEdit = (item: TokenEntry) => {
    setNewUsername(item.username);
    setNewToken(item.token);
    setIsEditing(item.id);
    setValidityDays('lifetime');
  };

  const cancelEdit = () => {
    setNewUsername('');
    setNewToken('');
    setIsEditing(null);
    setValidityDays('lifetime');
  };

  const generateRandomToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewToken(result);
  };

  return (
    <View style={{ gap: Spacing.lg }}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#BEE3F8', borderColor: theme.borderStrong }, Shadows.md]}>
          <Users size={24} color="#2B6CB0" />
          <Text style={styles.statValue}>{tokens.length}</Text>
          <Text style={styles.statLabel}>TOTAL_USERS</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FED7E2', borderColor: theme.borderStrong }, Shadows.md]}>
          <Key size={24} color="#97266D" />
          <Text style={styles.statValue}>{tokens.filter(t => t.is_admin).length}</Text>
          <Text style={styles.statLabel}>ADMIN_KEYS</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEB2B2', borderColor: theme.borderStrong }, Shadows.md]}>
          <Users size={24} color="#C53030" />
          <Text style={styles.statValue}>
            {tokens.filter(t => t.expires_at && new Date(t.expires_at) < new Date()).length}
          </Text>
          <Text style={styles.statLabel}>EXPIRED_USERS</Text>
        </View>
      </View>

      <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderStrong }, Shadows.lg]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {isEditing ? 'EDIT_PROTOCOL' : 'GENERATE_NEW_ACCESS'}
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>IDENTIFIER (USERNAME)</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background }]}
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="USER_NAME..."
            placeholderTextColor={theme.textSecondary + '80'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ACCESS_TOKEN</Text>
          <View style={styles.tokenInputRow}>
            <TextInput
              style={[styles.input, { flex: 1, borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background }]}
              value={newToken}
              onChangeText={setNewToken}
              placeholder="TOKEN_STRING..."
              placeholderTextColor={theme.textSecondary + '80'}
            />
            <TouchableOpacity 
              style={[styles.actionIconBtn, { backgroundColor: theme.accentSoft, borderColor: theme.borderStrong }]}
              onPress={generateRandomToken}
            >
              <RefreshCw size={20} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ACTIVE PERIOD</Text>
          <View style={styles.periodRow}>
            {[ 
              { label: '30D', value: 30 },
              { label: '90D', value: 90 },
              { label: '1YR', value: 365 },
              { label: 'LIFETIME', value: 'lifetime' }
            ].map(period => (
              <TouchableOpacity
                key={period.label}
                style={[
                  styles.periodBtn,
                  { 
                    backgroundColor: validityDays === period.value ? theme.accent : theme.surfaceElevated,
                    borderColor: theme.borderStrong
                  }
                ]}
                onPress={() => setValidityDays(period.value as number | 'lifetime')}
              >
                <Text style={[
                  styles.periodBtnText, 
                  { color: validityDays === period.value ? theme.badgeText : theme.text }
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formActions}>
          {isEditing ? (
            <TouchableOpacity 
              style={[styles.formBtn, { backgroundColor: theme.muted, borderColor: theme.borderStrong }]}
              onPress={cancelEdit}
            >
              <Text style={[styles.formBtnText, { color: theme.textSecondary }]}>CANCEL</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity 
            style={[styles.formBtn, { flex: 1, backgroundColor: theme.accent, borderColor: theme.borderStrong }, Shadows.sm]}
            onPress={handleAddToken}
          >
            <Text style={[styles.formBtnText, { color: theme.text }]}>
              {isEditing ? 'UPDATE_DATABASE' : 'COMMIT_NEW_KEY'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.listCard, { backgroundColor: theme.surface, borderColor: theme.borderStrong }, Shadows.lg]}>
        <View style={styles.listHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>DATABASE_ENTRIES</Text>
          <TouchableOpacity onPress={fetchTokens}>
            <RefreshCw size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ margin: 20 }} color={theme.accent} />
        ) : (
          <View style={styles.table}>
            <View style={[styles.tableHeader, { borderBottomColor: theme.borderStrong }]}>
              <Text style={[styles.th, { flex: 2, color: theme.textSecondary }]}>USERNAME</Text>
              <Text style={[styles.th, { flex: 2, color: theme.textSecondary }]}>TOKEN</Text>
              <Text style={[styles.th, { flex: 2, color: theme.textSecondary }]}>EXPIRES</Text>
              <Text style={[styles.th, { flex: 1, color: theme.textSecondary, textAlign: 'right' }]}>OPS</Text>
            </View>
            {tokens.map((item) => {
              const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
              return (
                <View key={item.id} style={[styles.tableRow, { borderBottomColor: theme.borderStrong + '30' }]}>
                  <Text style={[styles.td, { flex: 2, color: theme.text }]} numberOfLines={1}>{item.username}</Text>
                  <Text style={[styles.td, { flex: 2, color: theme.accent, fontWeight: 'bold' }]} numberOfLines={1}>{item.token}</Text>
                  <Text style={[styles.td, { flex: 2, color: isExpired ? theme.error : theme.textSecondary, fontWeight: isExpired ? 'bold' : 'normal' }]} numberOfLines={1}>
                    {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'LIFETIME'}
                  </Text>
                  <View style={[styles.tdActions, { flex: 1 }]}>
                    <TouchableOpacity onPress={() => startEdit(item)}>
                      <Edit2 size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteToken(item.id)}>
                      <Trash2 size={16} color={theme.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            {tokens.length === 0 ? (
              <Text style={styles.emptyText}>NO_ENTRIES_FOUND</Text>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: Spacing.xs,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  formCard: {
    padding: Spacing.xl,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: Spacing.xs,
  },
  input: {
    height: 54,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.md,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  tokenInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionIconBtn: {
    width: 54,
    height: 54,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  formBtn: {
    height: 54,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formBtnText: {
    fontWeight: '900',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  listCard: {
    padding: Spacing.xl,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  td: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  tdActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    margin: 20,
    fontFamily: 'monospace',
    opacity: 0.5,
  },
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  periodBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  }
});
