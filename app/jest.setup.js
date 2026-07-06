import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-symbols', () => ({
  SymbolView: 'SymbolView',
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('expo', () => {
  const actual = jest.requireActual('expo');
  return {
    ...actual,
    useEvent: (_source, _eventName, initialValue) => initialValue ?? {},
  };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { LinearGradient: (props) => React.createElement(View, props, props.children) };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { BlurView: (props) => React.createElement(View, props, props.children) };
});

jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  const useVideoPlayer = (source, setup) => {
    const uri = typeof source === 'string' ? source : (source && source.uri) || '';
    const isError = uri === '' || uri.includes('broken');
    const player = {
      status: isError ? 'error' : 'readyToPlay',
      playing: false,
      currentTime: 0,
      duration: 60,
      loop: false,
      muted: false,
      timeUpdateEventInterval: 0,
      play: jest.fn(),
      pause: jest.fn(),
      replace: jest.fn(),
      replay: jest.fn(),
      seekBy: jest.fn(),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      release: jest.fn(),
    };
    if (typeof setup === 'function') setup(player);
    return player;
  };
  return {
    useVideoPlayer,
    VideoView: (props) => React.createElement(View, props, props.children),
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/src/lib/supabase', () => {
  const createQueryBuilder = () => {
    const emptyResult = { data: null, error: null };
    const builder = {};
    ['select', 'lte', 'gte', 'order', 'limit', 'eq', 'in', 'insert'].forEach((method) => {
      builder[method] = jest.fn(() => builder);
    });
    builder.maybeSingle = jest.fn(() => Promise.resolve(emptyResult));
    builder.then = (resolve) => Promise.resolve(emptyResult).then(resolve);
    return builder;
  };

  return {
    supabase: {
      from: jest.fn(() => createQueryBuilder()),
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
        signInWithPassword: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      },
    },
  };
});
