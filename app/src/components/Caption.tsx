import { StyleSheet, Text, TextStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { fonts, textSizes, tracking } from '@/src/theme/typography';

export interface CaptionProps {
  /** Caption text. */
  children: React.ReactNode;
  /** Optional additional style. */
  style?: TextStyle;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Caption typography helper matching `prototipo/design.md` §3.
 *
 * Mono font, uppercase, small size, muted color and a slight positive
 * letter-spacing. Used for "SEMANA ATUAL", durations and technical labels.
 */
export function Caption({ children, style, testID }: CaptionProps) {
  return (
    <Text testID={testID} style={[styles.caption, style]} selectable={false}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  caption: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: textSizes.xs,
    letterSpacing: tracking.caption,
    textTransform: 'uppercase',
  },
});
