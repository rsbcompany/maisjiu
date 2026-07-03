import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { textSizes } from '@/src/theme/typography';
import { motion } from '@/src/theme/motion';
import { space } from '@/src/theme/spacing';

/** Number of steps shown while the caption is collapsed. */
export const COLLAPSED_STEP_LIMIT = 2;
/** Caption max-height when collapsed (px), per `prototipo/design.md` §3. */
export const COLLAPSED_MAX_HEIGHT = 120;
/** Caption max-height when expanded (px), per `prototipo/design.md` §3. */
export const EXPANDED_MAX_HEIGHT = 360;

export interface ReelsCaptionProps {
  /** Origin position of the technique (e.g. "Meia-guarda"). */
  fromPosition?: string;
  /** One or more destination positions; joined with " / " when multiple. */
  toPositions?: string[];
  /** Ordered technique steps. */
  steps?: string[];
  /** Whether the caption is expanded to show every step. */
  expanded: boolean;
  /** Toggles the expanded state. */
  onToggle: () => void;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Expandable technique caption for the player (`prototipo/design.md` §3):
 * "De → Para" decomposition (accent only on the arrow), a numbered step list
 * collapsed to the first two steps, and a "Ver mais"/"Ver menos" toggle.
 * Renders nothing when no technique metadata is present (ADR-006).
 */
export function ReelsCaption({
  fromPosition,
  toPositions,
  steps,
  expanded,
  onToggle,
  testID,
}: ReelsCaptionProps) {
  const maxHeight = useCaptionHeight(expanded);
  const hasDecomp = !!fromPosition && !!toPositions?.length;
  const hasSteps = !!steps?.length;

  if (!hasDecomp && !hasSteps) return null;

  const visibleSteps = expanded ? steps : steps?.slice(0, COLLAPSED_STEP_LIMIT);
  const showToggle = !!steps && steps.length > COLLAPSED_STEP_LIMIT;

  return (
    <View testID={testID}>
      <Animated.View style={[styles.body, { maxHeight }]}>
        <ScrollView scrollEnabled={expanded} showsVerticalScrollIndicator={false}>
          {hasDecomp ? <ReelsDecomp fromPosition={fromPosition!} toPositions={toPositions!} /> : null}
          {hasSteps ? <ReelsSteps steps={visibleSteps!} /> : null}
        </ScrollView>
      </Animated.View>
      {showToggle ? <MoreButton expanded={expanded} onToggle={onToggle} /> : null}
    </View>
  );
}

function useCaptionHeight(expanded: boolean): Animated.AnimatedInterpolation<number> {
  const [anim] = useState(() => new Animated.Value(expanded ? 1 : 0));
  useEffect(() => startHeightAnimation(anim, expanded), [anim, expanded]);
  return anim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_MAX_HEIGHT, EXPANDED_MAX_HEIGHT],
  });
}

function startHeightAnimation(anim: Animated.Value, expanded: boolean): () => void {
  const animation = Animated.timing(anim, {
    toValue: expanded ? 1 : 0,
    duration: motion.base,
    easing: Easing.bezier(...motion.easeStandard),
    useNativeDriver: false,
  });
  animation.start();
  return () => animation.stop();
}

function ReelsDecomp({ fromPosition, toPositions }: { fromPosition: string; toPositions: string[] }) {
  return (
    <View style={styles.decomp} testID="reels-decomp">
      <Text style={styles.decompText} selectable={false}>
        De <Text style={styles.decompStrong}>{fromPosition}</Text>
      </Text>
      <Text style={styles.arrow} selectable={false} testID="reels-arrow">
        →
      </Text>
      <Text style={styles.decompText} selectable={false}>
        para <Text style={styles.decompStrong}>{toPositions.join(' / ')}</Text>
      </Text>
    </View>
  );
}

function ReelsSteps({ steps }: { steps: string[] }) {
  return (
    <View style={styles.steps} testID="reels-steps">
      {steps.map((step, index) => (
        <View key={`${index}-${step}`} style={styles.step} testID={`reels-step-${index}`}>
          <View style={styles.num}>
            <Text style={styles.numText} selectable={false}>
              {index + 1}
            </Text>
          </View>
          <Text style={styles.stepText} selectable={false}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
}

function MoreButton({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <Pressable
      testID="reels-more"
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      style={styles.more}
    >
      <Text style={styles.moreText} selectable={false}>
        {expanded ? 'Ver menos' : 'Ver mais'}
      </Text>
    </Pressable>
  );
}

const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.55)',
  textShadowOffset: { height: 1, width: 0 },
  textShadowRadius: 3,
} as const;

const styles = StyleSheet.create({
  body: {
    overflow: 'hidden',
  },
  decomp: {
    alignItems: 'center',
    columnGap: space[2],
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: space[2],
  },
  decompText: {
    ...textShadow,
    color: 'rgba(255,255,255,0.92)',
    fontSize: textSizes.sm,
  },
  decompStrong: {
    color: colors.white,
    fontWeight: '600',
  },
  arrow: {
    color: colors.accent,
    fontSize: textSizes.base,
    fontWeight: '600',
  },
  steps: {
    gap: space[2],
  },
  step: {
    columnGap: space[2],
    flexDirection: 'row',
  },
  num: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    marginTop: 1,
    width: 18,
  },
  numText: {
    color: colors.white,
    fontSize: textSizes.xs,
    fontWeight: '600',
  },
  stepText: {
    ...textShadow,
    color: 'rgba(255,255,255,0.92)',
    flex: 1,
    fontSize: textSizes.sm,
    lineHeight: textSizes.sm * 1.45,
  },
  more: {
    marginTop: space[1],
    paddingVertical: 2,
  },
  moreText: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: textSizes.sm,
    fontWeight: '500',
  },
});
