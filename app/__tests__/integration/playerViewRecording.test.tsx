import { ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { createContentRepository } from '@/src/data/contentRepository';
import PlayerScreen from '../../app/player/[id]';

jest.mock('@/src/data/contentRepository', () => ({ createContentRepository: jest.fn() }));

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ back: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'v2' }),
}));

jest.mock('@/src/components/Snackbar', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Snackbar: ({ message, visible, testID }: { message: string; visible: boolean; testID?: string }) =>
      visible ? React.createElement(Text, { testID }, message) : null,
  };
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated.timing = () => ({ start: () => {}, stop: () => {} });
  return RN;
});

let mockProgress = 0;
/** Tiny duration so the helper treats single progress jumps as continuous playback.
 * Realistic scrub detection is covered by unit tests for `shouldRecordView`. */
let mockDuration = 0.1;

jest.mock('@/src/hooks/usePlaybackProgress', () => ({
  usePlaybackProgress: () => ({
    player: {
      status: 'readyToPlay',
      playing: false,
      currentTime: mockProgress * mockDuration,
      duration: mockDuration,
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
    },
    status: 'readyToPlay',
    isPlaying: true,
    currentTime: mockProgress * mockDuration,
    duration: mockDuration,
    progress: mockProgress,
    retry: jest.fn(),
  }),
}));

const createRepo = jest.mocked(createContentRepository);

function makeVideo(overrides: Partial<VideoWithTags> = {}): VideoWithTags {
  return {
    id: 'v2',
    weekId: 'w1',
    titulo: 'Passagem com underhook',
    urlVideo: 'https://cdn/v2.mp4',
    ordem: 2,
    tags: [{ id: 't1', nomeTag: 'Passagem' }],
    fromPosition: 'Meia-guarda',
    toPositions: ['100kg', 'Montada'],
    steps: ['Passo 1', 'Passo 2', 'Passo 3'],
    ...overrides,
  };
}

function seedRepository(getVideoById: jest.Mock, recordView: jest.Mock = jest.fn()) {
  createRepo.mockReturnValue({
    getCurrentWeek: jest.fn(),
    getVideosForWeek: jest.fn(),
    getVideoById,
    listTags: jest.fn(),
    searchVideosByTag: jest.fn(),
    recordView,
  } as never);
}

const initialMetrics = {
  frame: { x: 0, y: 0, width: 412, height: 915 },
  insets: { top: 24, left: 0, right: 0, bottom: 16 },
};

function renderScreen(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={initialMetrics}>{ui}</SafeAreaProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockProgress = 0;
  mockDuration = 0.1;
  Object.defineProperty(globalThis, '__DEV__', { value: false, configurable: true });
});

describe('PlayerScreen view recording', () => {
  it('calls recordView once when playback crosses 50%', async () => {
    // Arrange
    const recordView = jest.fn();
    seedRepository(jest.fn().mockResolvedValue(makeVideo()), recordView);
    mockProgress = 0.6;

    // Act
    renderScreen(<PlayerScreen />);

    // Assert
    await waitFor(() => expect(recordView).toHaveBeenCalledTimes(1));
    expect(recordView).toHaveBeenCalledWith('v2');
  });

  it('does not call recordView while playback stays below 50%', async () => {
    // Arrange
    const recordView = jest.fn();
    seedRepository(jest.fn().mockResolvedValue(makeVideo()), recordView);
    mockProgress = 0.3;

    // Act
    renderScreen(<PlayerScreen />);

    // Assert
    await waitFor(() => expect(recordView).not.toHaveBeenCalled());
  });

  it('shows the dev-only snackbar when a view is recorded', async () => {
    // Arrange
    Object.defineProperty(globalThis, '__DEV__', { value: true, configurable: true });
    const recordView = jest.fn().mockResolvedValue(undefined);
    seedRepository(jest.fn().mockResolvedValue(makeVideo()), recordView);
    mockProgress = 0.6;

    // Act
    const { getByTestId } = renderScreen(<PlayerScreen />);

    // Assert
    await waitFor(() => expect(getByTestId('player-view-snackbar')).toBeTruthy());
  });

  it('logs the error and keeps the player alive when recordView is rejected', async () => {
    // Arrange
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const recordView = jest.fn().mockRejectedValue(new Error('RLS denied'));
    seedRepository(jest.fn().mockResolvedValue(makeVideo()), recordView);
    mockProgress = 0.6;

    // Act
    const { getByTestId } = renderScreen(<PlayerScreen />);

    // Assert — player remains rendered and error is logged, not thrown
    await waitFor(() => expect(getByTestId('reels-stage')).toBeTruthy());
    await waitFor(() => expect(recordView).toHaveBeenCalledTimes(1));
    expect(consoleError).toHaveBeenCalledWith('[Player] Failed to record view:', expect.any(Error));

    consoleError.mockRestore();
  });
});
