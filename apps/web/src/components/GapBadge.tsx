import { useState } from 'react';
import { fmtNum } from '../lib/dates';
import { useT } from '../lib/i18n';

type HistoryRow = { week: number; gap: number; delta: number | null };
type Props = { gap: number; history?: HistoryRow[] | null };

export function GapBadge({ gap, history }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  if (gap <= 0) return null;
  const hasHistory = !!history && history.length > 0;
  const rows = hasHistory ? [...history!].reverse() : []; // newest week first

  return (
    <div className="flex flex-col items-center justify-center gap-1 my-[-2px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={!hasHistory}
        className="flex items-center gap-1 bg-transparent border-none text-[11px] text-muted2 tabnum tracking-wide cursor-pointer disabled:cursor-default"
      >
        {t('gap.diff', fmtNum(gap))}
        {hasHistory && (
          <span className={`text-[9px] text-muted3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            ▾
          </span>
        )}
      </button>
      {open && hasHistory && (
        <div className="mt-0.5">
          <div className="text-[9px] uppercase tracking-wider text-muted3 text-center mb-0.5">
            {t('gap.last4')}
          </div>
          <table className="text-[11px] tabnum border-separate border-spacing-x-3 mx-auto">
            <tbody>
              {rows.map((r) => {
                const up = (r.delta ?? 0) > 0;
                const down = (r.delta ?? 0) < 0;
                return (
                  <tr key={r.week}>
                    <td className="text-muted2 whitespace-nowrap">{t('week.num', r.week)}</td>
                    <td className="text-right text-muted">{fmtNum(r.gap)}</td>
                    <td
                      className={`text-right whitespace-nowrap ${
                        up ? 'text-[#1d7a32]' : down ? 'text-[#b22318]' : 'text-muted3'
                      }`}
                    >
                      {r.delta == null ? '—' : `${up ? '▲ +' : '▼ −'}${fmtNum(Math.abs(r.delta))}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
