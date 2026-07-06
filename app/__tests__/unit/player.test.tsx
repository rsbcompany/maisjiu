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

const createRepo = jest.mocked(createContentRepository);

function seedRepository(getVideoById: jest.Mock) {
  createRepo.mockReturnValue({
    getCurrentWeek: jest.fn(),
    getVideosForWeek: jest.fn(),
    getVideoById,
    listTags: jest.fn(),
    searchVideosByTag: jest.fn(),
    recordView: jest.fn(),
  } as never);
}

const initialMetrics = {
  frame: { x: 0, y: 0, width: 412, height: 915 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderScreen(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={initialMetrics}>{ui}</SafeAreaProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PlayerScreen states', () => {
  it('shows the loading state while the video fetch is pending', () => {
    // Arrange — a never-resolving fetch keeps the screen loading
    seedRepository(jest.fn(() => new Promise<VideoWithTags | null>(() => {})));

    // Act
    const { getByTestId } = renderScreen(<PlayerScreen />);

    // Assert
    expect(getByTestId('player-loading')).toBeTruthy();
  });

  it('shows the data error state when the video is not found', async () => {
    // Arrange
    seedRepository(jest.fn().mockResolvedValue(null));

    // Act
    const { getByTestId } = renderScreen(<PlayerScreen />);

    // Assert
    await waitFor(() => expect(getByTestId('player-data-error')).toBeTruthy());
  });
});
