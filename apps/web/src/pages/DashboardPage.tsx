import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { fetchLeaderboard } from '../lib/api';
import { GROUPS, parseGroup } from '../lib/groups';
import { buildDailyTimeline, buildWeeklyTimeline, buildRankTimeline } from '../lib/dashboard';
import { buildRecords } from '../lib/records';
import { buildMedalTable, buildWeekPodiums } from '../lib/medals';
import { buildAnimalCounts, buildWeekAnimals } from '../lib/animalStats';
import { computeAnimalBands } from '../lib/leaderboard';
import { useT } from '../lib/i18n';
import { Header } from '../components/Header';
import { PageNav } from '../components/PageNav';
import { Timeline } from '../components/Timeline';
import { MedalsSection } from '../components/MedalsSection';
import { AnimalsSection } from '../components/AnimalsSection';
import { RecordsCards } from '../components/RecordsCards';
import { RangePicker, rangeBounds, type RangeKey } from '../components/RangePicker';

function useGroup() {
  const [location] = useLocation();
  const search = location.includes('?') ? location.split('?')[1]! : window.location.search.slice(1);
  return parseGroup(new URLSearchParams(search).get('group'));
}

export function DashboardPage() {
  const group = useGroup();
  const t = useT();
  const [range, setRange] = useState<RangeKey>('ALL');
  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 60 * 60 * 1000,
    refetchIntervalInBackground: false,
  });
  const weeks = data?.weeks ?? [];
  const filter = GROUPS[group].filter;
  const bounds = useMemo(() => rangeBounds(range), [range]);

  const daily = useMemo(() => buildDailyTimeline(weeks, filter, bounds), [weeks, filter, bounds]);
  const weekly = useMemo(() => buildWeeklyTimeline(weeks, filter, bounds), [weeks, filter, bounds]);
  const ranks = useMemo(() => buildRankTimeline(weeks, filter, bounds), [weeks, filter, bounds]);
  const medals = useMemo(() => buildMedalTable(weeks, filter, bounds), [weeks, filter, bounds]);
  const podiums = useMemo(() => buildWeekPodiums(weeks, filter, bounds), [weeks, filter, bounds]);
  const bands = useMemo(() => computeAnimalBands(weeks, filter), [weeks, filter]);
  const animalCounts = useMemo(() => buildAnimalCounts(weeks, filter, bands, bounds), [weeks, filter, bands, bounds]);
  const weekAnimals = useMemo(() => buildWeekAnimals(weeks, filter, bands, bounds), [weeks, filter, bands, bounds]);
  const records = useMemo(() => buildRecords(weeks, filter), [weeks, filter]);
  const rankMax = ranks.users.length;

  return (
    <div className="container mx-auto max-w-[820px] px-4 py-6 pb-16">
      <Header
        title={t('header.title.graphs')}
        subtitle={t('header.subtitle.graphs')}
        pill={t(`group.${group}`)}
        showBack
      />
      <PageNav current="dashboard" group={group} />

      {isLoading && <p className="text-center py-10 text-muted2">{t('loading')}</p>}
      {error && <p className="text-center py-10 text-muted2">{t('error.load')}</p>}

      {!isLoading && !error && weeks.length === 0 && (
        <p className="text-center py-10 text-muted2">{t('empty')}</p>
      )}

      {!isLoading && weeks.length > 0 && (
        <>
          <RangePicker value={range} onChange={setRange} />
          <MedalsSection medals={medals} podiums={podiums} />
          <AnimalsSection counts={animalCounts} weekly={weekAnimals} />
          <Timeline
            title={t('timeline.daily')}
            subtitle={t('days.window', daily.points.length)}
            points={daily.points}
            users={daily.users}
          />
          <Timeline
            title={t('timeline.weekly')}
            subtitle={t('days.window.weeks', weekly.points.length)}
            points={weekly.points}
            users={weekly.users}
          />
          <Timeline
            title={t('timeline.rank')}
            subtitle={t('days.window.weeks', ranks.points.length)}
            points={ranks.points}
            users={ranks.users}
            yMode="rank"
            rankMax={rankMax}
          />
          <RecordsCards records={records} />
        </>
      )}
    </div>
  );
}
