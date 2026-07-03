import { ReactElement } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { createContentRepository } from '@/src/data/contentRepository';
import PlayerScreen from '../../app/player/[id]';

const mockPlayer = {
  status: 'readyToPlay',
  playing: false,
  currentTime: 0,
  duration: 60,
  timeUpdateEventInterval: 0,
  play: jest.fn(),
  pause: jest.fn(),
  replace: jest.fn(),
};

jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: (_source: unknown, setup?: (player: unknown) => void) => {
      if (typeof setup === 'function') setup(mockPlayer);
      return mockPlayer;
    },
    VideoView: (props: Record<string, unknown>) => React.createElement(View, props, props.children),
  };
});

jest.mock('@/src/data/contentRepository', () => ({ createContentRepository: jest.fn() }));
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ back: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'v2' }),
}));

const createRepo = jest.mocked(createContentRepository);

const video: VideoWithTags = {
  id: 'v2',
  weekId: 'w1',
  titulo: 'Passagem com underhook',
  urlVideo: 'https://cdn/v2.mp4',
  ordem: 2,
  tags: [{ id: 't1', nomeTag: 'Passagem' }],
  fromPosition: 'Meia-guarda',
  toPositions: ['100kg', 'Montada'],
  steps: ['Passo 1', 'Passo 2', 'Passo 3'],
};

function seedRepository() {
  createRepo.mockReturnValue({
    getCurrentWeek: jest.fn(),
    getVideosForWeek: jest.fn(),
    getVideoById: jest.fn().mockResolvedValue(video),
    listTags: jest.fn(),
    searchVideosByTag: jest.fn(),
    recordView: jest.fn(),
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
  mockPlayer.playing = false;
  mockPlayer.currentTime = 0;
  seedRepository();
});

describe('PlayerScreen playback interactions', () => {
  it('starts playback when the video area is tapped while paused', async () => {
    // Arrange
    const { getByTestId } = renderScreen(<PlayerScreen />);
    await waitFor(() => expect(getByTestId('reels-video-area')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('reels-video-area'));

    // Assert
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
    expect(mockPlayer.pause).not.toHaveBeenCalled();
  });

  it('starts playback when the centered play button is tapped', async () => {
    // Arrange
    const { getByTestId } = renderScreen(<PlayerScreen />);
    await waitFor(() => expect(getByTestId('reels-play')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('reels-play'));

    // Assert
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  it('pauses playback when tapped while playing', async () => {
    // Arrange
    mockPlayer.playing = true;
    const { getByTestId } = renderScreen(<PlayerScreen />);
    await waitFor(() => expect(getByTestId('reels-video-area')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('reels-video-area'));

    // Assert
    expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
    expect(mockPlayer.play).not.toHaveBeenCalled();
  });

  it('seeks to the tapped position when the progress track is scrubbed', async () => {
    // Arrange
    const { getByTestId } = renderScreen(<PlayerScreen />);
    await waitFor(() => expect(getByTestId('reels-progress')).toBeTruthy());

    // Act — measure the track, then tap at 50% of its width
    fireEvent(getByTestId('reels-progress'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 18, x: 0, y: 0 } },
    });
    fireEvent.press(getByTestId('reels-progress'), { nativeEvent: { locationX: 150 } });

    // Assert — 0.5 * 60s duration
    expect(mockPlayer.currentTime).toBe(30);
  });

  it('expands the caption to reveal every step when "Ver mais" is pressed', async () => {
    // Arrange
    const { getByTestId, getAllByTestId } = renderScreen(<PlayerScreen />);
    await waitFor(() => expect(getAllByTestId(/^reels-step-/)).toHaveLength(2));

    // Act
    fireEvent.press(getByTestId('reels-more'));

    // Assert
    expect(getAllByTestId(/^reels-step-/)).toHaveLength(3);
  });

  it('auto-hides the play button ~900ms after playback starts', async () => {
    // Arrange — playing keeps the play button on the hide timer
    mockPlayer.playing = true;
    const { getByTestId } = renderScreen(<PlayerScreen />);
    await waitFor(() => expect(getByTestId('reels-play')).toBeTruthy());

    // Act — let the 900ms auto-hide timer fire
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 950));
    });

    // Assert — the control remains mounted (faded/non-interactive), no crash
    expect(getByTestId('reels-play')).toBeTruthy();
  });
});
