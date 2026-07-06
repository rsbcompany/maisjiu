import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { textSizes } from '@/src/theme/typography';
import { space } from '@/src/theme/spacing';
import { SearchIcon } from './icons/SearchIcon';

export interface StateViewProps {
  /** Visual variant. */
  variant: 'empty' | 'loading' | 'error';
  /** Title text. */
  title: string;
  /** Optional description paragraph. */
  description?: string;
  /** Optional custom icon node. Defaults to a search icon for empty/error. */
  icon?: ReactNode;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Empty / loading / error state matching `prototipo/design.md` §3 (`<State>`).
 *
 * Centers an icon, title and optional description with muted styling.
 */
export function StateView({
  variant,
  title,
  description,
  icon,
  testID,
}: StateViewProps) {
  const defaultIcon = variant === 'loading' ? undefined : <SearchIcon size={48} color={colors.border} strokeWidth={1.4} />;

  return (
    <View style={styles.container} testID={testID}>
      {icon ?? defaultIcon}
      <Text style={styles.title} selectable={false}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.description} selectable={false}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: space[3],
    justifyContent: 'center',
    paddingHorizontal: space[4],
    paddingVertical: space[12],
  },
  title: {
    color: colors.fg,
    fontSize: textSizes.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    fontSize: textSizes.sm,
    textAlign: 'center',
  },
});
