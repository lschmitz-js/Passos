import { useState } from 'react';
import { useT, useLocale } from '../lib/i18n';
import { displayName } from '../lib/groups';
import { fmtNum, formatDateLocale } from '../lib/dates';
import type { MedalCounts, WeekPodium } from '../lib/medals';
import { TrophyBadge } from './TrophyBadge';

type Props = {
  medals: MedalCounts[];
  podiums: WeekPodium[];
  /** id -> trophies held; badges the name so medals and trophies read together. */
  trophies?: Map<string, number>;
};

export function MedalsSection({ medals, podiums, trophies }: Props) {
  const t = useT();
  const [view, setView] = useState<'table' | 'history'>('table');
  const tabBase = 'px-3 py-1 rounded-full text-[12px] font-semibold transition-colors';
  const tabActive = 'bg-ink text-white';
  const tabIdle = 'text-muted hover:text-ink';

  return (
    <section className="card p-5 mb-7">
      <div className="flex items-center justify-between mb-1">
        <h2 className="display text-lg font-semibold tracking-tight">{t('medals.title')}</h2>
        <div className="flex gap-0.5 bg-ink/5 rounded-full p-0.5">
          <button onClick={() => setView('table')} className={`${tabBase} ${view === 'table' ? tabActive : tabIdle}`}>
            {t('medals.tab.table')}
          </button>
          <button onClick={() => setView('history')} className={`${tabBase} ${view === 'history' ? tabActive : tabIdle}`}>
            {t('medals.tab.history')}
          </button>
        </div>
      </div>
      <p className="text-[12px] text-muted3 mb-3">{t('medals.sub')}</p>

      {view === 'table' && <MedalTable medals={medals} trophies={trophies} />}
      {view === 'history' && <WeekHistory podiums={podiums} />}
    </section>
  );
}

// name | gold | silver | bronze | total
const COLS = '1fr 38px 38px 38px 46px';

function MedalTable({
  medals,
  trophies,
}: {
  medals: MedalCounts[];
  trophies?: Map<string, number>;
}) {
  const t = useT();
  const { locale } = useLocale();
  if (medals.length === 0) {
    return <p className="text-sm text-muted2 py-4 text-center">{t('medals.empty')}</p>;
  }
  return (
    <div>
      <div
        className="grid items-center gap-2 px-1 pb-2 text-[10px] uppercase tracking-wider text-muted2"
        style={{ gridTemplateColumns: COLS }}
      >
        <span></span>
        <span className="text-center">🥇</span>
        <span className="text-center">🥈</span>
        <span className="text-center">🥉</span>
        <span className="text-center">{t('medals.total')}</span>
      </div>
      {medals.map((m, i) => (
        <div
          key={m.id}
          className={`grid items-center gap-2 py-2.5 px-1 ${i > 0 ? 'border-t border-black/5' : ''}`}
          style={{ gridTemplateColumns: COLS }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[14px] sm:text-[15px] font-bold truncate">
              {displayName(m.id, m.name, locale)}
            </span>
            <TrophyBadge count={trophies?.get(m.id) ?? 0} />
          </div>
          <span className={`text-center tabnum text-[15px] font-bold ${m.gold > 0 ? 'text-gold' : 'text-muted4'}`}>
            {m.gold}
          </span>
          <span className={`text-center tabnum text-[15px] ${m.silver > 0 ? 'text-silver font-bold' : 'text-muted4'}`}>
            {m.silver}
          </span>
          <span className={`text-center tabnum text-[15px] ${m.bronze > 0 ? 'text-bronze font-bold' : 'text-muted4'}`}>
            {m.bronze}
          </span>
          <span className="text-center tabnum text-[15px] font-bold text-ink">
            {m.gold + m.silver + m.bronze}
          </span>
        </div>
      ))}
    </div>
  );
}

const MEDAL_EMOJI: Record<1 | 2 | 3, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const MEDAL_CHIP: Record<1 | 2 | 3, string> = {
  1: 'bg-[#fff8d4] text-[#8a6b00] border border-[#f0c040]/40',
  2: 'bg-[#f5f5f7] text-[#5e5e64] border border-[#b8b8c0]/40',
  3: 'bg-[#f9e7d4] text-[#7a4a25] border border-[#c08850]/40',
};

function WeekHistory({ podiums }: { podiums: WeekPodium[] }) {
  const t = useT();
  const { locale } = useLocale();
  if (podiums.length === 0) {
    return <p className="text-sm text-muted2 py-4 text-center">{t('medals.empty')}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {podiums.map((p) => (
        <div
          key={p.weekStart}
          className="flex flex-col sm:grid sm:items-center gap-1.5 sm:gap-3"
          style={{ gridTemplateColumns: '120px 1fr' }}
        >
          <div className="text-[11px] sm:text-[12px] text-muted2 tabnum whitespace-nowrap">
            {formatDateLocale(p.weekStart, locale)} – {formatDateLocale(p.weekEnd, locale)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {p.podium.map((pl) => (
              <span
                key={`${p.weekStart}-${pl.id}`}
                className={`text-[12px] px-2 py-0.5 rounded-full tabnum whitespace-nowrap font-semibold ${MEDAL_CHIP[pl.rank]}`}
              >
                {MEDAL_EMOJI[pl.rank]} {displayName(pl.id, pl.name, locale)} · {fmtNum(pl.steps)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
