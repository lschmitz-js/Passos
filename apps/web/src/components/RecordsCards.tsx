import { formatDateLocale, fmtNum } from '../lib/dates';
import { useLocale, useT } from '../lib/i18n';
import { displayName } from '../lib/groups';
import type { Records } from '../lib/records';

type Props = { records: Records };

export function RecordsCards({ records }: Props) {
  const t = useT();
  const { locale } = useLocale();
  return (
    <section className="card p-5">
      <h2 className="text-lg font-bold tracking-tight mb-4">{t('records.title')}</h2>
      <div className="flex flex-col gap-4">
        {records.bestDay && (
          <RecordRow
            emoji="🏆"
            label={t('records.bestDay')}
            primary={t('records.bestDay.value', displayName(records.bestDay.userId, records.bestDay.name, locale), fmtNum(records.bestDay.steps))}
            secondary={formatDateLocale(records.bestDay.date, locale)}
          />
        )}
        {records.bestStreak && records.bestStreak.length >= 2 && (
          <RecordRow
            emoji="🔥"
            label={t('records.streak')}
            primary={t('records.streak.value', displayName(records.bestStreak.userId, records.bestStreak.name, locale), records.bestStreak.length)}
            secondary={`${formatDateLocale(records.bestStreak.start, locale)} – ${formatDateLocale(records.bestStreak.end, locale)}`}
          />
        )}
        {records.bestWeek && (
          <RecordRow
            emoji="📅"
            label={t('records.bestWeek')}
            primary={t('records.bestWeek.value', displayName(records.bestWeek.userId, records.bestWeek.name, locale), fmtNum(records.bestWeek.steps))}
            secondary={`${formatDateLocale(records.bestWeek.weekStart, locale)} – ${formatDateLocale(records.bestWeek.weekEnd, locale)}`}
          />
        )}
        <RecordRow
          emoji="🌍"
          label={t('records.totalKm')}
          primary={t('records.totalKm.value', fmtNum(records.totalKm))}
        />
      </div>
    </section>
  );
}

function RecordRow({
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
    <div
      className="grid items-start gap-3"
      style={{ gridTemplateColumns: '32px 1fr' }}
    >
      <span className="text-2xl text-center">{emoji}</span>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted2">{label}</div>
        <div className="text-[15px] font-bold text-ink mt-0.5">{primary}</div>
        {secondary && <div className="text-[12px] text-muted mt-0.5">{secondary}</div>}
      </div>
    </div>
  );
}
