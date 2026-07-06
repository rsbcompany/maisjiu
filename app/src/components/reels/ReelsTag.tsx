import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/src/theme/colors';
import { textSizes } from '@/src/theme/typography';
import { radius } from '@/src/theme/spacing';

export interface ReelsTagProps {
  /** Tag label rendered inside the pill. */
  label: string;
  /** Called when the pill is pressed (navigates to the tag search feed). */
  onPress: (label: string) => void;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Clickable tag pill for the immersive player, styled for legibility over
 * video (`prototipo/design.md` §3, `ReelsTag`): translucent white fill and
 * border with white text.
 */
export function ReelsTag({ label, onPress, testID }: ReelsTagProps) {
  return (
    <Pressable
      testID={testID}
      onPress={() => onPress(label)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
    >
      <Text style={styles.label} selectable={false}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: colors.white,
    fontSize: textSizes.xs,
  },
});
