import { useEffect, useState } from 'react';
import { Animated, DimensionValue, Easing, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/colors';
import { radius as radii } from '@/src/theme/spacing';
import { motion } from '@/src/theme/motion';

const PULSE_DURATION = 700;
const PULSE_MIN = 0.35;
const PULSE_MAX = 0.7;

export interface SkeletonProps {
  /** Box width. */
  width: DimensionValue;
  /** Box height. */
  height: DimensionValue;
  /** Corner radius. Defaults to the card radius. */
  radius?: number;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Pulsing placeholder box for loading states (`prototipo/design.md` §3
 * `<Skeleton>`). Uses an opacity loop as a lightweight shimmer approximation.
 */
export function Skeleton({ width, height, radius = radii.md, testID }: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(PULSE_MIN));

  useEffect(() => startPulse(opacity), [opacity]);

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="progressbar"
      style={[styles.box, { width, height, borderRadius: radius, opacity }]}
    />
  );
}

function startPulse(opacity: Animated.Value): () => void {
  const loop = Animated.loop(
    Animated.sequence([toValue(opacity, PULSE_MAX), toValue(opacity, PULSE_MIN)])
  );
  loop.start();
  return () => loop.stop();
}

function toValue(opacity: Animated.Value, value: number) {
  return Animated.timing(opacity, {
    toValue: value,
    duration: PULSE_DURATION,
    easing: Easing.bezier(...motion.easeStandard),
    useNativeDriver: true,
  });
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.border,
  },
});
