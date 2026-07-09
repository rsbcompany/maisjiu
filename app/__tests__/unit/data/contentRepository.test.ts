import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseContentRepository } from '@/src/data/contentRepository';

type QueryResult = { data?: unknown; error?: unknown };

const CHAINABLE_METHODS = ['select', 'lte', 'gte', 'order', 'limit', 'eq', 'in', 'insert'] as const;

function createQueryBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  CHAINABLE_METHODS.forEach((method) => {
    builder[method] = jest.fn(chain);
  });
  builder.maybeSingle = jest.fn(() => Promise.resolve(result));
  builder.then = (resolve: (value: QueryResult) => unknown) =>
    Promise.resolve(result).then(resolve);
  return builder;
}

function createSupabaseMock(resultsByTable: Record<string, QueryResult>) {
  const from = jest.fn((table: string) => createQueryBuilder(resultsByTable[table] ?? { data: null }));
  return { from } as unknown as SupabaseClient;
}

function createRpcMock(result: QueryResult) {
  const rpc = jest.fn(() => Promise.resolve(result));
  return { from: jest.fn(() => createQueryBuilder({ data: null })), rpc } as unknown as SupabaseClient;
}

describe('SupabaseContentRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCurrentWeek selects the week whose date range contains today', async () => {
    // Arrange
    const weekRow = {
      id: 'w1',
      titulo_semana: 'Passagem da meia-guarda',
      data_inicio: '2026-06-29',
      data_fim: '2026-07-05',
    };
    const client = createSupabaseMock({ weeks: { data: weekRow } });
    const repository = new SupabaseContentRepository(client);

    // Act
    const week = await repository.getCurrentWeek('2026-07-01');

    // Assert
    expect(client.from).toHaveBeenCalledWith('weeks');
    expect(week).toEqual({
      id: 'w1',
      tituloSemana: 'Passagem da meia-guarda',
      dataInicio: '2026-06-29',
      dataFim: '2026-07-05',
    });
  });

  it('getCurrentWeek returns null when no week is published', async () => {
    // Arrange
    const client = createSupabaseMock({ weeks: { data: null } });
    const repository = new SupabaseContentRepository(client);

    // Act
    const week = await repository.getCurrentWeek('2026-07-01');

    // Assert
    expect(week).toBeNull();
  });

  it('getVideosForWeek maps nested tags and technique fields to VideoWithTags', async () => {
    // Arrange
    const videoRow = {
      id: 'v2',
      week_id: 'w1',
      titulo: 'Passagem com underhook',
      url_video: 'https://cdn/v2.mp4',
      ordem: 2,
      from_position: 'Meia-guarda',
      to_positions: ['100kg', 'Montada'],
      steps: ['Passo 1', 'Passo 2'],
      video_tags: [
        { tags: { id: 't1', nome_tag: 'Passagem' } },
        { tags: { id: 't2', nome_tag: 'Meia-guarda' } },
      ],
    };
    const client = createSupabaseMock({ videos: { data: [videoRow] } });
    const repository = new SupabaseContentRepository(client);

    // Act
    const videos = await repository.getVideosForWeek('w1');

    // Assert
    expect(videos).toEqual([
      {
        id: 'v2',
        weekId: 'w1',
        titulo: 'Passagem com underhook',
        urlVideo: 'https://cdn/v2.mp4',
        ordem: 2,
        fromPosition: 'Meia-guarda',
        toPositions: ['100kg', 'Montada'],
        steps: ['Passo 1', 'Passo 2'],
        tags: [
          { id: 't1', nomeTag: 'Passagem' },
          { id: 't2', nomeTag: 'Meia-guarda' },
        ],
      },
    ]);
  });

  it('getVideosForWeek handles videos without tags or technique metadata', async () => {
    // Arrange
    const videoRow = {
      id: 'v9',
      week_id: 'w1',
      titulo: 'Sem metadados',
      url_video: 'https://cdn/v9.mp4',
      ordem: 9,
      from_position: null,
      to_positions: null,
      steps: null,
      video_tags: null,
    };
    const client = createSupabaseMock({ videos: { data: [videoRow] } });
    const repository = new SupabaseContentRepository(client);

    // Act
    const [video] = await repository.getVideosForWeek('w1');

    // Assert
    expect(video.tags).toEqual([]);
    expect(video.fromPosition).toBeUndefined();
    expect(video.toPositions).toBeUndefined();
    expect(video.steps).toBeUndefined();
  });

  it('getVideoById maps a single video row to VideoWithTags', async () => {
    // Arrange
    const videoRow = {
      id: 'v2',
      week_id: 'w1',
      titulo: 'Passagem com underhook',
      url_video: 'https://cdn/v2.mp4',
      ordem: 2,
      from_position: 'Meia-guarda',
      to_positions: ['100kg', 'Montada'],
      steps: ['Passo 1', 'Passo 2'],
      video_tags: [{ tags: { id: 't1', nome_tag: 'Passagem' } }],
    };
    const client = createSupabaseMock({ videos: { data: videoRow } });
    const repository = new SupabaseContentRepository(client);

    // Act
    const video = await repository.getVideoById('v2');

    // Assert
    expect(client.from).toHaveBeenCalledWith('videos');
    expect(video).toEqual({
      id: 'v2',
      weekId: 'w1',
      titulo: 'Passagem com underhook',
      urlVideo: 'https://cdn/v2.mp4',
      ordem: 2,
      fromPosition: 'Meia-guarda',
      toPositions: ['100kg', 'Montada'],
      steps: ['Passo 1', 'Passo 2'],
      tags: [{ id: 't1', nomeTag: 'Passagem' }],
    });
  });

  it('getVideoById returns null when the video does not exist', async () => {
    // Arrange
    const client = createSupabaseMock({ videos: { data: null } });
    const repository = new SupabaseContentRepository(client);

    // Act
    const video = await repository.getVideoById('missing');

    // Assert
    expect(video).toBeNull();
  });

  it('listTags returns the tag list sorted for chip rendering', async () => {
    // Arrange
    const tagRows = [
      { id: 't1', nome_tag: 'Finalização' },
      { id: 't2', nome_tag: 'Guarda' },
      { id: 't3', nome_tag: 'Passagem' },
    ];
    const client = createSupabaseMock({ tags: { data: tagRows } });
    const repository = new SupabaseContentRepository(client);

    // Act
    const tags = await repository.listTags();

    // Assert
    expect(tags).toEqual([
      { id: 't1', nomeTag: 'Finalização' },
      { id: 't2', nomeTag: 'Guarda' },
      { id: 't3', nomeTag: 'Passagem' },
    ]);
  });

  it('searchVideosByTag calls the rpc function and maps the returned videos', async () => {
    // Arrange
    const rpcResult = {
      data: [
        {
          id: 'v4',
          week_id: 'w1',
          titulo: 'Finalização da montada',
          url_video: 'https://cdn/v4.mp4',
          ordem: 4,
          from_position: 'Montada',
          to_positions: ['Estrangulamento'],
          steps: ['Passo 1'],
          tags: [{ id: 't1', nome_tag: 'Finalização' }],
        },
      ],
      error: null,
    };
    const client = createRpcMock(rpcResult);
    const repository = new SupabaseContentRepository(client);

    // Act
    const videos = await repository.searchVideosByTag('finalizacao');

    // Assert
    expect(client.rpc).toHaveBeenCalledWith('search_videos_by_tag', { tag_query: 'finalizacao' });
    expect(videos).toHaveLength(1);
    expect(videos[0].id).toBe('v4');
    expect(videos[0].tags[0].nomeTag).toBe('Finalização');
  });

  it('searchVideosByTag returns empty when the rpc returns no rows', async () => {
    // Arrange
    const client = createRpcMock({ data: [], error: null });
    const repository = new SupabaseContentRepository(client);

    // Act
    const videos = await repository.searchVideosByTag('inexistente');

    // Assert
    expect(videos).toEqual([]);
  });

  it('searchVideosByTag throws when the rpc returns an error', async () => {
    // Arrange
    const client = createRpcMock({ data: null, error: new Error('rpc failed') });
    const repository = new SupabaseContentRepository(client);

    // Act & Assert
    await expect(repository.searchVideosByTag('guarda')).rejects.toThrow('rpc failed');
  });

  it('recordView inserts a video_views row without a client-provided user_id', async () => {
    // Arrange
    const insert = jest.fn(() => Promise.resolve({ error: null }));
    const client = { from: jest.fn(() => ({ insert })) } as unknown as SupabaseClient;
    const repository = new SupabaseContentRepository(client);

    // Act
    await repository.recordView('v1');

    // Assert
    expect(client.from).toHaveBeenCalledWith('video_views');
    expect(insert).toHaveBeenCalledWith({ video_id: 'v1' });
  });

  it('recordView throws when the insert is rejected by RLS', async () => {
    // Arrange
    const insert = jest.fn(() => Promise.resolve({ error: new Error('rls denied') }));
    const client = { from: jest.fn(() => ({ insert })) } as unknown as SupabaseClient;
    const repository = new SupabaseContentRepository(client);

    // Act & Assert
    await expect(repository.recordView('v1')).rejects.toThrow('rls denied');
  });
});
