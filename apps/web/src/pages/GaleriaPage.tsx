import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { fetchLeaderboard, fetchChampionNotes, type ChampionNote } from '../lib/api';
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

  const { data: notes } = useQuery({
    queryKey: ['champion-notes'],
    queryFn: fetchChampionNotes,
    staleTime: 60 * 60 * 1000,
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
            <ChampionFace note={notes?.[reigning.monthKey]} />
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
          <ChampionPoster note={notes?.[reigning.monthKey]} />
          <ChampionMonth champion={reigning} />
          <ChampionStory note={notes?.[reigning.monthKey]} />
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
                    <ChampionPoster note={notes?.[c.monthKey]} />
                    <ChampionMonth champion={c} />
                    <ChampionStory note={notes?.[c.monthKey]} />
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

/** The champion's photo when one is on file, the trophy when not. */
function ChampionFace({ note }: { note?: ChampionNote }) {
  // The poster already shows her face and name at size; a thumbnail beside it
  // is the same picture twice.
  if (note?.poster || !note?.photo) return <span className="text-[40px] leading-none">🏆</span>;
  return (
    <span className="relative shrink-0">
      <img
        src={`/api/champions/photo/${note.photo}`}
        alt=""
        className="w-[68px] h-[68px] rounded-full object-cover border-[3px] border-card shadow-e1"
        onError={(e) => {
          // A photo named in champions.json but missing from the volume should
          // degrade to the trophy, not a broken image.
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <span className="absolute -bottom-1 -right-1 text-[22px] leading-none">🏆</span>
    </span>
  );
}

/** Hand-written, shown as written -- not translated, because it is someone's
 *  own account of their month. */
function ChampionStory({ note }: { note?: ChampionNote }) {
  if (!note || (!note.lead && !note.acts?.length && !note.closing)) return null;
  return (
    <div className="mt-4 pt-4 border-t border-ink/10">
      {note.lead && (
        <p className="text-[15px] leading-snug font-semibold mb-3">{note.lead}</p>
      )}
      {note.acts && note.acts.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {note.acts.map((a, i) => (
            <div key={i}>
              <div className="eyebrow mb-0.5">{a.label}</div>
              <p className="text-[14px] leading-snug text-muted">{a.text}</p>
            </div>
          ))}
        </div>
      )}
      {note.closing && (
        <p className="display text-[15px] font-semibold mt-3 pt-3 border-t border-ink/5">
          {note.closing}
        </p>
      )}
    </div>
  );
}

/** The month's celebration image, when one has been made for it. */
function ChampionPoster({ note }: { note?: ChampionNote }) {
  if (!note?.poster) return null;
  return (
    <figure className="m-0 mb-4 flex justify-center">
      <img
        src={`/api/champions/photo/${note.poster}`}
        alt=""
        loading="lazy"
        className="rounded-2xl shadow-e2 max-h-[560px] w-auto max-w-full"
        onError={(e) => {
          (e.currentTarget.closest('figure') as HTMLElement).style.display = 'none';
        }}
      />
    </figure>
  );
}
