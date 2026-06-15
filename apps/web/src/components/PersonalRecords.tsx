import { formatDateLocale, fmtNum } from '../lib/dates';
import { useLocale, useT } from '../lib/i18n';
import type { PersonalRecords as Records } from '../lib/leaderboard';

type Props = { records: Records };

export function PersonalRecords({ records }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const consistency = records.totalDays
    ? Math.round((records.daysActive / records.totalDays) * 100)
    : 0;
  return (
    <div className="bg-white/85 rounded-2xl shadow-card mx-1 -mt-2 px-5 pt-3 pb-3.5">
      <div className="grid gap-y-3 gap-x-4 sm:grid-cols-2">
        {records.bestDay && (
          <Stat
            emoji="🏆"
            label={t('pr.bestDay')}
            primary={t('pr.steps', fmtNum(records.bestDay.steps))}
            secondary={formatDateLocale(records.bestDay.date, locale)}
          />
        )}
        {records.bestWeek && (
          <Stat
            emoji="📅"
            label={t('pr.bestWeek')}
            primary={t('pr.steps', fmtNum(records.bestWeek.steps))}
            secondary={`${formatDateLocale(records.bestWeek.weekStart, locale)} – ${formatDateLocale(records.bestWeek.weekEnd, locale)}`}
          />
        )}
        {records.longestStreak && records.longestStreak.length >= 2 && (
          <Stat
            emoji="🔥"
            label={t('pr.streak')}
            primary={t('pr.days', records.longestStreak.length)}
            secondary={`${formatDateLocale(records.longestStreak.start, locale)} – ${formatDateLocale(records.longestStreak.end, locale)}`}
          />
        )}
        <Stat
          emoji="🌍"
          label={t('pr.totalKm')}
          primary={t('pr.km', fmtNum(records.totalKm))}
        />
        {records.favoriteWeekday && (
          <Stat
            emoji="📊"
            label={t('pr.favoriteDay')}
            primary={fullDayName(records.favoriteWeekday.day, t)}
            secondary={t('pr.avgSub', fmtNum(records.favoriteWeekday.avg))}
          />
        )}
        <Stat
          emoji="💪"
          label={t('pr.consistency')}
          primary={t('pr.consistency.value', records.daysActive, records.totalDays)}
          secondary={t('pr.consistency.sub', consistency)}
        />
      </div>
    </div>
  );
}

function Stat({
  emoji,
  label,
  primary,
  secondary,
}: {
  emoji: string;
  label: string;
  primary: string;
  secondary?: string;
}) {
  return (
    <div className="grid items-start gap-2.5" style={{ gridTemplateColumns: '28px 1fr' }}>
      <span className="text-xl text-center leading-none mt-0.5">{emoji}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted2">{label}</div>
        <div className="text-[14px] font-bold text-ink mt-0.5 truncate">{primary}</div>
        {secondary && <div className="text-[11px] text-muted mt-0.5">{secondary}</div>}
      </div>
    </div>
  );
}

const KEY_BY_DAY = ['dayName.sun', 'dayName.mon', 'dayName.tue', 'dayName.wed', 'dayName.thu', 'dayName.fri', 'dayName.sat'];
function fullDayName(d: number, t: (key: string, ...args: (string | number)[]) => string): string {
  return t(KEY_BY_DAY[d] ?? 'dayName.sun');
}
