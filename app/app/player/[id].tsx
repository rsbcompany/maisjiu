import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, StateView } from '@/src/components';
import { ReelsCaption, ReelsProgress, ReelsStage, ReelsTag } from '@/src/components/reels';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { usePlayerData } from '@/src/hooks/usePlayerData';
import { usePlaybackProgress } from '@/src/hooks/usePlaybackProgress';
import { normalizeText } from '@/src/lib/normalizeText';
import { colors } from '@/src/theme/colors';
import { textSizes } from '@/src/theme/typography';
import { space } from '@/src/theme/spacing';

/** Delay before the centered play button auto-hides after playback starts (ms). */
const PLAY_BUTTON_HIDE_DELAY = 900;

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const data = usePlayerData(id);
  const goBack = useCallback(() => router.back(), [router]);

  return (
    <View style={styles.screen} testID="player-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <PlayerContent data={data} onBack={goBack} onReload={data.reload} />
    </View>
  );
}

interface PlayerContentProps {
  data: ReturnType<typeof usePlayerData>;
  onBack: () => void;
  onReload: () => void;
}

function PlayerContent({ data, onBack, onReload }: PlayerContentProps) {
  if (data.status === 'loading') {
    return <StateView variant="loading" title="Carregando vídeo…" testID="player-loading" />;
  }
  if (data.status !== 'ready' || !data.video) {
    return <LoadError onRetry={onReload} onBack={onBack} testID="player-data-error" />;
  }
  return <PlayerView video={data.video} onBack={onBack} />;
}

function PlayerView({ video, onBack }: { video: VideoWithTags; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { navigate } = useRouter();
  const { player, status, isPlaying, duration, progress, retry } = usePlaybackProgress(video.urlVideo);
  const [expanded, setExpanded] = useState(false);
  const playButtonVisible = usePlayButtonVisibility(isPlaying);

  const togglePlay = useCallback(() => togglePlayback(player, isPlaying), [player, isPlaying]);
  const scrub = useCallback((ratio: number) => seekTo(player, ratio, duration), [player, duration]);
  const toggleExpanded = useCallback(() => setExpanded((value) => !value), []);
  const openTag = useCallback(
    (label: string) => navigate({ pathname: '/search', params: { tag: normalizeText(label) } }),
    [navigate]
  );

  if (status === 'error') {
    return <LoadError onRetry={retry} onBack={onBack} testID="player-video-error" />;
  }

  return (
    <ReelsStage
      player={player}
      onBack={onBack}
      onTogglePlay={togglePlay}
      isPlaying={isPlaying}
      playButtonVisible={playButtonVisible}
      topInset={insets.top}
      testID="reels-stage"
    >
      <View style={[styles.sheet, { paddingBottom: insets.bottom + space[8] }]} pointerEvents="box-none">
        <Text style={styles.title} selectable={false} testID="reels-title">
          {video.titulo}
        </Text>
        <TagRow tags={video.tags} onTagPress={openTag} />
        <ReelsCaption
          fromPosition={video.fromPosition}
          toPositions={video.toPositions}
          steps={video.steps}
          expanded={expanded}
          onToggle={toggleExpanded}
          testID="reels-caption"
        />
      </View>
      <View style={[styles.progress, { bottom: insets.bottom + space[2] }]}>
        <ReelsProgress progress={progress} onScrub={scrub} testID="reels-progress" />
      </View>
    </ReelsStage>
  );
}

function TagRow({ tags, onTagPress }: { tags: VideoWithTags['tags']; onTagPress: (label: string) => void }) {
  if (tags.length === 0) return null;
  return (
    <View style={styles.tags}>
      {tags.map((tag) => (
        <ReelsTag key={tag.id} label={tag.nomeTag} onPress={onTagPress} testID={`reels-tag-${tag.id}`} />
      ))}
    </View>
  );
}

function LoadError({ onRetry, onBack, testID }: { onRetry: () => void; onBack: () => void; testID: string }) {
  return (
    <View style={styles.errorWrap} testID={testID}>
      <StateView
        variant="error"
        title="Não foi possível carregar o vídeo"
        description="Verifique sua conexão e tente novamente."
      />
      <View style={styles.errorActions}>
        <Button variant="primary" onPress={onRetry} testID="player-retry">
          Tentar novamente
        </Button>
        <Button variant="ghost" onPress={onBack} testID="player-error-back">
          Voltar
        </Button>
      </View>
    </View>
  );
}

function togglePlayback(player: { play: () => void; pause: () => void }, isPlaying: boolean): void {
  if (isPlaying) player.pause();
  else player.play();
}

function seekTo(player: { currentTime: number }, ratio: number, duration: number): void {
  player.currentTime = ratio * duration;
}

function usePlayButtonVisibility(isPlaying: boolean): boolean {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => scheduleAutoHide(isPlaying, setVisible, timerRef), [isPlaying]);
  return visible;
}

function scheduleAutoHide(
  isPlaying: boolean,
  setVisible: (value: boolean) => void,
  timerRef: { current: ReturnType<typeof setTimeout> | null }
): (() => void) | void {
  clearTimer(timerRef);
  if (!isPlaying) return setVisible(true);
  return startHideTimer(setVisible, timerRef);
}

function startHideTimer(
  setVisible: (value: boolean) => void,
  timerRef: { current: ReturnType<typeof setTimeout> | null }
): () => void {
  timerRef.current = setTimeout(() => setVisible(false), PLAY_BUTTON_HIDE_DELAY);
  return () => clearTimer(timerRef);
}

function clearTimer(timerRef: { current: ReturnType<typeof setTimeout> | null }): void {
  if (timerRef.current) clearTimeout(timerRef.current);
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.fg,
    flex: 1,
  },
  sheet: {
    bottom: 0,
    left: 0,
    paddingHorizontal: space[4],
    paddingTop: space[2],
    position: 'absolute',
    right: 0,
  },
  title: {
    color: colors.white,
    fontSize: textSizes.xl,
    fontWeight: '600',
    lineHeight: textSizes.xl * 1.2,
    marginBottom: space[2],
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  tags: {
    columnGap: space[2],
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: space[3],
    rowGap: space[2],
  },
  progress: {
    left: 0,
    paddingHorizontal: space[4],
    position: 'absolute',
    right: 0,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  errorActions: {
    gap: space[3],
    paddingHorizontal: space[6],
  },
});
