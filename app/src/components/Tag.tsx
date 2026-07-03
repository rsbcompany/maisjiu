import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { textSizes } from '@/src/theme/typography';
import { radius } from '@/src/theme/spacing';

export interface TagProps {
  /** Chip label. */
  label: string;
  /** Selected/filled state. */
  active?: boolean;
  /** Visual variant. `accent` is reserved for future use; default is the
   * standard cream outline chip. */
  variant?: 'default' | 'accent';
  /** Called when the chip is pressed. When omitted, the chip renders as a
   * non-interactive span. */
  onPress?: () => void;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Tag chip matching `prototipo/design.md` §3.
 *
 * - Default: transparent background, muted text, `colors.border` border.
 * - Active: filled charcoal (`colors.fg`) background with `colors.textOnDark` text.
 * - Accent variant is defined but not currently used in the prototype.
 * - Uses `Pressable` when interactive.
 */
export function Tag({
  label,
  active = false,
  variant = 'default',
  onPress,
  testID,
}: TagProps) {
  const isAccent = variant === 'accent';

  const textStyle = [
    styles.label,
    active && styles.labelActive,
    isAccent && !active && styles.labelAccent,
  ];

  const baseContainerStyle = [
    styles.base,
    active && styles.active,
    isAccent && !active && styles.accent,
  ];

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={label}
        style={({ pressed }) => [...baseContainerStyle, pressed && styles.pressed]}
      >
        <Text style={textStyle} selectable={false}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={baseContainerStyle}>
      <Text style={textStyle} selectable={false}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  active: {
    backgroundColor: colors.fg,
    borderColor: colors.fg,
  },
  accent: {
    backgroundColor: 'rgba(255,77,141,0.10)',
    borderColor: 'rgba(255,77,141,0.24)',
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: colors.muted,
    fontSize: textSizes.xs,
  },
  labelActive: {
    color: colors.textOnDark,
  },
  labelAccent: {
    color: colors.accent,
  },
});
