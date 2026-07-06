import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { textSizes } from '@/src/theme/typography';
import { space } from '@/src/theme/spacing';

export interface FieldProps {
  /** Field label displayed above the input. */
  label: string;
  /** Error message. When provided, the helper text is shown and the child input
   * should be rendered with `error` set. */
  error?: string;
  /** The input control (typically `<Input />`). */
  children: ReactNode;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Form field wrapper matching `prototipo/design.md` §3.
 *
 * Renders a label above the input and reserves vertical space for an optional
 * error helper so the layout does not jump when an error appears.
 */
export function Field({ label, error, children, testID }: FieldProps) {
  const hasError = Boolean(error);

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label} selectable={false}>
        {label}
      </Text>
      {children}
      <Text
        style={[styles.helper, hasError && styles.helperError]}
        accessibilityLiveRegion="polite"
        selectable={false}
      >
        {error ?? ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: space[2],
    width: '100%',
  },
  label: {
    color: colors.muted,
    fontSize: textSizes.sm,
  },
  helper: {
    color: colors.danger,
    fontSize: textSizes.sm,
    minHeight: 18,
  },
  helperError: {
    color: colors.danger,
  },
});
