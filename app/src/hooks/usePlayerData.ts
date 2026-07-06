import { useCallback, useEffect, useState } from 'react';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { createContentRepository } from '@/src/data/contentRepository';

export type PlayerDataStatus = 'loading' | 'error' | 'ready' | 'notFound';

export interface PlayerData {
  status: PlayerDataStatus;
  video: VideoWithTags | null;
}

type PlayerSetter = (data: PlayerData) => void;

const INITIAL_PLAYER_DATA: PlayerData = { status: 'loading', video: null };

/**
 * Loads a single video by id for the immersive player. A missing row resolves
 * to `notFound`; any fetch failure (including offline) resolves to `error` so
 * the screen can render a recovery state. `reloadToken` forces a refetch.
 */
export function usePlayerData(videoId: string): PlayerData & { reload: () => void } {
  const [data, setData] = useState<PlayerData>(INITIAL_PLAYER_DATA);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  useEffect(() => runPlayerLoad(videoId, setData), [videoId, reloadToken]);
  return { ...data, reload };
}

function runPlayerLoad(videoId: string, setData: PlayerSetter): () => void {
  let active = true;
  setData(INITIAL_PLAYER_DATA);
  void loadVideo(videoId, (next) => {
    if (active) setData(next);
  });
  return () => {
    active = false;
  };
}

async function loadVideo(videoId: string, setData: PlayerSetter): Promise<void> {
  try {
    const video = await createContentRepository().getVideoById(videoId);
    setData({ status: video ? 'ready' : 'notFound', video });
  } catch {
    setData({ status: 'error', video: null });
  }
}
