import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { radius, space } from '@/src/theme/spacing';
import { textSizes } from '@/src/theme/typography';
import { SearchIcon } from './icons/SearchIcon';

export interface SearchHeaderProps {
  /** Current input value. */
  value: string;
  /** Called when the query text changes. */
  onChangeText: (value: string) => void;
  /** Optional placeholder. */
  placeholder?: string;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Sticky search header with a pill-shaped input wrap, matching
 * `prototipo/design.md` §3 (`<SearchHeader>`).
 */
export function SearchHeader({
  value,
  onChangeText,
  placeholder = 'Buscar por tag (ex: Passagem)',
  testID = 'search-header',
}: SearchHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.inputWrap}>
        <SearchIcon size={18} color={colors.muted} strokeWidth={1.8} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.meta}
          accessibilityRole="search"
          accessibilityLabel="Buscar por tag"
          testID={`${testID}-input`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space[2],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  input: {
    color: colors.fg,
    flex: 1,
    fontSize: textSizes.base,
    minHeight: 32,
  },
});
