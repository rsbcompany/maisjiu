import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { fontWeights, textSizes } from '@/src/theme/typography';
import { radius, space } from '@/src/theme/spacing';
import { Caption } from './Caption';

export interface WeekCardProps {
  /** Week title (e.g. "Passagem da meia-guarda"). */
  weekTitle: string;
  /** Formatted date range (e.g. "29 jun – 05 jul"). */
  weekDate: string;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Highlighted "Semana Atual" card at the top of the home screen, matching
 * `prototipo/design.md` §3 (`WeekCard`): caption + title + date range.
 */
export function WeekCard({ weekTitle, weekDate, testID }: WeekCardProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Caption>Semana Atual</Caption>
      <Text style={styles.title} selectable={false}>
        {weekTitle}
      </Text>
      <Text style={styles.date} selectable={false}>
        {weekDate}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginVertical: space[4],
    padding: space[5],
  },
  title: {
    color: colors.fg,
    fontSize: textSizes.xl,
    fontWeight: fontWeights.semibold,
    marginBottom: space[1],
  },
  date: {
    color: colors.muted,
    fontSize: textSizes.sm,
  },
});
