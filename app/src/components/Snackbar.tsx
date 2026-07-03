import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { colors } from '@/src/theme/colors';
import { textSizes } from '@/src/theme/typography';
import { motion } from '@/src/theme/motion';
import { layout, radius, space } from '@/src/theme/spacing';

export interface SnackbarProps {
  /** Message displayed inside the snackbar. */
  message: string;
  /** Controls visibility. */
  visible: boolean;
  /** Auto-hide duration in milliseconds. Defaults to `motion.snackbarDuration`. */
  duration?: number;
  /** Called when the snackbar finishes auto-hiding. */
  onDismiss?: () => void;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Slide-up snackbar matching `prototipo/design.md` §3.
 *
 * - Slides up + fades in over `motion.base` ms.
 * - Auto-hides after `duration` ms.
 * - Positioned above the bottom navigation bar.
 */
export function Snackbar({
  message,
  visible,
  duration = motion.snackbarDuration,
  onDismiss,
  testID,
}: SnackbarProps) {
  const [translateY] = useState(() => new Animated.Value(120));
  const [opacity] = useState(() => new Animated.Value(0));
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    const targetTranslateY = visible ? 0 : 120;
    const targetOpacity = visible ? 1 : 0;

    Animated.timing(translateY, {
      toValue: targetTranslateY,
      duration: motion.base,
      easing: Easing.bezier(...motion.easeStandard),
      useNativeDriver: true,
    }).start();

    Animated.timing(opacity, {
      toValue: targetOpacity,
      duration: motion.base,
      easing: Easing.bezier(...motion.easeStandard),
      useNativeDriver: true,
    }).start();

    if (visible) {
      hideTimerRef.current = setTimeout(() => {
        onDismiss?.();
      }, duration);
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [visible, duration, onDismiss, translateY, opacity]);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      pointerEvents="none"
    >
      <Text style={styles.message} selectable={false}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: colors.fg,
    borderRadius: radius.pill,
    bottom: layout.navBarHeight + space[4],
    elevation: 4,
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 30,
  },
  message: {
    color: colors.textOnDark,
    fontSize: textSizes.sm,
  },
});
