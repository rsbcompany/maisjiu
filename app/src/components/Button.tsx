import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';
import { colors } from '@/src/theme/colors';
import { fontWeights, textSizes } from '@/src/theme/typography';
import { radius } from '@/src/theme/spacing';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Button copy. */
  children: React.ReactNode;
  /** Visual style. `primary` is the charcoal CTA; `ghost` is the secondary style. */
  variant?: 'primary' | 'ghost';
  /** Whether the button should fill its parent width. */
  block?: boolean;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Pressable button matching `prototipo/design.md` §3.
 *
 * - Primary uses the charcoal `fg` background, never the pink accent.
 * - Active state shifts the button down 1px and lowers opacity to 0.85.
 * - Always uses `Pressable` (not `TouchableOpacity`).
 */
export function Button({
  children,
  variant = 'primary',
  block = false,
  disabled = false,
  testID,
  accessibilityLabel,
  ...pressableProps
}: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? children : undefined)}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        block && styles.block,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          isPrimary ? styles.labelPrimary : styles.labelGhost,
          disabled && styles.labelDisabled,
        ]}
        selectable={false}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primary: {
    backgroundColor: colors.fg,
    borderColor: colors.fg,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: 1,
  },
  block: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ translateY: 1 }],
  },
  label: {
    fontSize: textSizes.base,
    fontWeight: fontWeights.semibold,
  },
  labelPrimary: {
    color: colors.textOnDark,
  },
  labelGhost: {
    color: colors.fg,
  },
  labelDisabled: {
    opacity: 0.7,
  },
});
