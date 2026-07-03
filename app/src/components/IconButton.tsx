import { Pressable, PressableProps, StyleSheet } from 'react-native';
import { layout, radius } from '@/src/theme/spacing';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Icon node (typically an SVG component from `@/src/components/icons`). */
  icon: React.ReactNode;
  /** Accessible label for the button. */
  ariaLabel: string;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Circular icon button with a guaranteed 44×44 touch target.
 *
 * Matches `prototipo/design.md` §3 (`btn-icon` / `reels-icon`).
 * Always uses `Pressable`.
 */
export function IconButton({
  icon,
  ariaLabel,
  disabled = false,
  testID,
  ...pressableProps
}: IconButtonProps) {
  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={ariaLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: layout.thumb,
    justifyContent: 'center',
    minHeight: layout.thumb,
    minWidth: layout.thumb,
    width: layout.thumb,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
