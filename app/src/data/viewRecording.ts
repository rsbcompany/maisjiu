/**
 * Pure helpers for recording a view event when the playhead crosses 50% of the
 * video duration during continuous playback, once per playback session.
 *
 * A "playback session" is scoped to a single mount of the player. Scrubbing
 * backward below 50% or restarting the video resets the session, allowing a new
 * view event when continuous playback crosses 50% again.
 */

/** Interval (seconds) at which expo-video emits `timeUpdate` events. */
export const TIME_UPDATE_INTERVAL = 0.5;

/** Multiplier applied to the expected progress delta to tolerate event jitter. */
const JITTER_MULTIPLIER = 4;

/** Floor for the continuous-playback threshold so very long videos still treat
 *  obvious scrubs as scrubs. */
const MIN_CONTINUOUS_JUMP = 0.05;

export interface ViewRecordingSession {
  /** Whether a view has already been recorded for the current playback session. */
  hasRecorded: boolean;
  /** Last known playback progress (0..1). */
  lastProgress: number;
}

export function createViewRecordingSession(): ViewRecordingSession {
  return { hasRecorded: false, lastProgress: 0 };
}

export interface ShouldRecordViewResult {
  /** True when the caller should call `ContentRepository.recordView`. */
  shouldRecord: boolean;
  /** Updated session state to persist for the next progress tick. */
  nextSession: ViewRecordingSession;
}

/**
 * Decides whether a view should be recorded for the current progress tick.
 *
 * A view is recorded exactly once per session when continuous playback crosses
 * the 50% mark. Large forward jumps that cross 50% are treated as manual scrubs
 * and do not count. Scrubbing backward below 50% resets the session.
 */
export function shouldRecordView(
  progress: number,
  duration: number,
  session: ViewRecordingSession
): ShouldRecordViewResult {
  if (!Number.isFinite(duration) || duration <= 0) {
    return { shouldRecord: false, nextSession: session };
  }

  const clamped = clampProgress(progress);
  const nextSession: ViewRecordingSession = { ...session, lastProgress: clamped };

  // Reset the session when the user scrubs backward below the threshold or
  // restarts playback from the beginning.
  if (clamped < 0.5) {
    nextSession.hasRecorded = false;
    return { shouldRecord: false, nextSession };
  }

  // Already recorded this session; ignore further progress ticks.
  if (session.hasRecorded) {
    return { shouldRecord: false, nextSession };
  }

  // Has not crossed 50% yet in this session.
  if (session.lastProgress >= 0.5) {
    return { shouldRecord: false, nextSession };
  }

  const delta = clamped - session.lastProgress;
  const isScrubJump = delta > maxContinuousJump(duration);

  // Crossing 50% via a scrub jump does not count as a view, but mark the
  // session as recorded so subsequent continuous ticks above 50% do not fire.
  if (isScrubJump) {
    nextSession.hasRecorded = true;
    return { shouldRecord: false, nextSession };
  }

  nextSession.hasRecorded = true;
  return { shouldRecord: true, nextSession };
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function maxContinuousJump(duration: number): number {
  const seconds = Math.max(1, duration);
  const expectedDelta = TIME_UPDATE_INTERVAL / seconds;
  return Math.max(MIN_CONTINUOUS_JUMP, JITTER_MULTIPLIER * expectedDelta);
}
