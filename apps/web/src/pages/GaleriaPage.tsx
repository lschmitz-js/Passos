import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { fetchLeaderboard } from '../lib/api';
import { GROUPS, parseGroup, displayName } from '../lib/groups';
import { buildChampions, buildPreEraWinners } from '../lib/champions';
import { formatMonthLocale } from '../lib/dates';
import { useT, useLocale, fmtNumLocale } from '../lib/i18n';
import { Header } from '../components/Header';
import { PageNav } from '../components/PageNav';
import { ChampionMonth } from '../components/ChampionMonth';

function useGroup() {
  const [location] = useLocation();
  const search = location.includes('?') ? location.split('?')[1]! : window.location.search.slice(1);
  return parseGroup(new URLSearchParams(search).get('group'));
}

export function GaleriaPage() {
  const group = useGroup();
  const t = useT();
  const { locale } = useLocale();
  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 60 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  const weeks = data?.weeks ?? [];
  const filter = GROUPS[group].filter;
  const champions = useMemo(() => buildChampions(weeks, filter), [weeks, filter]);
  const preEra = useMemo(() => buildPreEraWinners(weeks, filter), [weeks, filter]);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const reigning = champions[0];
  const past = champions.slice(1);

  return (
    <div className="container mx-auto max-w-[820px] px-4 py-6 pb-16">
      <Header
        title={t('header.title.galeria')}
        subtitle={t('header.subtitle.galeria')}
        pill={t(`group.${group}`)}
        showBack
      />
      <PageNav current="galeria" group={group} />

      {isLoading && <p className="text-center py-10 text-muted2">{t('loading')}</p>}
      {error && <p className="text-center py-10 text-muted2">{t('error.load')}</p>}

      {!isLoading && !error && champions.length === 0 && (
        <section className="card p-8 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-[15px] font-bold mb-1">{t('gal.empty.title')}</p>
          <p className="text-[13px] text-muted2">{t('gal.empty.sub')}</p>
        </section>
      )}

      {reigning && (
        <section className="card p-5 sm:p-6 mb-7 bg-trophy shadow-inset1">
          <div className="eyebrow mb-1">{t('gal.reigning')}</div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[40px] leading-none">🏆</span>
            <div className="min-w-0">
              <div className="display text-statLg font-semibold truncate">
                {displayName(reigning.winner.id, reigning.winner.name, locale)}
              </div>
              <div className="text-[13px] text-muted">
                {formatMonthLocale(reigning.monthKey, locale)}
              </div>
            </div>
          </div>
          <p className="text-[13px] text-muted mb-4">
            {t('gal.reigning.sub', fmtNumLocale(reigning.stats.marginOverSecond, locale))}
          </p>
          <ChampionMonth champion={reigning} />
        </section>
      )}

      {past.length > 0 && (
        <section className="mb-7">
          <h2 className="display text-lg font-semibold tracking-tight mb-0.5">
            {t('gal.past')}
          </h2>
          <p className="text-[12px] text-muted3 mb-3">{t('gal.past.sub')}</p>
          <div className="flex flex-col gap-2.5">
            {past.map((c) => (
              <div key={c.monthKey} className="card p-4">
                <button
                  onClick={() => setOpenKey(openKey === c.monthKey ? null : c.monthKey)}
                  className="w-full flex items-center gap-3 text-left"
                  aria-expanded={openKey === c.monthKey}
                >
                  <span className="text-[22px]">🏆</span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold truncate">
                      {displayName(c.winner.id, c.winner.name, locale)}
                    </span>
                    <span className="block text-[12px] text-muted2">
                      {formatMonthLocale(c.monthKey, locale)}
                    </span>
                  </span>
                  <span className="ml-auto display tabnum text-[19px] font-semibold">
                    {fmtNumLocale(c.stats.total, locale)}
                  </span>
                  <span className="text-muted3 text-[12px]">
                    {openKey === c.monthKey ? '▴' : '▾'}
                  </span>
                </button>
                {openKey === c.monthKey && (
                  <div className="mt-4 pt-4 border-t border-ink/5">
                    <ChampionMonth champion={c} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {preEra.length > 0 && (
        <section className="card p-5">
          <h2 className="display text-lg font-semibold tracking-tight mb-0.5">
            {t('gal.before')}
          </h2>
          <p className="text-[12px] text-muted3 mb-3">{t('gal.before.sub')}</p>
          <div className="flex flex-col">
            {[...preEra].reverse().map((w, i) => (
              <div
                key={w.monthKey}
                className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-ink/5' : ''}`}
              >
                <span className="text-[13px] text-muted2 w-[92px] shrink-0">
                  {formatMonthLocale(w.monthKey, locale)}
                </span>
                <span className="text-[14px] font-semibold truncate">{w.name}</span>
                <span className="ml-auto tabnum text-[13px] text-muted">
                  {fmtNumLocale(w.steps, locale)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
