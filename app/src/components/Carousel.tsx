import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  LayoutChangeEvent,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { colors } from '@/src/theme/colors';
import { space } from '@/src/theme/spacing';
import { motion } from '@/src/theme/motion';
import { deriveHue } from '@/src/lib/color';
import { CARD_WIDTH, VideoCard } from './VideoCard';

/** Gap between carousel cards (px). */
export const CARD_GAP = space[3];
/** Snap interval = card width + gap, per `prototipo/design.md` §3. */
export const CAROUSEL_SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
/** Tolerance (px) absorbing sub-pixel rounding when detecting scroll end. */
export const CAROUSEL_END_TOLERANCE = 6;
/** Width of the right-edge fade gradient (px). */
const FADE_WIDTH = 44;

interface FadeMetrics {
  offset: number;
  contentWidth: number;
  layoutWidth: number;
}

/**
 * Right-edge fade opacity for the carousel affordance
 * (`prototipo/design.md` §3, "Carousel anti false-floor"). Returns 0 once the
 * scroll reaches the end (within tolerance) so the last card is not clipped.
 */
export function getCarouselFadeOpacity({ offset, contentWidth, layoutWidth }: FadeMetrics): number {
  const maxScroll = contentWidth - layoutWidth;
  const atEnd = offset >= maxScroll - CAROUSEL_END_TOLERANCE;
  return atEnd ? 0 : 1;
}

export interface CarouselProps {
  /** Videos rendered as cards in scroll order. */
  videos: VideoWithTags[];
  /** Called with the video id when a card is pressed. */
  onCardPress: (id: string) => void;
  /** Optional test ID for the underlying list. */
  testID?: string;
}

/**
 * Horizontal carousel of vertical video cards with snap and a right-edge fade
 * affordance that hides at scroll end.
 */
export function Carousel({ videos, onCardPress, testID }: CarouselProps) {
  const [fadeOpacity] = useState(() => new Animated.Value(1));
  const layoutWidthRef = useRef(0);

  const animateFade = useCallback(
    (target: number) => {
      Animated.timing(fadeOpacity, {
        toValue: target,
        duration: motion.base,
        easing: Easing.bezier(...motion.easeStandard),
        useNativeDriver: true,
      }).start();
    },
    [fadeOpacity]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      layoutWidthRef.current = layoutMeasurement.width;
      animateFade(
        getCarouselFadeOpacity({
          offset: contentOffset.x,
          contentWidth: contentSize.width,
          layoutWidth: layoutMeasurement.width,
        })
      );
    },
    [animateFade]
  );

  const handleContentSizeChange = useCallback(
    (contentWidth: number) => {
      animateFade(
        getCarouselFadeOpacity({ offset: 0, contentWidth, layoutWidth: layoutWidthRef.current })
      );
    },
    [animateFade]
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    layoutWidthRef.current = event.nativeEvent.layout.width;
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<VideoWithTags>) => (
      <VideoCard
        id={item.id}
        title={item.titulo}
        tags={item.tags.map((tag) => tag.nomeTag)}
        hue={deriveHue(item.id)}
        onPress={onCardPress}
        testID={`video-card-${item.id}`}
      />
    ),
    [onCardPress]
  );

  return (
    <View style={styles.wrap} onLayout={handleLayout}>
      <FlatList
        testID={testID}
        data={videos}
        horizontal
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CAROUSEL_SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
      />
      <Animated.View style={[styles.fade, { opacity: fadeOpacity }]} pointerEvents="none">
        <EdgeFade />
      </Animated.View>
    </View>
  );
}

function EdgeFade() {
  return (
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="carousel-fade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={colors.bg} stopOpacity="0" />
          <Stop offset="1" stopColor={colors.bg} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#carousel-fade)" />
    </Svg>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function keyExtractor(item: VideoWithTags): string {
  return item.id;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  content: {
    paddingBottom: space[3],
    paddingHorizontal: space[4],
  },
  separator: {
    width: CARD_GAP,
  },
  fade: {
    bottom: space[3],
    position: 'absolute',
    right: 0,
    top: 0,
    width: FADE_WIDTH,
  },
});
