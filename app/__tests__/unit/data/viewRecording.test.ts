import { createViewRecordingSession, shouldRecordView } from '@/src/data/viewRecording';

describe('createViewRecordingSession', () => {
  it('starts with no recorded view and zero progress', () => {
    expect(createViewRecordingSession()).toEqual({ hasRecorded: false, lastProgress: 0 });
  });
});

describe('shouldRecordView', () => {
  it('does not record when progress is 0.49 and has not crossed 50%', () => {
    // Arrange
    const session = createViewRecordingSession();

    // Act
    const result = shouldRecordView(0.49, 60, session);

    // Assert
    expect(result.shouldRecord).toBe(false);
    expect(result.nextSession.hasRecorded).toBe(false);
  });

  it('records exactly once when continuous playback crosses 50%', () => {
    // Arrange
    let session = createViewRecordingSession();

    // Act & Assert — approach the threshold
    session = shouldRecordView(0.48, 60, session).nextSession;
    expect(session.hasRecorded).toBe(false);

    const crossing = shouldRecordView(0.5, 60, session);
    expect(crossing.shouldRecord).toBe(true);
    expect(crossing.nextSession.hasRecorded).toBe(true);

    // Subsequent tick above 50% must not record again
    const after = shouldRecordView(0.8, 60, crossing.nextSession);
    expect(after.shouldRecord).toBe(false);
    expect(after.nextSession.hasRecorded).toBe(true);
  });

  it('records when crossing from just below to just above 50%', () => {
    // Arrange
    const session = { hasRecorded: false, lastProgress: 0.499 };

    // Act
    const result = shouldRecordView(0.501, 60, session);

    // Assert
    expect(result.shouldRecord).toBe(true);
  });

  it('does not record on the initial progress tick at 0', () => {
    // Arrange
    const session = createViewRecordingSession();

    // Act
    const result = shouldRecordView(0, 60, session);

    // Assert
    expect(result.shouldRecord).toBe(false);
    expect(result.nextSession.hasRecorded).toBe(false);
  });

  it('does not record when the player opens already past 50%', () => {
    // Arrange — simulates a resume or seek on open
    const session = createViewRecordingSession();

    // Act
    const result = shouldRecordView(0.75, 60, session);

    // Assert
    expect(result.shouldRecord).toBe(false);
    expect(result.nextSession.hasRecorded).toBe(true);
  });

  it('does not record on a large scrub jump past 50%', () => {
    // Arrange
    const session = { hasRecorded: false, lastProgress: 0.1 };

    // Act
    const result = shouldRecordView(0.9, 60, session);

    // Assert
    expect(result.shouldRecord).toBe(false);
    expect(result.nextSession.hasRecorded).toBe(true);
  });

  it('subsequent continuous ticks after a scrub jump past 50% do not record', () => {
    // Arrange
    let session = shouldRecordView(0.1, 60, createViewRecordingSession()).nextSession;
    session = shouldRecordView(0.9, 60, session).nextSession;

    // Act
    const result = shouldRecordView(0.91, 60, session);

    // Assert
    expect(result.shouldRecord).toBe(false);
  });

  it('resets the session when scrubbing backward below 50% and records again on crossing', () => {
    // Arrange — already recorded
    let session = shouldRecordView(0.6, 60, createViewRecordingSession()).nextSession;
    expect(session.hasRecorded).toBe(true);

    // Act — scrub back below the threshold
    session = shouldRecordView(0.3, 60, session).nextSession;
    expect(session.hasRecorded).toBe(false);

    // Act — simulate continuous playback back through 50% in realistic ticks
    session = shouldRecordView(0.31, 60, session).nextSession;
    session = shouldRecordView(0.32, 60, session).nextSession;
    session = shouldRecordView(0.4, 60, session).nextSession;
    session = shouldRecordView(0.49, 60, session).nextSession;
    const replay = shouldRecordView(0.5, 60, session);

    // Assert
    expect(replay.shouldRecord).toBe(true);
    expect(replay.nextSession.hasRecorded).toBe(true);
  });

  it('resets the session when restarting playback from the beginning', () => {
    // Arrange
    let session = shouldRecordView(0.6, 60, createViewRecordingSession()).nextSession;

    // Act
    session = shouldRecordView(0, 60, session).nextSession;

    // Assert
    expect(session.hasRecorded).toBe(false);
    expect(session.lastProgress).toBe(0);
  });

  it('does not record on a small backward movement that stays above 50%', () => {
    // Arrange
    const session = { hasRecorded: true, lastProgress: 0.7 };

    // Act
    const result = shouldRecordView(0.65, 60, session);

    // Assert
    expect(result.shouldRecord).toBe(false);
    expect(result.nextSession.hasRecorded).toBe(true);
  });

  it('tolerates normal playback jitter without misclassifying it as a scrub', () => {
    // Arrange — 60s video, normal 0.5s tick advances ~0.008; 0.03 is well within jitter tolerance
    const session = { hasRecorded: false, lastProgress: 0.48 };

    // Act
    const result = shouldRecordView(0.51, 60, session);

    // Assert
    expect(result.shouldRecord).toBe(true);
  });

  it('treats a jump larger than the continuous threshold as a scrub for short videos too', () => {
    // Arrange — 10s video, threshold is larger (~0.2) but 0.5 is still clearly a scrub
    const session = { hasRecorded: false, lastProgress: 0.1 };

    // Act
    const result = shouldRecordView(0.6, 10, session);

    // Assert
    expect(result.shouldRecord).toBe(false);
  });

  it('clamps out-of-range progress values', () => {
    // Arrange
    const session = { hasRecorded: false, lastProgress: 0.6 };

    // Act
    const aboveOne = shouldRecordView(1.5, 60, session);
    const belowZero = shouldRecordView(-0.2, 60, session);

    // Assert
    expect(aboveOne.nextSession.lastProgress).toBe(1);
    expect(belowZero.nextSession.lastProgress).toBe(0);
    // Already-recorded session above 50% should not fire again even after clamping.
    expect(aboveOne.shouldRecord).toBe(false);
    expect(belowZero.shouldRecord).toBe(false);
  });

  it('does not record when duration is invalid', () => {
    // Arrange
    const session = { hasRecorded: false, lastProgress: 0.1 };

    // Act
    const result = shouldRecordView(0.6, 0, session);

    // Assert
    expect(result.shouldRecord).toBe(false);
  });

  it('handles NaN progress as zero', () => {
    // Arrange
    const session = createViewRecordingSession();

    // Act
    const result = shouldRecordView(NaN, 60, session);

    // Assert
    expect(result.nextSession.lastProgress).toBe(0);
    expect(result.shouldRecord).toBe(false);
  });
});
