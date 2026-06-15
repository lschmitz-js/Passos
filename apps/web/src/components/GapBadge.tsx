import { fmtNum } from '../lib/dates';
import { useT } from '../lib/i18n';

type Props = { gap: number; delta?: number | null };

export function GapBadge({ gap, delta }: Props) {
  const t = useT();
  if (gap <= 0) return null;
  const showDelta = delta != null && delta !== 0;
  const widened = (delta ?? 0) > 0;
  return (
    <div className="flex flex-col items-center justify-center gap-px my-[-2px]">
      <div className="text-[11px] text-muted2 tabnum tracking-wide">
        {t('gap.diff', fmtNum(gap))}
      </div>
      {showDelta && (
        <div className={`text-[11px] tabnum whitespace-nowrap ${widened ? 'text-[#1d7a32]' : 'text-[#b22318]'}`}>
          {widened ? '▲' : '▼'} {widened ? '+' : '−'}{fmtNum(Math.abs(delta!))}{' '}
          <span className="text-muted2">{t('gap.delta')}</span>
        </div>
      )}
    </div>
  );
}
