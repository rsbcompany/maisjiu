import { ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, type VideoPlayer } from 'expo-video';
import { colors } from '@/src/theme/colors';
import { motion } from '@/src/theme/motion';
import { layout, radius, space } from '@/src/theme/spacing';
import { BackIcon } from '@/src/components/icons/BackIcon';
import { PauseIcon } from '@/src/components/icons/PauseIcon';
import { PlayIcon } from '@/src/components/icons/PlayIcon';

/** Diameter of the centered play/pause button (px), per `design.md` §3. */
const PLAY_SIZE = 72;

export interface ReelsStageProps {
  /** Native player instance rendered full-bleed. */
  player: VideoPlayer;
  /** Called when the back control is pressed. */
  onBack: () => void;
  /** Toggles playback when the video area or play button is tapped. */
  onTogglePlay: () => void;
  /** Whether the video is currently playing (drives the play/pause icon). */
  isPlaying: boolean;
  /** Whether the centered play button is visible (auto-hides while playing). */
  playButtonVisible: boolean;
  /** Top safe-area inset applied above the back control (px). */
  topInset?: number;
  /** Bottom sheet + progress bar overlay. */
  children?: ReactNode;
  /** Optional test ID for the root stage. */
  testID?: string;
}

/**
 * Immersive full-bleed player stage (`prototipo/design.md` §3, `ReelsStage`):
 * charcoal video layer, top/bottom scrims, a blurred back button and the
 * centered play/pause control. Tapping the video area toggles playback.
 */
export function ReelsStage({
  player,
  onBack,
  onTogglePlay,
  isPlaying,
  playButtonVisible,
  topInset = 0,
  children,
  testID,
}: ReelsStageProps) {
  return (
    <View style={styles.stage} testID={testID}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        testID="reels-video"
      />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onTogglePlay}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
        testID="reels-video-area"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent']}
        style={styles.scrimTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={styles.scrimBottom}
        pointerEvents="none"
      />
      <View style={[styles.top, { paddingTop: space[4] + topInset }]} pointerEvents="box-none">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          testID="reels-back"
          style={styles.back}
        >
          <BlurView intensity={20} tint="dark" style={styles.backBlur}>
            <BackIcon size={22} color={colors.white} />
          </BlurView>
        </Pressable>
      </View>
      <PlayButton isPlaying={isPlaying} visible={playButtonVisible} onPress={onTogglePlay} />
      {children}
    </View>
  );
}

function PlayButton({
  isPlaying,
  visible,
  onPress,
}: {
  isPlaying: boolean;
  visible: boolean;
  onPress: () => void;
}) {
  const opacity = usePlayButtonOpacity(visible);

  return (
    <Animated.View style={[styles.playWrap, { opacity }]} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pausar' : 'Reproduzir'}
        testID="reels-play"
        style={styles.play}
      >
        {isPlaying ? (
          <PauseIcon size={28} color={colors.fg} />
        ) : (
          <PlayIcon size={28} color={colors.fg} />
        )}
      </Pressable>
    </Animated.View>
  );
}

function usePlayButtonOpacity(visible: boolean): Animated.Value {
  const [opacity] = useState(() => new Animated.Value(visible ? 1 : 0));
  useEffect(() => startFade(opacity, visible), [opacity, visible]);
  return opacity;
}

function startFade(opacity: Animated.Value, visible: boolean): () => void {
  const animation = Animated.timing(opacity, {
    toValue: visible ? 1 : 0,
    duration: motion.base,
    easing: Easing.bezier(...motion.easeStandard),
    useNativeDriver: true,
  });
  animation.start();
  return () => animation.stop();
}

const styles = StyleSheet.create({
  stage: {
    backgroundColor: colors.fg,
    flex: 1,
  },
  scrimTop: {
    height: 120,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  scrimBottom: {
    bottom: 0,
    height: 340,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  top: {
    left: 0,
    padding: space[4],
    position: 'absolute',
    right: 0,
    top: 0,
  },
  back: {
    alignItems: 'center',
    height: layout.thumb,
    justifyContent: 'center',
    width: layout.thumb,
  },
  backBlur: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: radius.pill,
    height: layout.thumb,
    justifyContent: 'center',
    overflow: 'hidden',
    width: layout.thumb,
  },
  playWrap: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  play: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.pill,
    height: PLAY_SIZE,
    justifyContent: 'center',
    width: PLAY_SIZE,
  },
});
