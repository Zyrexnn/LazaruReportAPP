import { BentoConfig, BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { useIsOffline } from '@/hooks/use-network-status';
import { OfflineGate } from '@/components/OfflineGate';
import { sendMessageToLazarusWowo, ChatMessage } from '@/src/services/aiApi';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Send, Terminal, User, Clock, AlertCircle } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withRepeat, 
  withSequence, 
  withTiming,
  Easing
} from 'react-native-reanimated';

const COOLDOWN_SECONDS = 5;

export default function AIScreen() {
  const colors = useThemeColors();
  const isDark = useIsDark();
  const isOffline = useIsOffline();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "LazarusWowo Intel Core online. State your objective. I have processed current market sentiment and global headlines for your disposal.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const flashListRef = useRef<FlashList<ChatMessage>>(null);

  // Animation for the AI asset
  const floatAnim = useSharedValue(0);
  useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const aiIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  // Cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || cooldown > 0) return;

    const userMessage = input.trim();
    const newUserMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);
    setCooldown(COOLDOWN_SECONDS);
    Keyboard.dismiss();

    try {
      const response = await sendMessageToLazarusWowo(userMessage, messages);
      const modelMsg: ChatMessage = {
        role: 'model',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        role: 'model',
        content: "ERROR: FAILED TO EXTRACT ALPHA. CONNECTION BREACHED.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages, isLoading]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isModel = item.role === 'model';
    return (
      <View style={[
        styles.messageWrapper,
        isModel ? styles.modelWrapper : styles.userWrapper
      ]}>
        <View style={[
          styles.messageBox,
          {
            backgroundColor: isModel ? colors.surface : colors.accent,
            borderColor: colors.borderStrong,
            alignSelf: isModel ? 'flex-start' : 'flex-end',
          },
          !isModel && Shadows.md
        ]}>
          <View style={styles.messageHeader}>
            {isModel ? (
              <Terminal size={12} color={colors.accent} strokeWidth={2.5} />
            ) : (
              <User size={12} color="#FFF" strokeWidth={2.5} />
            )}
            <Text style={[
              styles.messageRole,
              { color: isModel ? colors.textSecondary : '#FFF' }
            ]}>
              {isModel ? 'LAZARUSWOWO' : 'OPERATOR'}
            </Text>
          </View>
          <Text style={[
            styles.messageText,
            { color: isModel ? colors.text : '#FFF' }
          ]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* ── Header ────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dateText, { color: colors.accent }]}>AI INTEL AGENT</Text>
            <Text style={[styles.mainTitle, { color: colors.text }]}>LazarusWowo</Text>
          </View>
          <Animated.View style={aiIconStyle}>
             <Image 
              source={require('@/assets/assets/idea.svg')}
              style={styles.aiAsset}
              contentFit="contain"
            />
          </Animated.View>
        </View>

        <View style={[styles.statusBento, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#00FF66' }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>NEURAL CORE: OPTIMIZED</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
             <Clock size={12} color={colors.textSecondary} />
             <Text style={[styles.statusText, { color: colors.textSecondary }]}>COOLDOWN: {cooldown}S</Text>
          </View>
        </View>
      </View>
      
      <OfflineGate isOffline={isOffline} message="Neural link severed. The AI core requires an active uplink to process market intelligence.">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlashList
          ref={flashListRef}
          data={messages}
          renderItem={renderMessage}
          estimatedItemSize={100}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>ANALYZING MARKET VECTORS...</Text>
              </View>
            ) : <View style={{ height: 40 }} />
          }
        />

        {/* ── Input Area ─────────────────────────────────────────── */}
        <View style={[styles.inputArea, { backgroundColor: colors.background, borderTopColor: colors.borderStrong }]}>
          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: colors.surface, 
              borderColor: colors.borderStrong,
              opacity: cooldown > 0 ? 0.7 : 1
            }
          ]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Request market intelligence..."}
              placeholderTextColor={colors.textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              editable={!isLoading && cooldown === 0}
            />
            <Pressable 
              onPress={handleSend}
              disabled={isLoading || !input.trim() || cooldown > 0}
              style={[
                styles.sendBtn, 
                { 
                  backgroundColor: (isLoading || !input.trim() || cooldown > 0) ? colors.muted : colors.accent,
                  borderColor: colors.borderStrong
                }
              ]}
            >
              <Send size={18} color="#FFF" strokeWidth={2.5} />
            </Pressable>
          </View>
          {cooldown > 0 && (
            <View style={styles.cooldownOverlay}>
              <AlertCircle size={10} color={colors.accent} />
              <Text style={[styles.cooldownText, { color: colors.accent }]}>RATE LIMIT ACTIVE</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      </OfflineGate>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: BentoConfig.paddingH,
    paddingTop: 60,
    paddingBottom: Spacing.md,
    borderBottomWidth: BorderWidth.thick,
    borderBottomColor: '#000',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  mainTitle: {
    ...Typography.display,
    fontSize: 38,
    lineHeight: 42,
  },
  aiAsset: {
    width: 60,
    height: 60,
  },
  statusBento: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 12,
  },
  listContent: {
    padding: Spacing.lg,
  },
  messageWrapper: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  modelWrapper: {
    alignItems: 'flex-start',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  messageBox: {
    maxWidth: '85%',
    padding: Spacing.md,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  messageRole: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.md,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  inputArea: {
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 110 : 100, // Significantly increase to clear floating navbar (bottom: 34 + height: 60)
    borderTopWidth: BorderWidth.thick,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    gap: 8,
    ...Shadows.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    maxHeight: 100,
    paddingHorizontal: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  cooldownOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  cooldownText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  }
});
