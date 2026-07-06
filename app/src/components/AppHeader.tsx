import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { fontWeights, textSizes, tracking } from '@/src/theme/typography';
import { layout, space } from '@/src/theme/spacing';
import { IconButton } from './IconButton';
import { Caption } from './Caption';
import { SearchIcon } from './icons/SearchIcon';

export interface AppHeaderProps {
  /** Time-of-day greeting caption (e.g. "Bom dia"). */
  greeting: string;
  /** Student display name shown as the header title. */
  name: string;
  /** Called when the search icon button is pressed. */
  onSearchPress: () => void;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Home variant of the app header from `prototipo/design.md` §3 / `home.html`:
 * greeting caption + name title on the left, search icon button on the right.
 */
export function AppHeader({ greeting, name, onSearchPress, testID }: AppHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.text}>
        <Caption>{`${greeting},`}</Caption>
        <Text style={styles.title} selectable={false} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <IconButton
        icon={<SearchIcon size={22} color={colors.fg} />}
        ariaLabel="Buscar"
        onPress={onSearchPress}
        testID="app-header-search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: space[3],
    height: layout.headerHeight,
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
  },
  text: {
    flex: 1,
  },
  title: {
    color: colors.fg,
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
    letterSpacing: tracking.heading,
  },
});
