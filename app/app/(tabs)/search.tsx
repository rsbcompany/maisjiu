import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FeedItem, SearchHeader, Skeleton, StateView, Tag } from '@/src/components';
import type { Tag as TagModel } from '@/src/data/Tag';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { createContentRepository } from '@/src/data/contentRepository';
import { normalizeTag } from '@/src/utils/normalizeTag';
import { colors } from '@/src/theme/colors';
import { fontWeights, textSizes, tracking } from '@/src/theme/typography';
import { radius, space } from '@/src/theme/spacing';

/** Delay before a typed query triggers a new fetch (ms). */
const QUERY_DEBOUNCE_MS = 300;

/** Number of skeleton rows shown while the feed is loading. */
const SKELETON_ROW_COUNT = 4;

type SearchStatus = 'loading' | 'ready' | 'error';

export default function SearchScreen() {
  const { tag } = useLocalSearchParams<{ tag?: string }>();
  const router = useRouter();
  const repository = useMemo(() => createContentRepository(), []);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tags, setTags] = useState<TagModel[]>([]);
  const [videos, setVideos] = useState<VideoWithTags[]>([]);
  const [status, setStatus] = useState<SearchStatus>('loading');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void loadTagVocabulary(repository, setTags);
  }, [repository]);
  useEffect(() => applyRouteTag(tag, setQuery, setDebouncedQuery, debounceTimerRef), [tag]);
  useEffect(
    () => runDebouncedSearch(repository, debouncedQuery, setVideos, setStatus, debounceTimerRef),
    [repository, debouncedQuery]
  );

  const onChipPress = useCallback(
    (tagName: string) => selectChip(tagName, setQuery, setDebouncedQuery),
    []
  );
  const onFeedItemPress = useCallback(
    (id: string) => router.push(`/player/${id}`),
    [router]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title} selectable={false}>
          Biblioteca
        </Text>
        <SearchHeader value={query} onChangeText={setQuery} />
        <ChipRow tags={tags} query={debouncedQuery} onChipPress={onChipPress} />
        <SearchContent
          status={status}
          videos={videos}
          onFeedItemPress={onFeedItemPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface ChipRowProps {
  tags: TagModel[];
  query: string;
  onChipPress: (tagName: string) => void;
}

function ChipRow({ tags, query, onChipPress }: ChipRowProps) {
  return (
    <View style={styles.chipRow}>
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          label={tag.nomeTag}
          active={normalizeTag(tag.nomeTag) === normalizeTag(query)}
          onPress={() => onChipPress(tag.nomeTag)}
          testID={`search-chip-${tag.id}`}
        />
      ))}
    </View>
  );
}

interface SearchContentProps {
  status: SearchStatus;
  videos: VideoWithTags[];
  onFeedItemPress: (id: string) => void;
}

function SearchContent({ status, videos, onFeedItemPress }: SearchContentProps) {
  if (status === 'loading') return <SearchSkeleton />;
  if (status === 'error') return <SearchError />;
  if (videos.length === 0) return <SearchEmpty />;

  return (
    <View style={styles.feed} testID="search-feed">
      {videos.map((video) => (
        <FeedItem
          key={video.id}
          video={video}
          onPress={onFeedItemPress}
          testID={`feed-item-${video.id}`}
        />
      ))}
    </View>
  );
}

function SearchEmpty() {
  return (
    <StateView
      variant="empty"
      title="Nenhum vídeo encontrado"
      description="Tente outra tag ou selecione um dos chips acima."
      testID="search-empty"
    />
  );
}

function SearchError() {
  return (
    <StateView
      variant="error"
      title="Não foi possível carregar"
      description="Verifique sua conexão e tente novamente."
      testID="search-error"
    />
  );
}

function SearchSkeleton() {
  return (
    <View style={styles.feed} testID="search-skeleton">
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
        <Skeleton key={index} width="100%" height={108} radius={radius.md} />
      ))}
    </View>
  );
}

async function loadTagVocabulary(
  repository: ReturnType<typeof createContentRepository>,
  setTags: (tags: TagModel[]) => void
): Promise<void> {
  try {
    const tagList = await repository.listTags();
    setTags(tagList);
  } catch {
    setTags([]);
  }
}

function applyRouteTag(
  tagParam: string | undefined,
  setQuery: (value: string) => void,
  setDebouncedQuery: (value: string) => void,
  timerRef: { current: ReturnType<typeof setTimeout> | null }
): void {
  const initialQuery = tagParam ?? '';
  setQuery(initialQuery);
  clearDebounceTimer(timerRef);
  setDebouncedQuery(initialQuery);
}

function selectChip(
  tagName: string,
  setQuery: (value: string) => void,
  setDebouncedQuery: (value: string) => void
): void {
  setQuery(tagName);
  setDebouncedQuery(tagName);
}

function runDebouncedSearch(
  repository: ReturnType<typeof createContentRepository>,
  query: string,
  setVideos: (videos: VideoWithTags[]) => void,
  setStatus: (status: SearchStatus) => void,
  timerRef: { current: ReturnType<typeof setTimeout> | null }
): () => void {
  clearDebounceTimer(timerRef);
  setStatus('loading');

  timerRef.current = setTimeout(() => {
    void fetchSearchResults(repository, query, setVideos, setStatus);
  }, QUERY_DEBOUNCE_MS);

  return () => clearDebounceTimer(timerRef);
}

async function fetchSearchResults(
  repository: ReturnType<typeof createContentRepository>,
  query: string,
  setVideos: (videos: VideoWithTags[]) => void,
  setStatus: (status: SearchStatus) => void
): Promise<void> {
  try {
    const results = await repository.searchVideosByTag(query);
    setVideos(results);
    setStatus('ready');
  } catch {
    setVideos([]);
    setStatus('error');
  }
}

function clearDebounceTimer(timerRef: { current: ReturnType<typeof setTimeout> | null }): void {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    paddingBottom: space[6],
  },
  title: {
    color: colors.fg,
    fontSize: textSizes.lg,
    fontWeight: fontWeights.semibold,
    letterSpacing: tracking.heading,
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: space[2],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  feed: {
    gap: space[3],
    paddingHorizontal: space[4],
  },
});
