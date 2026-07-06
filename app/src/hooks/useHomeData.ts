import { useEffect, useState } from 'react';
import type { Week } from '@/src/data/Week';
import type { Tag } from '@/src/data/Tag';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { createContentRepository } from '@/src/data/contentRepository';
import { getProfileName } from '@/src/data/getProfileName';

export type HomeStatus = 'loading' | 'error' | 'ready';

export interface HomeData {
  status: HomeStatus;
  name: string | null;
  week: Week | null;
  videos: VideoWithTags[];
  tags: Tag[];
}

type HomeSetter = (data: HomeData) => void;

const INITIAL_HOME_DATA: HomeData = {
  status: 'loading',
  name: null,
  week: null,
  videos: [],
  tags: [],
};

/**
 * Loads the dashboard payload (profile name, current week, its videos and the
 * tag vocabulary) for the given ISO date. Any fetch failure — including offline
 * — resolves to the `error` status so the screen can render a recovery state.
 */
export function useHomeData(today: string): HomeData {
  const [data, setData] = useState<HomeData>(INITIAL_HOME_DATA);
  useEffect(() => runHomeLoad(today, setData), [today]);
  return data;
}

function runHomeLoad(today: string, setData: HomeSetter): () => void {
  let active = true;
  void loadHomeData(today, (next) => {
    if (active) setData(next);
  });
  return () => {
    active = false;
  };
}

async function loadHomeData(today: string, setData: HomeSetter): Promise<void> {
  try {
    const result = await fetchHomeData(today);
    setData({ status: 'ready', ...result });
  } catch {
    setData({ ...INITIAL_HOME_DATA, status: 'error' });
  }
}

async function fetchHomeData(today: string) {
  const repository = createContentRepository();
  const [name, week, tags] = await Promise.all([
    getProfileName(),
    repository.getCurrentWeek(today),
    repository.listTags(),
  ]);
  const videos = week ? await repository.getVideosForWeek(week.id) : [];
  return { name, week, tags, videos };
}
