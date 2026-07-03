import { useCallback } from 'react';
import { useEvent } from 'expo';
import { useVideoPlayer, type VideoPlayer, type VideoPlayerStatus } from 'expo-video';

/** How often (seconds) the player emits `timeUpdate` events. */
const TIME_UPDATE_INTERVAL = 0.5;

export interface PlaybackProgress {
  /** Native player instance to feed into `VideoView`. */
  player: VideoPlayer;
  /** Current player status (idle/loading/readyToPlay/error). */
  status: VideoPlayerStatus;
  /** Whether playback is active. */
  isPlaying: boolean;
  /** Current playback time in seconds. */
  currentTime: number;
  /** Total media duration in seconds (0 until known). */
  duration: number;
  /** Playback progress as a fraction between 0 and 1. */
  progress: number;
  /** Re-loads the source, used to recover from a broken URL. */
  retry: () => void;
}

/**
 * Wraps `expo-video` playback events into reactive state. Exposed as a reusable
 * hook so task_09 (view recording at 50%) can consume the same progress stream
 * without re-wiring the player.
 */
export function usePlaybackProgress(source: string): PlaybackProgress {
  const player = useVideoPlayer(source, configurePlayer);
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const timeUpdate = useEvent(player, 'timeUpdate', {
    currentTime: player.currentTime,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  const currentTime = timeUpdate?.currentTime ?? player.currentTime;
  const duration = player.duration ?? 0;
  const retry = useCallback(() => player.replace(source), [player, source]);
  return { player, status, isPlaying, currentTime, duration, progress: toProgress(currentTime, duration), retry };
}

function configurePlayer(player: VideoPlayer): void {
  player.timeUpdateEventInterval = TIME_UPDATE_INTERVAL;
}

function toProgress(currentTime: number, duration: number): number {
  return duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
}
