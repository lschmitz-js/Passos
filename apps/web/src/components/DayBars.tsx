import { parseLocalDate, todayIso, fmtNum } from '../lib/dates';
import { useLocale, localeDias } from '../lib/i18n';

type Props = {
  days: Record<string, number>;
};

export function DayBars({ days }: Props) {
  const { locale } = useLocale();
  const dayNames = localeDias(locale);
  const entries = Object.entries(days).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(1, ...entries.map(([, v]) => v));
  const today = todayIso();

  return (
    <div className="bg-white/85 rounded-2xl shadow-card mx-1 -mt-2 px-5 pt-3 pb-3.5">
      {entries.map(([date, steps]) => {
        const d = parseLocalDate(date);
        const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;
        const isToday = date === today;
        const isFuture = date > today;
        const pct = isFuture ? 0 : Math.round((steps / max) * 100);
        const labelCls = isToday ? 'text-gold font-bold' : isFuture ? 'text-muted4' : 'text-muted font-semibold';
        const valueCls = steps > 0 ? 'text-ink font-semibold' : 'text-muted4 font-normal';
        return (
          <div
            key={date}
            className="grid items-center gap-3 py-1 text-xs"
            style={{ gridTemplateColumns: '76px 1fr 78px' }}
          >
            <span className={`tabnum ${labelCls}`}>{dayLabel}</span>
            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold2 transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-right tabnum ${valueCls}`}>
              {isFuture ? '—' : steps > 0 ? fmtNum(steps) : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
