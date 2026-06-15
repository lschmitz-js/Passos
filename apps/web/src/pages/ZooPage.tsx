import { useState, useMemo, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { fetchLeaderboard } from '../lib/api';
import { GROUPS, parseGroup } from '../lib/groups';
import { buildWeek, buildYear, pickDefaultWeekIdx, computeAnimalBands } from '../lib/leaderboard';
import { formatDateLocale, fmtNum } from '../lib/dates';
import { useLocale, useT, localeMeses } from '../lib/i18n';
import { Header } from '../components/Header';
import { PageNav } from '../components/PageNav';
import { Totals } from '../components/Totals';
import { WeekNav } from '../components/WeekNav';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { GapBadge } from '../components/GapBadge';
import { AnimalRef } from '../components/AnimalRef';

function useGroup() {
  const [location] = useLocation();
  const search = location.includes('?') ? location.split('?')[1]! : window.location.search.slice(1);
  return parseGroup(new URLSearchParams(search).get('group'));
}

export function ZooPage() {
  const group = useGroup();
  const t = useT();
  const { locale } = useLocale();
  const [weekIdx, setWeekIdx] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 60 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  const weeks = data?.weeks ?? [];
  const idx = weekIdx ?? (weeks.length ? pickDefaultWeekIdx(weeks) : 0);
  const week = weeks[idx];
  const prev = idx > 0 ? weeks[idx - 1]! : null;
  const filter = GROUPS[group].filter;

  const bands = useMemo(() => computeAnimalBands(weeks, filter), [weeks, filter]);
  const weekRows = useMemo(() => (week ? buildWeek(week, prev, filter, bands) : []), [week, prev, filter, bands]);

  const yearWeeks = useMemo(() => weeks.slice(0, idx + 1), [weeks, idx]);
  const yearWeeksPrev = useMemo(() => weeks.slice(0, idx), [weeks, idx]);
  const yearNow = useMemo(() => buildYear(yearWeeks, filter, bands), [yearWeeks, filter, bands]);
  const yearPrev = useMemo(() => buildYear(yearWeeksPrev, filter, bands), [yearWeeksPrev, filter, bands]);
  const yearRows = useMemo(() => {
    const prevById = new Map(yearPrev.map((p) => [p.id, p]));
    return yearNow.map((r) => {
      const p = prevById.get(r.id);
      return {
        ...r,
        prevTotal: p?.total ?? null,
        rankDelta: p ? p.rank - r.rank : null,
      };
    });
  }, [yearNow, yearPrev]);

  const weekTotal = weekRows.reduce((s, p) => s + p.steps, 0);
  const yearTotal = yearRows.reduce((s, p) => s + p.total, 0);

  const updatedLabel = useMemo(() => {
    if (!weeks.length) return '—';
    const last = weeks[weeks.length - 1]!;
    if (!last.collectedAt) return '—';
    const d = new Date(last.collectedAt);
    const pad = (n: number) => String(n).padStart(2, '0');
    const months = localeMeses(locale);
    return locale === 'en'
      ? `${months[d.getMonth()]} ${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
      : `${d.getDate()} ${months[d.getMonth()]} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, [weeks, locale]);

  return (
    <div className="container mx-auto max-w-[820px] px-4 py-6 pb-16">
      <Header
        title={t('home.title')}
        subtitle={t('header.subtitle')}
        pill={t(`group.${group}`)}
        showBack
      />
      <PageNav current="ranking" group={group} />

      {isLoading && <p className="text-center py-10 text-muted2">{t('loading')}</p>}
      {error && <p className="text-center py-10 text-muted2">{t('error.load')}</p>}

      {week && !isLoading && (
        <>
          <section className="mb-9">
            <div className="flex items-baseline justify-between mb-3.5 px-1">
              <div className="text-xl font-bold tracking-tight">{t('section.thisWeek')}</div>
              <div className="text-[13px] text-muted2">
                {formatDateLocale(week.weekStart, locale)} – {formatDateLocale(week.weekEnd, locale)}
              </div>
            </div>
            <WeekNav weeks={weeks} idx={idx} onChange={setWeekIdx} />
            <Totals
              items={[
                { num: weekRows.length, lbl: t('totals.competitors') },
                { num: fmtNum(weekTotal), lbl: t('totals.steps') },
                { num: `${(weekTotal * 0.000762).toFixed(1)} km`, lbl: t('totals.walked') },
              ]}
            />
            <div className="flex flex-col gap-3">
              {weekRows.map((p, i) => {
                const above = i > 0 ? weekRows[i - 1]! : null;
                const gap = above ? above.steps - p.steps : 0;
                return (
                  <Fragment key={p.id}>
                    {above && <GapBadge gap={gap} />}
                    <LeaderboardRow
                      mode="week"
                      id={p.id}
                      name={p.name}
                      rank={p.rank}
                      animal={p.animal}
                      steps={p.steps}
                      prevAligned={p.prevAligned}
                      dailyAvg={p.dailyAvg}
                      delta={p.delta}
                      days={p.days}
                      syncStatus={p.syncStatus}
                    />
                  </Fragment>
                );
              })}
            </div>
          </section>

          <section className="mb-9">
            <div className="flex items-baseline justify-between mb-3.5 px-1">
              <div className="text-xl font-bold tracking-tight">{t('section.year')}</div>
              <div className="text-[13px] text-muted2">
                {formatDateLocale(yearWeeks[0]!.weekStart, locale)} – {formatDateLocale(yearWeeks[yearWeeks.length - 1]!.weekEnd, locale)} · {yearWeeks.length > 1 ? t('section.weekCount.plural', yearWeeks.length) : t('section.weekCount', yearWeeks.length)}
              </div>
            </div>
            <Totals
              items={[
                { num: yearRows.length, lbl: t('totals.competitors') },
                { num: fmtNum(yearTotal), lbl: t('totals.steps') },
                { num: `${(yearTotal * 0.000762).toFixed(1)} km`, lbl: t('totals.walked') },
              ]}
            />
            <div className="flex flex-col gap-3">
              {yearRows.map((p, i) => {
                const above = i > 0 ? yearRows[i - 1]! : null;
                const gap = above ? above.total - p.total : 0;
                const gapDelta =
                  above && above.prevTotal != null && p.prevTotal != null
                    ? gap - (above.prevTotal - p.prevTotal)
                    : null;
                return (
                  <Fragment key={p.id}>
                    {above && <GapBadge gap={gap} delta={gapDelta} />}
                    <LeaderboardRow
                      mode="year"
                      id={p.id}
                      name={p.name}
                      rank={p.rank}
                      animal={p.animal}
                      total={p.total}
                      prevTotal={p.prevTotal}
                      rankDelta={p.rankDelta}
                      dailyAvg={p.dailyAvg}
                      wins={p.wins}
                      podiums={p.podiums}
                      best={p.best}
                      bestWeek={p.bestWeek}
                      records={p.records}
                    />
                  </Fragment>
                );
              })}
            </div>
          </section>

          <AnimalRef bands={bands} />

          <p className="text-center mt-6 text-muted2 text-xs">
            {t('updated.label', updatedLabel)}
          </p>
        </>
      )}
    </div>
  );
}
