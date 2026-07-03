import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import type { UUID } from './UUID';
import type { Week } from './Week';
import type { Tag } from './Tag';
import type { VideoWithTags } from './VideoWithTags';

export interface ContentRepository {
  getCurrentWeek(today: string): Promise<Week | null>;
  getVideosForWeek(weekId: UUID): Promise<VideoWithTags[]>;
  getVideoById(videoId: UUID): Promise<VideoWithTags | null>;
  listTags(): Promise<Tag[]>;
  searchVideosByTag(tagName: string): Promise<VideoWithTags[]>;
  recordView(videoId: UUID): Promise<void>;
}

type DbTag = { id: string; nome_tag: string };
type DbWeek = { id: string; titulo_semana: string; data_inicio: string; data_fim: string };
type DbVideoTagJunction = { tags: DbTag };
type DbVideo = {
  id: string;
  week_id: string;
  titulo: string;
  url_video: string;
  ordem: number;
  from_position: string | null;
  to_positions: string[] | null;
  steps: string[] | null;
  video_tags: DbVideoTagJunction[] | null;
};

/**
 * Supabase-backed implementation of the ContentRepository contract.
 *
 * All reads go through PostgREST and are gated by RLS; inserts into
 * video_views rely on RLS to set the authenticated user_id.
 */
export class SupabaseContentRepository implements ContentRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getCurrentWeek(today: string): Promise<Week | null> {
    const { data } = await this.client
      .from('weeks')
      .select('*')
      .lte('data_inicio', today)
      .gte('data_fim', today)
      .order('data_inicio', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ? mapWeek(data as DbWeek) : null;
  }

  async getVideosForWeek(weekId: UUID): Promise<VideoWithTags[]> {
    const { data } = await this.client
      .from('videos')
      .select('*, video_tags(tags(id, nome_tag))')
      .eq('week_id', weekId)
      .order('ordem', { ascending: true });

    return (data as DbVideo[] | null)?.map(mapVideo) ?? [];
  }

  async getVideoById(videoId: UUID): Promise<VideoWithTags | null> {
    const { data } = await this.client
      .from('videos')
      .select('*, video_tags(tags(id, nome_tag))')
      .eq('id', videoId)
      .maybeSingle();

    return data ? mapVideo(data as DbVideo) : null;
  }

  async listTags(): Promise<Tag[]> {
    const { data } = await this.client
      .from('tags')
      .select('id, nome_tag')
      .order('nome_tag', { ascending: true });

    return (data as DbTag[] | null)?.map(mapTag) ?? [];
  }

  async searchVideosByTag(tagName: string): Promise<VideoWithTags[]> {
    const matchingIds = await this.getMatchingTagIds(tagName);
    if (matchingIds.length === 0) return [];

    const videoIds = await this.getVideoIdsForTags(matchingIds);
    if (videoIds.length === 0) return [];

    return this.getVideosByIds(videoIds);
  }

  async recordView(videoId: UUID): Promise<void> {
    const { error } = await this.client.from('video_views').insert({ video_id: videoId });
    if (error) throw error;
  }

  private async getMatchingTagIds(tagName: string): Promise<string[]> {
    const query = normalizeTag(tagName);
    const allTags = await this.listTags();
    return allTags.filter((tag) => normalizeTag(tag.nomeTag).includes(query)).map((tag) => tag.id);
  }

  private async getVideoIdsForTags(tagIds: string[]): Promise<string[]> {
    const { data: junctionRows } = await this.client
      .from('video_tags')
      .select('video_id')
      .in('tag_id', tagIds);

    return getUniqueVideoIds(junctionRows as Array<{ video_id: string }> | null);
  }

  private async getVideosByIds(videoIds: string[]): Promise<VideoWithTags[]> {
    const { data } = await this.client
      .from('videos')
      .select('*, video_tags(tags(id, nome_tag))')
      .in('id', videoIds)
      .order('ordem', { ascending: true });

    return (data as DbVideo[] | null)?.map(mapVideo) ?? [];
  }
}

/**
 * Factory for the default ContentRepository backed by the app Supabase client.
 * Accepts an optional client override for tests.
 */
export function createContentRepository(client: SupabaseClient = supabase) {
  return new SupabaseContentRepository(client);
}

function normalizeTag(tagName: string): string {
  return tagName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getUniqueVideoIds(rows: Array<{ video_id: string }> | null): string[] {
  if (!rows) return [];
  return [...new Set(rows.map((row) => row.video_id))];
}

function mapWeek(row: DbWeek): Week {
  return {
    id: row.id,
    tituloSemana: row.titulo_semana,
    dataInicio: row.data_inicio,
    dataFim: row.data_fim,
  };
}

function mapTag(row: DbTag): Tag {
  return { id: row.id, nomeTag: row.nome_tag };
}

function mapVideo(row: DbVideo): VideoWithTags {
  return {
    id: row.id,
    weekId: row.week_id,
    titulo: row.titulo,
    urlVideo: row.url_video,
    ordem: row.ordem,
    tags: (row.video_tags ?? []).map((junction) => mapTag(junction.tags)),
    fromPosition: row.from_position ?? undefined,
    toPositions: row.to_positions ?? undefined,
    steps: row.steps ?? undefined,
  };
}
