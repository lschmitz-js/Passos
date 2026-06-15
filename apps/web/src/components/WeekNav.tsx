import { formatDateLocale } from '../lib/dates';
import { useLocale, useT } from '../lib/i18n';
import type { Week } from '../lib/api';

type Props = {
  weeks: Week[];
  idx: number;
  onChange: (idx: number) => void;
};

export function WeekNav({ weeks, idx, onChange }: Props) {
  const { locale } = useLocale();
  const t = useT();
  const w = weeks[idx];
  if (!w) return null;
  return (
    <div className="flex items-center gap-2.5 mb-3.5 justify-center">
      <button
        onClick={() => onChange(idx - 1)}
        disabled={idx === 0}
        className="bg-white/70 hover:bg-white border-none rounded-full w-[30px] h-[30px] text-base cursor-pointer text-ink disabled:opacity-30 disabled:cursor-default"
      >
        ‹
      </button>
      <span className="text-sm font-semibold min-w-[200px] text-center">
        {t('week.num', idx + 1)} · {formatDateLocale(w.weekStart, locale)} – {formatDateLocale(w.weekEnd, locale)}
      </span>
      <button
        onClick={() => onChange(idx + 1)}
        disabled={idx === weeks.length - 1}
        className="bg-white/70 hover:bg-white border-none rounded-full w-[30px] h-[30px] text-base cursor-pointer text-ink disabled:opacity-30 disabled:cursor-default"
      >
        ›
      </button>
    </div>
  );
}
