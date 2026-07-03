import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/src/theme/colors';
import { fonts, textSizes } from '@/src/theme/typography';
import { layout, radius, space } from '@/src/theme/spacing';
import { getThumbGradientColors } from '@/src/lib/color';
import { PlayIcon } from './icons/PlayIcon';
import { Tag } from './Tag';

/** Fixed width of a carousel video card (px), per `prototipo/design.md` §3. */
export const CARD_WIDTH = 158;

export interface VideoCardProps {
  /** Video id passed back through `onPress`. */
  id: string;
  /** Card title. */
  title: string;
  /** Tag labels rendered as chips. */
  tags: string[];
  /** Hue (0–359) for the placeholder thumb gradient. */
  hue: number;
  /** Optional duration display string (e.g. "0:42"); badge hidden when absent. */
  duration?: string;
  /** Called with the video id when the card is pressed. */
  onPress: (id: string) => void;
  /** Optional test ID. */
  testID?: string;
}

/**
 * Vertical 9:16 video card for the home carousel, matching
 * `prototipo/design.md` §3 (`VideoCard`). Uses an SVG gradient placeholder
 * derived from `hue` until real CDN thumbnails are available.
 */
export function VideoCard({ id, title, tags, hue, duration, onPress, testID }: VideoCardProps) {
  const [top, bottom] = getThumbGradientColors(hue);

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={title}
      testID={testID}
    >
      <View style={styles.thumb}>
        <ThumbGradient top={top} bottom={bottom} />
        <View style={styles.scrim} />
        <View style={styles.play}>
          <PlayIcon size={16} color={colors.fg} />
        </View>
        {duration ? <DurationBadge value={duration} /> : null}
      </View>
      <Text style={styles.title} selectable={false} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.tags}>
        {tags.map((label) => (
          <Tag key={label} label={label} />
        ))}
      </View>
    </Pressable>
  );
}

function ThumbGradient({ top, bottom }: { top: string; bottom: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id="thumb" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#thumb)" />
    </Svg>
  );
}

function DurationBadge({ value }: { value: string }) {
  return (
    <View style={styles.durationBadge}>
      <Text style={styles.durationText} selectable={false}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
  },
  thumb: {
    alignItems: 'center',
    aspectRatio: 9 / 16,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  scrim: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    bottom: 0,
    height: '40%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  play: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.pill,
    height: layout.thumb,
    justifyContent: 'center',
    width: layout.thumb,
  },
  durationBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    bottom: space[2],
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    right: space[2],
  },
  durationText: {
    color: colors.white,
    fontFamily: fonts.mono,
    fontSize: textSizes.xs,
  },
  title: {
    color: colors.fg,
    fontSize: textSizes.sm,
    fontWeight: '500',
    lineHeight: textSizes.sm * 1.3,
    marginTop: space[2],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[1],
    marginTop: space[1],
  },
});
