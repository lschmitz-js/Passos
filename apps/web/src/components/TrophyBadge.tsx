import { useT } from '../lib/i18n';

/**
 * Marks someone as a trophy holder wherever their name appears. Renders
 * nothing at zero, so the badge stays a signal rather than a column of blanks.
 */
export function TrophyBadge({ count, className = '' }: { count: number; className?: string }) {
  const t = useT();
  if (count <= 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-0.5 shrink-0 rounded-full bg-canopy/10 px-1.5 py-px align-middle ${className}`}
      title={t('trophy.held', count)}
      aria-label={t('trophy.held', count)}
    >
      <span className="text-[11px] leading-none">🏆</span>
      {count > 1 && (
        <span className="tabnum text-[10px] font-bold leading-none text-canopy">{count}</span>
      )}
    </span>
  );
}
