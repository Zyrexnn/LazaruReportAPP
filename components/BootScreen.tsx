import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, G, Rect } from 'react-native-svg';
import { useThemeStore } from '@/src/store/useThemeStore';
import { Colors, Typography, Radius } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface BootScreenProps {
  onFinish: () => void;
  isReady: boolean;
}

// SVG Path for the logo-star.svg
const STAR_PATH = "M24.9778 49C26.5743 49 27.8824 47.825 28.1041 46.162C30.299 31.3511 32.3167 29.2892 46.5513 27.6707C48.1918 27.4711 49.4557 26.0965 49.4557 24.5001C49.4557 22.8814 48.2141 21.5512 46.5733 21.3073C32.4276 19.334 30.6761 17.6045 28.1041 2.81596C27.8158 1.17521 26.552 0 24.9778 0C23.3594 0 22.0732 1.17521 21.8073 2.83801C19.6566 17.6268 17.639 19.6888 3.42667 21.3073C1.74159 21.5291 0.5 22.8594 0.5 24.5001C0.5 26.0965 1.69726 27.4268 3.38234 27.6707C17.5501 29.6883 19.2795 31.3955 21.8073 46.1843C22.1398 47.8471 23.4257 49 24.9778 49Z";

export const BootScreen = ({ onFinish, isReady }: BootScreenProps) => {
  const { themeName } = useThemeStore();
  const theme = Colors[themeName];

  // Animation values
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);
  const marqueeX = useSharedValue(0);
  const glitchY = useSharedValue(0);
  const logoProgress = useSharedValue(0);
  const boxWidth = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const [statusMessage, setStatusMessage] = useState('BOOTING...');
  const [isOnline, setIsOnline] = useState(true);

  const statusMessages = [
    'INIT_SYSTEM_KERNEL...',
    'UPLINKING_DATA_NODES...',
    'SYNC_MARKET_SENTIMENT...',
    'RENDERING_BENTO_GRID...',
    'DECRYPTING_ASSETS...',
    'READY_FOR_OPERATIONS.'
  ];

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (messageIndex < statusMessages.length - 1) {
        messageIndex++;
        setStatusMessage(statusMessages[messageIndex]);
      }
    }, 400);

    // Initial animations
    scale.value = withSpring(1, { damping: 12 });
    boxWidth.value = withDelay(300, withSpring(SCREEN_WIDTH * 0.85, { damping: 15 }));
    contentOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    marqueeX.value = withRepeat(
      withTiming(-SCREEN_WIDTH, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );

    glitchY.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 50 }),
        withTiming(-2, { duration: 50 }),
        withTiming(0, { duration: 50 }),
        withDelay(2000, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );

    const checkStatus = async () => {
      try {
        const response = await fetch('https://www.google.com', { method: 'HEAD', cache: 'no-cache' });
        setIsOnline(response.ok);
      } catch (e) {
        setIsOnline(false);
      }
    };

    checkStatus();

    // Set minimum display time
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearInterval(messageInterval);
    };
  }, []);

  // Separate effect to handle finishing when both conditions are met
  useEffect(() => {
    if (minTimeElapsed && isReady) {
      opacity.value = withTiming(0, { duration: 600 }, () => {
        runOnJS(onFinish)();
      });
    }
  }, [minTimeElapsed, isReady]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const marqueeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: marqueeX.value }],
  }));

  const boxStyle = useAnimatedStyle(() => ({
    width: boxWidth.value,
    transform: [{ translateY: glitchY.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, { backgroundColor: theme.background }, containerStyle]}>
      {/* Background Marquee */}
      <View style={styles.marqueeContainer}>
        <Animated.View style={[styles.marqueeInner, marqueeStyle]}>
          <Text style={[styles.marqueeText, { color: theme.text, opacity: 0.05 }]}>
            LAZARUS REPORT • INTEL • MARKETS • CRYPTO • SENTIMENT • LAZARUS REPORT • INTEL • MARKETS • CRYPTO • SENTIMENT • 
          </Text>
        </Animated.View>
      </View>

      {/* Decorative Rotating Stars */}
      <Animated.View style={[styles.decorStar, { top: 60, right: 40 }, logoStyle]}>
        <Svg width="40" height="40" viewBox="0 0 50 49">
          <Path d={STAR_PATH} fill={theme.accent} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.decorStar, { bottom: 80, left: 30 }, logoStyle]}>
        <Svg width="60" height="60" viewBox="0 0 50 49">
          <Path d={STAR_PATH} fill={theme.surfaceElevated} />
        </Svg>
      </Animated.View>

      {/* Central Content Box */}
      <Animated.View style={[styles.contentBox, { backgroundColor: theme.surface, borderColor: theme.borderStrong }, boxStyle]}>
        <View style={styles.topBar}>
          <View style={[styles.dot, { backgroundColor: '#FF5F56' }]} />
          <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
          <View style={[styles.dot, { backgroundColor: '#27C93F' }]} />
          <Text style={[styles.terminalTitle, { color: theme.textSecondary }]}>LR_OS_BOOT_v1.0.4</Text>
        </View>

        <Animated.View style={[styles.mainContent, textStyle]}>
          <View style={styles.logoRow}>
            <Animated.View style={logoStyle}>
              <Svg width="30" height="30" viewBox="0 0 50 49">
                <Path d={STAR_PATH} fill={theme.text} />
              </Svg>
            </Animated.View>
            <Text style={[styles.brandText, { color: theme.text }]}>LAZARUS REPORT</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.borderStrong }]} />
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: theme.accent }]}>{statusMessage}</Text>
            <Text style={[styles.netStatus, { color: isOnline ? theme.success : theme.error }]}>
              {isOnline ? '[ONLINE]' : '[OFFLINE]'}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { borderColor: theme.borderStrong }]}>
              <Animated.View style={[styles.progressFill, { backgroundColor: theme.accent, width: '75%' }]} />
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Static Brutalist Overlays */}
      <View style={[styles.cornerLabel, { top: 40, left: 20 }]}>
        <Text style={[styles.smallLabel, { color: theme.text }]}>SYS_01</Text>
      </View>
      <View style={[styles.cornerLabel, { bottom: 40, right: 20 }]}>
        <Text style={[styles.smallLabel, { color: theme.text }]}>©2024_INTEL_CORE</Text>
      </View>

      <View style={[styles.scanline, { backgroundColor: theme.text, opacity: 0.03 }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  marqueeContainer: {
    position: 'absolute',
    top: '30%',
    width: '200%',
    overflow: 'hidden',
    transform: [{ rotate: '-5deg' }],
  },
  marqueeInner: {
    flexDirection: 'row',
  },
  marqueeText: {
    fontSize: 80,
    fontWeight: '900',
    fontFamily: 'system-ui',
    whiteSpace: 'nowrap',
  },
  decorStar: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  contentBox: {
    borderWidth: 4,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 20,
    minHeight: 180,
  },
  topBar: {
    height: 32,
    borderBottomWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  terminalTitle: {
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  mainContent: {
    padding: 20,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: -1,
  },
  divider: {
    height: 4,
    width: '100%',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  netStatus: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    height: 12,
    borderWidth: 2,
    padding: 2,
  },
  progressFill: {
    height: '100%',
  },
  cornerLabel: {
    position: 'absolute',
  },
  smallLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  scanline: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
});
