import { ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import type { Week } from '@/src/data/Week';
import { createContentRepository } from '@/src/data/contentRepository';
import { getProfileName } from '@/src/data/getProfileName';
import HomeScreen from '../../app/(tabs)/index';

jest.mock('@/src/data/contentRepository', () => ({ createContentRepository: jest.fn() }));
jest.mock('@/src/data/getProfileName', () => ({ getProfileName: jest.fn() }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
}));

const createRepo = jest.mocked(createContentRepository);
const getName = jest.mocked(getProfileName);

const week: Week = {
  id: 'w1',
  tituloSemana: 'Passagem da meia-guarda',
  dataInicio: '2026-06-29',
  dataFim: '2026-07-05',
};

function makeVideo(id: string): VideoWithTags {
  return { id, weekId: 'w1', titulo: `Técnica ${id}`, urlVideo: `https://cdn/${id}.mp4`, ordem: 1, tags: [] };
}

function mockRepository(overrides: Partial<Record<string, unknown>>) {
  createRepo.mockReturnValue({
    getCurrentWeek: jest.fn().mockResolvedValue(null),
    getVideosForWeek: jest.fn().mockResolvedValue([]),
    listTags: jest.fn().mockResolvedValue([]),
    searchVideosByTag: jest.fn(),
    recordView: jest.fn(),
    ...overrides,
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

describe('HomeScreen states', () => {
  it('shows the empty-week state when getCurrentWeek returns null', async () => {
    // Arrange
    mockRepository({ getCurrentWeek: jest.fn().mockResolvedValue(null) });

    // Act
    const { getByTestId, getByText } = renderScreen(<HomeScreen />);

    // Assert
    await waitFor(() => expect(getByTestId('home-empty-week')).toBeTruthy());
    expect(getByText('Nenhuma semana publicada')).toBeTruthy();
  });

  it('shows the video count in the section header', async () => {
    // Arrange
    mockRepository({
      getCurrentWeek: jest.fn().mockResolvedValue(week),
      getVideosForWeek: jest.fn().mockResolvedValue([makeVideo('v1'), makeVideo('v2'), makeVideo('v3')]),
    });

    // Act
    const { getByTestId } = renderScreen(<HomeScreen />);

    // Assert
    await waitFor(() => expect(getByTestId('home-video-count')).toHaveTextContent('3 vídeos'));
  });

  it('shows the error state when a fetch fails', async () => {
    // Arrange
    mockRepository({ getCurrentWeek: jest.fn().mockRejectedValue(new Error('offline')) });

    // Act
    const { getByTestId } = renderScreen(<HomeScreen />);

    // Assert
    await waitFor(() => expect(getByTestId('home-error')).toBeTruthy());
  });
});
