import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { fetchLeaderboard } from '../lib/api';
import { GROUPS, parseGroup } from '../lib/groups';
import { buildMedalTable, buildWeekPodiums } from '../lib/medals';
import { buildMonths, buildTrophyTable, trophyCountsById } from '../lib/months';
import { buildRecordBoards } from '../lib/recordBoards';
import { useT } from '../lib/i18n';
import { Header } from '../components/Header';
import { PageNav } from '../components/PageNav';
import { MedalsSection } from '../components/MedalsSection';
import { MonthsSection } from '../components/MonthsSection';
import { RecordBoard } from '../components/RecordBoard';

function useGroup() {
  const [location] = useLocation();
  const search = location.includes('?') ? location.split('?')[1]! : window.location.search.slice(1);
  return parseGroup(new URLSearchParams(search).get('group'));
}

export function RecordsPage() {
  const group = useGroup();
  const t = useT();
  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 60 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  const weeks = data?.weeks ?? [];
  const filter = GROUPS[group].filter;

  const medals = useMemo(() => buildMedalTable(weeks, filter), [weeks, filter]);
  const podiums = useMemo(() => buildWeekPodiums(weeks, filter), [weeks, filter]);
  const months = useMemo(() => buildMonths(weeks, filter), [weeks, filter]);
  const trophies = useMemo(() => buildTrophyTable(months), [months]);
  const held = useMemo(() => trophyCountsById(months), [months]);
  const groups = useMemo(() => buildRecordBoards(weeks, filter), [weeks, filter]);

  return (
    <div className="container mx-auto max-w-[820px] px-4 py-6 pb-16">
      <Header
        title={t('header.title.records')}
        subtitle={t('header.subtitle.records')}
        pill={t(`group.${group}`)}
        showBack
      />
      <PageNav current="records" group={group} />

      {isLoading && <p className="text-center py-10 text-muted2">{t('loading')}</p>}
      {error && <p className="text-center py-10 text-muted2">{t('error.load')}</p>}
      {!isLoading && !error && weeks.length === 0 && (
        <p className="text-center py-10 text-muted2">{t('empty')}</p>
      )}

      {!isLoading && weeks.length > 0 && (
        <>
          <MedalsSection medals={medals} podiums={podiums} trophies={held} />
          <MonthsSection months={months} trophies={trophies} />

          {groups.map((g) => (
            <div key={g.key} className="mb-7">
              <h2 className="display text-lg font-semibold tracking-tight mb-0.5">
                {t(`recgroup.${g.key}`)}
              </h2>
              <p className="text-[12px] text-muted3 mb-3">{t(`recgroup.${g.key}.sub`)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {g.boards.map((b) => (
                  <RecordBoard key={b.key} board={b} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
