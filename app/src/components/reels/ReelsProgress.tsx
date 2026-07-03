import { useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '@/src/theme/colors';

/** Height of the visible progress track (px). */
const TRACK_HEIGHT = 3;
/** Height of the touch area wrapping the track (px), per `design.md` §3. */
const TOUCH_HEIGHT = 18;

export interface ReelsProgressProps {
  /** Playback progress as a fraction between 0 and 1. */
  progress: number;
  /** Called with the tapped ratio (0–1) when the user scrubs the track. */
  onScrub: (ratio: number) => void;
  /** Optional test ID. */
  testID?: string;
}

/** Clamps a value to the inclusive [0, 1] range. */
export function clampRatio(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * White progress bar with tap-to-scrub (`prototipo/design.md` §3). The fill is
 * intentionally white — the pink accent is reserved for the "De → Para" arrow.
 */
export function ReelsProgress({ progress, onScrub, testID }: ReelsProgressProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const ratio = clampRatio(progress);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (trackWidth <= 0) return;
    onScrub(clampRatio(event.nativeEvent.locationX / trackWidth));
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      onLayout={handleLayout}
      accessibilityRole="adjustable"
      accessibilityLabel="Progresso do vídeo"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      style={styles.touchArea}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} testID="reels-progress-fill" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    height: TOUCH_HEIGHT,
    justifyContent: 'flex-end',
    width: '100%',
  },
  track: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 2,
    height: TRACK_HEIGHT,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: colors.white,
    height: '100%',
  },
});
