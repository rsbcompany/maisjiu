import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader, Carousel, Skeleton, StateView, Tag, WeekCard } from '@/src/components';
import type { Tag as TagModel } from '@/src/data/Tag';
import type { VideoWithTags } from '@/src/data/VideoWithTags';
import type { Week } from '@/src/data/Week';
import type { HomeData } from '@/src/hooks/useHomeData';
import { useHomeData } from '@/src/hooks/useHomeData';
import { getGreeting } from '@/src/lib/greeting';
import { formatWeekRange } from '@/src/lib/formatWeekRange';
import { normalizeText } from '@/src/lib/normalizeText';
import { colors } from '@/src/theme/colors';
import { fontWeights, textSizes, tracking } from '@/src/theme/typography';
import { space } from '@/src/theme/spacing';

const HOME_TAG_LIMIT = 6;
const NAME_FALLBACK = 'Aluno';

export default function HomeScreen() {
  const [today] = useState(getTodayIso);
  const data = useHomeData(today);
  const router = useRouter();

  const onCardPress = useCallback((id: string) => router.push(`/player/${id}`), [router]);
  const onTagPress = useCallback(
    (tagName: string) => router.navigate({ pathname: '/search', params: { tag: normalizeText(tagName) } }),
    [router]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        greeting={getGreeting()}
        name={data.name ?? NAME_FALLBACK}
        onSearchPress={() => router.navigate('/search')}
      />
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeContent data={data} onCardPress={onCardPress} onTagPress={onTagPress} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface HomeContentProps {
  data: HomeData;
  onCardPress: (id: string) => void;
  onTagPress: (tagName: string) => void;
}

function HomeContent({ data, onCardPress, onTagPress }: HomeContentProps) {
  if (data.status === 'loading') return <HomeSkeleton />;
  if (data.status === 'error') return <HomeError />;
  if (!data.week) return <EmptyWeek />;
  return (
    <WeekContent
      week={data.week}
      videos={data.videos}
      tags={data.tags}
      onCardPress={onCardPress}
      onTagPress={onTagPress}
    />
  );
}

interface WeekContentProps {
  week: Week;
  videos: VideoWithTags[];
  tags: TagModel[];
  onCardPress: (id: string) => void;
  onTagPress: (tagName: string) => void;
}

function WeekContent({ week, videos, tags, onCardPress, onTagPress }: WeekContentProps) {
  return (
    <View>
      <View style={styles.gutter}>
        <WeekCard
          weekTitle={week.tituloSemana}
          weekDate={formatWeekRange(week.dataInicio, week.dataFim)}
          testID="home-week-card"
        />
      </View>
      <SectionHeader title="Técnicas da semana" count={`${videos.length} vídeos`} />
      <WeekVideos videos={videos} onCardPress={onCardPress} />
      <ExploreSection tags={tags} onTagPress={onTagPress} />
    </View>
  );
}

function WeekVideos({ videos, onCardPress }: { videos: VideoWithTags[]; onCardPress: (id: string) => void }) {
  if (videos.length === 0) {
    return (
      <StateView
        variant="empty"
        title="Sem vídeos nesta semana"
        description="Os vídeos da semana serão publicados em breve."
        testID="home-empty-videos"
      />
    );
  }
  return <Carousel videos={videos} onCardPress={onCardPress} testID="home-carousel" />;
}

function ExploreSection({ tags, onTagPress }: { tags: TagModel[]; onTagPress: (tagName: string) => void }) {
  return (
    <View style={styles.exploreSection}>
      <View style={styles.gutter}>
        <Text style={styles.heading}>Explorar acervo</Text>
        <Text style={styles.subtext}>Busque por posição, finalização ou passagem.</Text>
      </View>
      <View style={styles.chipRow}>
        {tags.slice(0, HOME_TAG_LIMIT).map((tag) => (
          <Tag
            key={tag.id}
            label={tag.nomeTag}
            onPress={() => onTagPress(tag.nomeTag)}
            testID={`home-chip-${tag.id}`}
          />
        ))}
      </View>
    </View>
  );
}

function SectionHeader({ title, count }: { title: string; count: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.count} testID="home-video-count">
        {count}
      </Text>
    </View>
  );
}

function HomeSkeleton() {
  return (
    <View style={styles.gutter} testID="home-skeleton">
      <Skeleton width="100%" height={96} />
      <View style={styles.skeletonRow}>
        <Skeleton width={158} height={280} />
        <Skeleton width={158} height={280} />
      </View>
    </View>
  );
}

function HomeError() {
  return (
    <StateView
      variant="error"
      title="Não foi possível carregar"
      description="Verifique sua conexão e tente novamente."
      testID="home-error"
    />
  );
}

function EmptyWeek() {
  return (
    <StateView
      variant="empty"
      title="Nenhuma semana publicada"
      description="Quando a academia publicar a semana, ela aparece aqui."
      testID="home-empty-week"
    />
  );
}

function getTodayIso(): string {
  const now = new Date();
  const localMs = now.getTime() - now.getTimezoneOffset() * 60000;
  return new Date(localMs).toISOString().slice(0, 10);
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
    paddingBottom: space[6],
  },
  gutter: {
    paddingHorizontal: space[4],
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: space[2],
    paddingHorizontal: space[4],
  },
  heading: {
    color: colors.fg,
    fontSize: textSizes.xl,
    fontWeight: fontWeights.semibold,
    letterSpacing: tracking.heading,
    lineHeight: textSizes.xl * 1.2,
  },
  count: {
    color: colors.muted,
    fontSize: textSizes.sm,
  },
  subtext: {
    color: colors.muted,
    fontSize: textSizes.sm,
    marginTop: space[1],
  },
  exploreSection: {
    marginTop: space[6],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: space[3],
    marginTop: space[4],
  },
});
