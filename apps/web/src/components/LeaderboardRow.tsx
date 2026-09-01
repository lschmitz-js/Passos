import { useState } from 'react';
import type { Animal } from '../lib/animals';
import { animalName } from '../lib/animals';
import { fmtNum, formatDayShortLocale } from '../lib/dates';
import { useLocale, useT } from '../lib/i18n';
import { genderFor, displayName } from '../lib/groups';
import type { PersonalRecords as RecordsT, SyncStatus } from '../lib/leaderboard';
import { DayBars } from './DayBars';
import { PersonalRecords } from './PersonalRecords';
import { TrophyBadge } from './TrophyBadge';
import { titleFor } from '../lib/tags';
import { todayIso } from '../lib/dates';

type CommonProps = {
  id: string;
  name: string;
  rank: number;
  animal: Animal;
  /** Monthly trophies held, badged next to the name. */
  trophies?: number;
  /** Holds the most recent monthly trophy. */
  reigning?: boolean;
  /** Most steps over the last couple of days -- gets the daily title. */
  hot?: boolean;
};

type WeekProps = CommonProps & {
  mode: 'week';
  steps: number;
  prevAligned: number | null;
  dailyAvg: number;
  delta: number | null;
  days: Record<string, number>;
  syncStatus: SyncStatus;
};

type YearProps = CommonProps & {
  mode: 'year';
  total: number;
  prevTotal: number | null;
  rankDelta: number | null;
  dailyAvg: number;
  wins: number;
  podiums: number;
  best: number;
  bestWeek: string;
  records: RecordsT;
};

type Props = WeekProps | YearProps;

const RANK_CLS: Record<number, string> = {
  1: 'bg-gradient-to-r from-[#fff8d4] to-white border-l-4 border-l-[#f0c040]',
  2: 'bg-gradient-to-r from-[#f5f5f7] to-white border-l-4 border-l-[#b8b8c0]',
  3: 'bg-gradient-to-r from-[#f9e7d4] to-white border-l-4 border-l-[#c08850]',
};
const RANK_NUM_CLS: Record<number, string> = {
  1: 'text-gold',
  2: 'text-silver',
  3: 'text-bronze',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

function DeltaBadge({ delta }: { delta: number | null }) {
  const t = useT();
  if (delta == null)
    return <span className="text-[10px] font-semibold px-1.5 py-px rounded-lg bg-black/5 text-muted">{t('row.new')}</span>;
  if (delta > 0)
    return <span className="text-[10px] font-semibold px-1.5 py-px rounded-lg bg-[rgba(52,199,89,0.15)] text-[#1d7a32]">▲{delta}</span>;
  if (delta < 0)
    return <span className="text-[10px] font-semibold px-1.5 py-px rounded-lg bg-[rgba(255,59,48,0.15)] text-[#b22318]">▼{-delta}</span>;
  return <span className="text-[10px] font-semibold px-1.5 py-px rounded-lg bg-black/5 text-muted">=</span>;
}

function StepDelta({ curr, prevAligned }: { curr: number; prevAligned: number | null }) {
  const t = useT();
  if (prevAligned == null) return <span className="text-[11px] text-muted2">{t('row.firstWeek')}</span>;
  const diff = curr - prevAligned;
  if (diff === 0) return <span className="text-[11px] text-muted2">{t('row.sameAsLast')}</span>;
  const color = diff > 0 ? 'text-[#1d7a32]' : 'text-[#b22318]';
  const sign = diff > 0 ? '+' : '−';
  return (
    <span className={`text-[11px] tabnum whitespace-nowrap ${color}`}>
      {sign}{fmtNum(Math.abs(diff))} {t('row.vsLastWeek')}
    </span>
  );
}

function SyncBadge({ status }: { status: SyncStatus }) {
  const t = useT();
  const { locale } = useLocale();
  if (status.kind === 'none' || status.kind === 'notCurrentWeek') return null;
  const label =
    status.kind === 'staleSince'
      ? t('row.lastSync', formatDayShortLocale(status.date, locale))
      : t('row.noSyncThisWeek');
  return (
    <div className="mt-0.5 text-[11px] text-[#b25a18] whitespace-nowrap">
      📵 {label}
    </div>
  );
}

export function LeaderboardRow(props: Props) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const { locale } = useLocale();
  const rankCls = RANK_CLS[props.rank] ?? '';
  const rankNumCls = RANK_NUM_CLS[props.rank] ?? 'text-ink';
  const stepsValue = props.mode === 'week' ? props.steps : props.total;
  const label = animalName(props.animal, genderFor(props.id), locale);
  const shownName = displayName(props.id, props.name, locale);

  return (
    <>
      <div
        onClick={() => setOpen((o) => !o)}
        className={`relative grid items-center rounded-2xl bg-card shadow-card cursor-pointer hover:shadow-cardHover hover:translate-x-[2px] transition-transform duration-200
          grid-cols-[36px_64px_minmax(0,1fr)_auto] sm:grid-cols-[50px_100px_minmax(0,1fr)_auto]
          gap-2.5 sm:gap-4
          p-3 sm:px-[18px] sm:py-[14px]
          ${rankCls}`}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span className={`text-xl sm:text-2xl font-extrabold leading-none tabnum ${rankNumCls}`}>{props.rank}</span>
          {props.mode === 'week' && <DeltaBadge delta={props.delta} />}
          {props.mode === 'year' && <DeltaBadge delta={props.rankDelta} />}
        </div>

        <div className="relative w-16 h-16 sm:w-[90px] sm:h-[90px]">
          <span className="text-[56px] sm:text-[80px] leading-none block text-center drop-shadow-[0_3px_4px_rgba(0,0,0,0.15)]">
            {props.animal.emoji}
          </span>
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-[42px] sm:h-[42px] rounded-full border-2 sm:border-[2.5px] border-white shadow-[0_2px_5px_rgba(0,0,0,0.25)] bg-[#ddd] flex items-center justify-center overflow-hidden text-[13px] sm:text-base font-bold text-muted">
            <img
              src={`/faces/${props.id}.png`}
              alt={shownName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                const parent = img.parentElement!;
                parent.textContent = initials(shownName);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[15px] sm:text-[17px] font-bold truncate">{shownName}</span>
            <TrophyBadge count={props.trophies ?? 0} />
          </div>
          {props.reigning && (
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-canopy truncate">
              {t(genderFor(props.id) === 'f' ? 'row.champion.f' : 'row.champion.m')}
            </div>
          )}
          {props.hot && props.mode === 'week' && (
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8a6b00] truncate">
              🔥 {titleFor(props.id, genderFor(props.id), todayIso(), locale)}
            </div>
          )}
          <div className="text-[10px] sm:text-xs text-muted2 uppercase tracking-wider truncate">
            {props.animal.emoji} {label}
          </div>
          {props.mode === 'week' && (
            <div className="mt-1 truncate"><StepDelta curr={props.steps} prevAligned={props.prevAligned} /></div>
          )}
          {props.mode === 'week' && <SyncBadge status={props.syncStatus} />}
          {props.mode === 'year' && (
            <>
              {/* Weekly wins are golds, not trophies -- 🏆 is reserved for the
                  monthly trophy, which rides beside the name via TrophyBadge. */}
              <div className="text-[11px] sm:text-xs text-muted mt-1 whitespace-nowrap"
                   title={t('row.winsPodiums.hint')}>
                🥇 {props.wins} · 🥉 {props.podiums}
              </div>
            </>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="text-lg sm:text-[22px] font-extrabold tabnum leading-tight">{fmtNum(stepsValue)}</div>
          <div className="text-[9px] sm:text-[11px] text-muted2 uppercase tracking-wider">{t('row.steps')}</div>
          <div className="text-[10px] sm:text-xs text-muted mt-0.5 tabnum whitespace-nowrap">{t('row.perDay', fmtNum(props.dailyAvg))}</div>
        </div>

        <span
          className={`absolute right-3.5 bottom-2 text-[11px] text-muted3 select-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </div>

      {open && props.mode === 'week' && <DayBars days={props.days} />}
      {open && props.mode === 'year' && <PersonalRecords records={props.records} />}
    </>
  );
}
