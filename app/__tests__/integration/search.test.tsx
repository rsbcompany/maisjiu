import { ReactElement } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Tag } from '@/src/data/Tag';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { createContentRepository } from '@/src/data/contentRepository';
import { normalizeTag } from '@/src/utils/normalizeTag';
import SearchScreen from '../../app/(tabs)/search';

jest.mock('@/src/data/contentRepository', () => ({ createContentRepository: jest.fn() }));

const mockPush = jest.fn();
const mockUseLocalSearchParams = jest.fn(() => ({}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: jest.fn() }),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

const createRepo = jest.mocked(createContentRepository);

const tags: Tag[] = [
  { id: 't1', nomeTag: 'Passagem' },
  { id: 't2', nomeTag: 'Meia-guarda' },
  { id: 't3', nomeTag: 'Finalização' },
  { id: 't4', nomeTag: 'Montada' },
  { id: 't5', nomeTag: 'Guarda' },
  { id: 't6', nomeTag: 'Defesa' },
  { id: 't7', nomeTag: 'Raspagem' },
  { id: 't8', nomeTag: 'Estrangulamento' },
  { id: 't9', nomeTag: 'Pesada' },
  { id: 't10', nomeTag: 'Costas' },
];

function makeVideo(id: string, title: string, tagNames: string[]): VideoWithTags {
  return {
    id,
    weekId: 'w1',
    titulo: title,
    urlVideo: `https://cdn/${id}.mp4`,
    ordem: Number(id.replace('v', '')),
    tags: tagNames.map((name) => tags.find((t) => t.nomeTag === name) ?? { id: name, nomeTag: name }),
  };
}

const allVideos: VideoWithTags[] = [
  makeVideo('v1', 'Passagem básica da meia', ['Passagem', 'Meia-guarda']),
  makeVideo('v2', 'Passagem com underhook', ['Passagem', 'Meia-guarda']),
  makeVideo('v3', 'Estabilização no 100kg', ['Passagem', 'Pesada']),
  makeVideo('v4', 'Finalização da montada', ['Finalização', 'Montada']),
];

function seedRepository(searchResults: VideoWithTags[]) {
  createRepo.mockReturnValue({
    getCurrentWeek: jest.fn(),
    getVideosForWeek: jest.fn(),
    getVideoById: jest.fn(),
    listTags: jest.fn().mockResolvedValue(tags),
    searchVideosByTag: jest.fn().mockResolvedValue(searchResults),
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

function advanceDebounce() {
  act(() => {
    jest.advanceTimersByTime(400);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockUseLocalSearchParams.mockReturnValue({});
});

afterEach(() => {
  jest.useRealTimers();
});

describe('SearchScreen', () => {
  it('shows the tag vocabulary as chips', async () => {
    // Arrange
    seedRepository(allVideos);

    // Act
    const { getByTestId } = renderScreen(<SearchScreen />);
    advanceDebounce();

    // Assert
    await waitFor(() => expect(getByTestId('search-chip-t1')).toBeTruthy());
    expect(getByTestId('search-chip-t10')).toBeTruthy();
  });

  it('pre-fills the query from the tag route param and highlights the matching chip', async () => {
    // Arrange
    seedRepository(allVideos.slice(0, 3));
    mockUseLocalSearchParams.mockReturnValue({ tag: normalizeTag('Passagem') });

    // Act
    const { getByDisplayValue, getByTestId } = renderScreen(<SearchScreen />);
    advanceDebounce();

    // Assert
    await waitFor(() => expect(getByDisplayValue('passagem')).toBeTruthy());
    expect(getByTestId('search-chip-t1').props.accessibilityState.selected).toBe(true);
  });

  it('loads the filtered feed after the debounce', async () => {
    // Arrange
    seedRepository(allVideos.slice(0, 3));

    // Act
    const { getByTestId } = renderScreen(<SearchScreen />);
    advanceDebounce();

    // Assert
    await waitFor(() => expect(getByTestId('search-feed')).toBeTruthy());
    expect(getByTestId('feed-item-v1')).toBeTruthy();
    expect(getByTestId('feed-item-v2')).toBeTruthy();
    expect(getByTestId('feed-item-v3')).toBeTruthy();
  });

  it('navigates to the player route when a feed item is tapped', async () => {
    // Arrange
    seedRepository(allVideos);
    const { getByTestId } = renderScreen(<SearchScreen />);
    advanceDebounce();
    await waitFor(() => expect(getByTestId('feed-item-v1')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('feed-item-v1'));

    // Assert
    expect(mockPush).toHaveBeenCalledWith('/player/v1');
  });

  it('shows the empty state when no videos match', async () => {
    // Arrange
    seedRepository([]);
    mockUseLocalSearchParams.mockReturnValue({ tag: normalizeTag('Inexistente') });

    // Act
    const { getByTestId } = renderScreen(<SearchScreen />);
    advanceDebounce();

    // Assert
    await waitFor(() => expect(getByTestId('search-empty')).toBeTruthy());
  });
});
