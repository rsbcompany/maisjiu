import { Text, View } from 'react-native';
import { renderRouter } from 'expo-router/testing-library';
import RootLayout from '../../app/_layout';
import LoginScreen from '../../app/login';

function Placeholder() {
  return (
    <View>
      <Text>placeholder</Text>
    </View>
  );
}

describe('RootLayout', () => {
  it('exports without error and redirects to login when unauthenticated', async () => {
    const { findByText, getPathname } = renderRouter(
      {
        _layout: RootLayout,
        login: LoginScreen,
        '(tabs)/_layout': Placeholder,
        '(tabs)/index': Placeholder,
        '(tabs)/search': Placeholder,
        'player/[id]': Placeholder,
      },
      { initialUrl: '/login' }
    );

    expect(await findByText('Mais Jiu')).toBeTruthy();
    expect(getPathname()).toBe('/login');
  });
});
