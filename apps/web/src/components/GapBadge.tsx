import { fmtNum } from '../lib/dates';
import { useT } from '../lib/i18n';

type HistoryRow = { week: number; gap: number; delta: number | null };
type Props = { gap: number; history?: HistoryRow[] | null };

export function GapBadge({ gap, history }: Props) {
  const t = useT();
  if (gap <= 0) return null;
  return (
    <div className="flex flex-col items-center justify-center gap-1 my-[-2px]">
      <div className="text-[11px] text-muted2 tabnum tracking-wide">
        {t('gap.diff', fmtNum(gap))}
      </div>
      {history && history.length > 0 && (
        <div className="mt-0.5">
          <div className="text-[9px] uppercase tracking-wider text-muted3 text-center mb-0.5">
            {t('gap.last4')}
          </div>
          <table className="text-[11px] tabnum border-separate border-spacing-x-3 mx-auto">
            <tbody>
              {history.map((r) => {
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
