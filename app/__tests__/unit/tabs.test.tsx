import { renderRouter } from 'expo-router/testing-library';
import TabLayout from '../../app/(tabs)/_layout';
import HomeScreen from '../../app/(tabs)/index';
import SearchScreen from '../../app/(tabs)/search';

describe('TabLayout', () => {
  it('defines exactly two tabs: Início and Buscar', () => {
    const { getByLabelText, getAllByLabelText } = renderRouter(
      {
        '(tabs)/_layout': TabLayout,
        '(tabs)/index': HomeScreen,
        '(tabs)/search': SearchScreen,
      },
      { initialUrl: '/(tabs)' }
    );

    expect(getByLabelText(/Início, tab/)).toBeTruthy();
    expect(getByLabelText(/Buscar, tab/)).toBeTruthy();
    expect(getAllByLabelText(/, tab, \d of 2/)).toHaveLength(2);
  });
});
