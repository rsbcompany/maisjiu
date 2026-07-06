import { useState, useCallback } from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/colors';
import { textSizes } from '@/src/theme/typography';
import { radius, space } from '@/src/theme/spacing';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** When true, renders the input with a danger border. */
  error?: boolean;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Single-line text input matching `prototipo/design.md` §3.
 *
 * - Default border is `colors.border`; focused border switches to the accent.
 * - Error state overrides the border with `colors.danger`.
 * - Uses the prototype's 48px min-height and 6px radius.
 */
export function Input({
  error = false,
  placeholderTextColor = colors.meta,
  onFocus,
  onBlur,
  testID,
  accessibilityLabel,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(
    (event: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (event: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur]
  );

  return (
    <TextInput
      {...textInputProps}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      placeholderTextColor={placeholderTextColor}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[
        styles.input,
        isFocused && !error && styles.focused,
        error && styles.error,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.fg,
    fontSize: textSizes.base,
    minHeight: 48,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    width: '100%',
  },
  focused: {
    borderColor: colors.accent,
  },
  error: {
    borderColor: colors.danger,
  },
});
