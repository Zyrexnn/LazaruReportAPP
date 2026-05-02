import { BentoConfig, BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { useIsOffline } from '@/hooks/use-network-status';
import { OfflineGate } from '@/components/OfflineGate';
import { sendMessageToLazarusWowo, ChatMessage, AIModel } from '@/src/services/aiApi';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
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
  const [selectedModel, setSelectedModel] = useState<AIModel>('local');
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
      const response = await sendMessageToLazarusWowo(userMessage, messages, selectedModel);
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

  const FormattedMessage = ({ content, isModel }: { content: string, isModel: boolean }) => {
    const textColor = isModel ? colors.text : '#FFF';

    // 1. First, separate code blocks from the rest of the content
    const blocks = content.split(/(```[\s\S]*?```)/g);

    return (
      <View style={styles.formattedContainer}>
        {blocks.map((block, bIdx) => {
          // If it's a code block
          if (block.startsWith('```')) {
            const codeContent = block.replace(/```(\w+)?\n?/, '').replace(/```$/, '').trim();
            return (
              <View key={bIdx} style={[styles.codeBlock, { backgroundColor: isDark ? '#111' : '#F5F5F5', borderColor: colors.borderStrong }]}>
                <View style={styles.codeHeader}>
                  <Terminal size={10} color={colors.textSecondary} />
                  <Text style={[styles.codeHeaderText, { color: colors.textSecondary }]}>CODE BLOCK</Text>
                </View>
                <Text style={[styles.codeText, { color: isDark ? '#00FF66' : '#008000' }]}>{codeContent}</Text>
              </View>
            );
          }

          // Otherwise, parse paragraphs and lists
          const paragraphs = block.split('\n\n');
          return paragraphs.map((para, pIdx) => {
            if (!para.trim()) return null;
            const lines = para.split('\n');

            return (
              <View key={`${bIdx}-${pIdx}`} style={styles.paragraphContainer}>
                {lines.map((line, lIdx) => {
                  const trimmedLine = line.trim();
                  const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
                  const isNumbered = /^\d+\.\s/.test(trimmedLine);
                  
                  // Simple indentation for lists
                  const paddingLeft = isBullet || isNumbered ? 12 : 0;
                  
                  // Inline parsing: **bold**, `code`, [link](url)
                  const parts = line.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);

                  return (
                    <View key={lIdx} style={[styles.lineWrapper, { paddingLeft }]}>
                      {(isBullet || isNumbered) && (
                        <Text style={[styles.listIndicator, { color: colors.accent }]}>
                          {isBullet ? '•' : trimmedLine.match(/^\d+\./)?.[0]}
                        </Text>
                      )}
                      <Text style={[
                        styles.messageText,
                        { color: textColor },
                        (isBullet || isNumbered) && styles.listItemText
                      ]}>
                        {parts.map((part, partIdx) => {
                          // Bold
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                              <Text key={partIdx} style={[styles.boldText, { color: isModel ? colors.accent : '#FFF' }]}>
                                {part.slice(2, -2)}
                              </Text>
                            );
                          }
                          // Inline code
                          if (part.startsWith('`') && part.endsWith('`')) {
                            return (
                              <Text key={partIdx} style={[styles.inlineCode, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: colors.accent }]}>
                                {` ${part.slice(1, -1)} `}
                              </Text>
                            );
                          }
                          // Link: [text](url)
                          const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                          if (linkMatch) {
                            return (
                              <Text 
                                key={partIdx} 
                                style={styles.linkText}
                                onPress={() => Linking.openURL(linkMatch[2])}
                              >
                                {linkMatch[1]}
                              </Text>
                            );
                          }
                          
                          // Clean up bullet/numbered prefixes from the text part
                          let cleanPart = part;
                          if (lIdx === 0 && (isBullet || isNumbered)) {
                             cleanPart = part.replace(/^[-*]\s/, '').replace(/^\d+\.\s/, '');
                          }
                          
                          return cleanPart;
                        })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          });
        })}
      </View>
    );
  };

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
          <FormattedMessage content={item.content} isModel={isModel} />
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
      
      <OfflineGate isOffline={isOffline} message="Connection lost. The AI assistant requires an active connection to process news data.">
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
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>ANALYZING NEWS TRENDS...</Text>
              </View>
            ) : <View style={{ height: 40 }} />
          }
        />

        <View style={[styles.modelSelector, { borderTopColor: colors.borderStrong }]}>
          {(['local', 'glm', 'gemini', 'deepseek'] as AIModel[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setSelectedModel(m)}
              style={[
                styles.modelTab,
                { 
                  backgroundColor: selectedModel === m ? colors.accent : colors.surface,
                  borderColor: colors.borderStrong,
                },
                selectedModel === m && Shadows.sm
              ]}
            >
              <Text style={[
                styles.modelTabText,
                { color: selectedModel === m ? '#FFF' : colors.textSecondary }
              ]}>
                {m === 'local' ? 'Lazarus (L)' : m.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

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
              placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Ask about the market..."}
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
  formattedContainer: {
    marginTop: 4,
  },
  paragraphContainer: {
    marginBottom: 12,
  },
  lineWrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  listItemWrapper: {
    paddingLeft: 4,
  },
  listIndicator: {
    fontSize: 15,
    marginRight: 8,
    fontWeight: '900',
  },
  listItemText: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  boldText: {
    fontWeight: '900',
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '800',
    borderRadius: 4,
  },
  codeBlock: {
    marginVertical: 10,
    padding: 12,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.medium,
    ...Shadows.sm,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 4,
  },
  codeHeaderText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontWeight: '800',
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
  },
  modelSelector: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: BorderWidth.thick,
  },
  modelTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelTabText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});
