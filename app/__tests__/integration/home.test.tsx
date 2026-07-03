import { ReactElement } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Tag } from '@/src/data/Tag';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import type { Week } from '@/src/data/Week';
import { createContentRepository } from '@/src/data/contentRepository';
import { getProfileName } from '@/src/data/getProfileName';
import { normalizeText } from '@/src/lib/normalizeText';
import HomeScreen from '../../app/(tabs)/index';

jest.mock('@/src/data/contentRepository', () => ({ createContentRepository: jest.fn() }));
jest.mock('@/src/data/getProfileName', () => ({ getProfileName: jest.fn() }));

const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: mockNavigate }),
}));

const createRepo = jest.mocked(createContentRepository);
const getName = jest.mocked(getProfileName);

const week: Week = {
  id: 'w1',
  tituloSemana: 'Passagem da meia-guarda',
  dataInicio: '2026-06-29',
  dataFim: '2026-07-05',
};

const tags: Tag[] = [
  { id: 't1', nomeTag: 'Passagem' },
  { id: 't2', nomeTag: 'Meia-guarda' },
];

function makeVideo(id: string): VideoWithTags {
  return {
    id,
    weekId: 'w1',
    titulo: `Técnica ${id}`,
    urlVideo: `https://cdn/${id}.mp4`,
    ordem: Number(id.replace('v', '')),
    tags: [{ id: 't1', nomeTag: 'Passagem' }],
  };
}

const fiveVideos = ['v1', 'v2', 'v3', 'v4', 'v5'].map(makeVideo);

function seedRepository(videos: VideoWithTags[], getCurrentWeek = jest.fn().mockResolvedValue(week)) {
  createRepo.mockReturnValue({
    getCurrentWeek,
    getVideosForWeek: jest.fn().mockResolvedValue(videos),
    listTags: jest.fn().mockResolvedValue(tags),
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
  getName.mockResolvedValue('Rafael');
});

describe('HomeScreen data flow', () => {
  it('renders one card per seeded week video', async () => {
    // Arrange
    seedRepository(fiveVideos);

    // Act
    const { getAllByTestId } = renderScreen(<HomeScreen />);

    // Assert
    await waitFor(() => expect(getAllByTestId(/^video-card-/)).toHaveLength(5));
  });

  it('navigates to the player route when a card is tapped', async () => {
    // Arrange
    seedRepository(fiveVideos);
    const { getByTestId } = renderScreen(<HomeScreen />);
    await waitFor(() => expect(getByTestId('video-card-v1')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('video-card-v1'));

    // Assert
    expect(mockPush).toHaveBeenCalledWith('/player/v1');
  });

  it('navigates to search with a normalized tag when a chip is tapped', async () => {
    // Arrange
    seedRepository(fiveVideos);
    const { getByTestId } = renderScreen(<HomeScreen />);
    await waitFor(() => expect(getByTestId('home-chip-t2')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('home-chip-t2'));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/search',
      params: { tag: normalizeText('Meia-guarda') },
    });
  });

  it('shows the loading skeleton while the fetch is pending', () => {
    // Arrange — a never-resolving fetch keeps the screen in the loading state
    seedRepository(fiveVideos, jest.fn(() => new Promise(() => {})));

    // Act
    const { getByTestId } = renderScreen(<HomeScreen />);

    // Assert
    expect(getByTestId('home-skeleton')).toBeTruthy();
  });
});
