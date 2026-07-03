import { ReactElement } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { createContentRepository } from '@/src/data/contentRepository';
import { normalizeText } from '@/src/lib/normalizeText';
import PlayerScreen from '../../app/player/[id]';

jest.mock('@/src/data/contentRepository', () => ({ createContentRepository: jest.fn() }));

const mockBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ back: mockBack, navigate: mockNavigate }),
  useLocalSearchParams: () => ({ id: 'v2' }),
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
  insets: { top: 24, left: 0, right: 0, bottom: 16 },
};

function renderScreen(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={initialMetrics}>{ui}</SafeAreaProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PlayerScreen', () => {
  it('loads video v2 from the route param and shows its title', async () => {
    // Arrange
    seedRepository(jest.fn().mockResolvedValue(makeVideo()));

    // Act
    const { getByTestId } = renderScreen(<PlayerScreen />);

    // Assert
    await waitFor(() => expect(getByTestId('reels-title')).toHaveTextContent('Passagem com underhook'));
  });

  it('navigates to search with the normalized tag when a tag pill is pressed', async () => {
    // Arrange
    seedRepository(jest.fn().mockResolvedValue(makeVideo()));
    const { getByTestId } = renderScreen(<PlayerScreen />);
    await waitFor(() => expect(getByTestId('reels-tag-t1')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('reels-tag-t1'));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/search',
      params: { tag: normalizeText('Passagem') },
    });
  });

  it('returns to the previous screen when the back control is pressed', async () => {
    // Arrange
    seedRepository(jest.fn().mockResolvedValue(makeVideo()));
    const { getByTestId } = renderScreen(<PlayerScreen />);
    await waitFor(() => expect(getByTestId('reels-back')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('reels-back'));

    // Assert
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('shows the error state with a retry action for a broken video URL', async () => {
    // Arrange — the expo-video mock reports status "error" for URLs containing "broken"
    seedRepository(jest.fn().mockResolvedValue(makeVideo({ urlVideo: 'https://cdn/broken.mp4' })));

    // Act
    const { getByTestId } = renderScreen(<PlayerScreen />);

    // Assert
    await waitFor(() => expect(getByTestId('player-video-error')).toBeTruthy());
    fireEvent.press(getByTestId('player-retry'));
    expect(getByTestId('player-retry')).toBeTruthy();
  });

  it('shows the data error state with retry when the fetch fails', async () => {
    // Arrange
    seedRepository(jest.fn().mockRejectedValue(new Error('offline')));

    // Act
    const { getByTestId } = renderScreen(<PlayerScreen />);

    // Assert
    await waitFor(() => expect(getByTestId('player-data-error')).toBeTruthy());
    expect(getByTestId('player-retry')).toBeTruthy();
  });
});
