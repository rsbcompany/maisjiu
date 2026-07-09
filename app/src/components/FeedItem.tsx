import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import { deriveHue, getThumbGradientColors } from '@/src/lib/color';
import { colors } from '@/src/theme/colors';
import { radius, space } from '@/src/theme/spacing';
import { fontWeights, textSizes } from '@/src/theme/typography';
import { PlayIcon } from './icons/PlayIcon';
import { Tag } from './Tag';

export interface FeedItemProps {
  /** Video to display. */
  video: VideoWithTags;
  /** Called with the video id when the row is pressed. */
  onPress: (id: string) => void;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Vertical list row for the search feed, matching `prototipo/design.md` §3
 * (`<FeedItem>`): 9:16 thumb + title + tag chips.
 */
export function FeedItem({ video, onPress, testID }: FeedItemProps) {
  const [top, bottom] = getThumbGradientColors(deriveHue(video.id));
  const gradientId = `feed-thumb-${video.id}`;

  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress(video.id)}
      accessibilityRole="button"
      accessibilityLabel={video.titulo}
      testID={testID}
    >
      <View style={styles.thumb}>
        <ThumbGradient id={gradientId} top={top} bottom={bottom} />
        <View style={styles.play}>
          <PlayIcon size={20} color={colors.muted} />
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={styles.title} selectable={false} numberOfLines={2}>
          {video.titulo}
        </Text>
        <View style={styles.tags}>
          {video.tags.map((tag) => (
            <Tag key={tag.id} label={tag.nomeTag} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function ThumbGradient({ id, top, bottom }: { id: string; top: string; bottom: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

const THUMB_WIDTH = 100;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space[3],
    padding: space[3],
  },
  thumb: {
    alignItems: 'center',
    aspectRatio: 9 / 16,
    borderRadius: radius.sm,
    justifyContent: 'center',
    overflow: 'hidden',
    width: THUMB_WIDTH,
  },
  play: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: space[1],
    justifyContent: 'center',
  },
  title: {
    color: colors.fg,
    fontSize: textSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: textSizes.base * 1.3,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[1],
  },
});
