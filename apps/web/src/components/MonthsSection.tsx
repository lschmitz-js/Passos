import { useState } from 'react';
import { useT, useLocale, fmtNumLocale } from '../lib/i18n';
import { displayName } from '../lib/groups';
import { formatMonthLocale, formatMonthShortLocale } from '../lib/dates';
import {
  isPreTrophyEra,
  TROPHY_ERA_START,
  type Month,
  type TrophyCounts,
} from '../lib/months';

type Props = {
  months: Month[];
  trophies: TrophyCounts[];
};

export function MonthsSection({ months, trophies }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const [view, setView] = useState<'table' | 'history'>('table');
  const tabBase = 'px-3 py-1 rounded-full text-[12px] font-semibold transition-colors';
  const tabActive = 'bg-ink text-white';
  const tabIdle = 'text-muted hover:text-ink';

  return (
    <section className="card p-5 mb-7">
      <div className="flex items-center justify-between mb-1">
        <h2 className="display text-lg font-semibold tracking-tight">{t('months.title')}</h2>
        <div className="flex gap-0.5 bg-ink/5 rounded-full p-0.5">
          <button
            onClick={() => setView('table')}
            className={`${tabBase} ${view === 'table' ? tabActive : tabIdle}`}
          >
            {t('months.tab.table')}
          </button>
          <button
            onClick={() => setView('history')}
            className={`${tabBase} ${view === 'history' ? tabActive : tabIdle}`}
          >
            {t('months.tab.history')}
          </button>
        </div>
      </div>
      <p className="text-[12px] text-muted3 mb-3">
        {t('months.sub', formatMonthShortLocale(TROPHY_ERA_START, locale))}
      </p>

      {view === 'table' ? (
        <TrophyTable trophies={trophies} />
      ) : (
        <MonthHistory months={months} />
      )}
    </section>
  );
}

const MAX_CHIPS = 6;

function TrophyTable({ trophies }: { trophies: TrophyCounts[] }) {
  const t = useT();
  const { locale } = useLocale();
  if (trophies.length === 0) {
    return <p className="text-sm text-muted2 py-4 text-center">{t('months.empty')}</p>;
  }
  return (
    <div>
      {trophies.map((c, i) => {
        const shown = c.months.slice(-MAX_CHIPS);
        const hidden = c.months.length - shown.length;
        return (
          <div
            key={c.id}
            className={`flex items-center gap-3 py-2.5 px-1 ${i > 0 ? 'border-t border-ink/5' : ''}`}
          >
            <span className="text-[14px] sm:text-[15px] font-bold truncate shrink-0 max-w-[35%]">
              {displayName(c.id, c.name, locale)}
            </span>

            <span className="flex-1 flex flex-wrap justify-end gap-1">
              {hidden > 0 && <span className="text-[11px] text-muted3 self-center">+{hidden}</span>}
              {shown.map((m) => (
                <span
                  key={m}
                  className="text-[11px] tabnum whitespace-nowrap rounded-full px-2 py-0.5 bg-canopy/10 text-canopy font-semibold"
                >
                  {formatMonthShortLocale(m, locale)}
                </span>
              ))}
            </span>

            <span className="tabnum text-[15px] font-bold text-canopy shrink-0">
              {c.trophies}
              <span className="ml-1">🏆</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MonthHistory({ months }: { months: Month[] }) {
  const t = useT();
  const { locale } = useLocale();
  if (months.length === 0) {
    return <p className="text-sm text-muted2 py-4 text-center">{t('months.empty')}</p>;
  }
  return (
    <div className="flex flex-col gap-2.5">
      {months.map((m) => {
        const podium = m.entries.slice(0, 3);
        const winner = podium[0];
        const preEra = isPreTrophyEra(m.key);
        const awarded = m.complete && !m.partial && !preEra;
        return (
          <div
            key={m.key}
            className={`rounded-xl px-3.5 py-3 ${
              awarded ? 'bg-trophy shadow-inset1' : 'bg-ink/[0.03] border border-dashed border-ink/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="display text-[15px] font-semibold">
                {formatMonthLocale(m.key, locale)}
              </span>
              {!m.complete && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted2 bg-card/70 rounded-full px-2 py-0.5">
                  {t('months.inProgress')}
                </span>
              )}
              {m.complete && preEra && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted2 bg-card/70 rounded-full px-2 py-0.5">
                  {t('months.preEra')}
                </span>
              )}
              {m.complete && !preEra && m.partial && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted2 bg-card/70 rounded-full px-2 py-0.5">
                  {t('months.partial')}
                </span>
              )}
            </div>

            {winner && (
              <div className="flex items-baseline gap-2">
                <span className="text-[17px]">{awarded ? '🏆' : '⏳'}</span>
                <span className="text-[15px] font-bold truncate">
                  {displayName(winner.id, winner.name, locale)}
                </span>
                <span className="flex-1" />
                <span className="display text-stat font-semibold tabnum">
                  {fmtNumLocale(winner.steps, locale)}
                </span>
              </div>
            )}

            {podium.length > 1 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 pl-[1.6rem]">
                {podium.slice(1).map((e, i) => (
                  <span key={e.id} className="text-[12px] text-muted2 tabnum">
                    {i === 0 ? '🥈' : '🥉'} {displayName(e.id, e.name, locale)} ·{' '}
                    {fmtNumLocale(e.steps, locale)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
