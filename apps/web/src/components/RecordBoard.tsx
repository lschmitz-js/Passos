import { useT, useLocale, fmtNumLocale } from '../lib/i18n';
import { displayName } from '../lib/groups';
import { formatDateLocale, formatMonthLocale } from '../lib/dates';
import type { RecordBoard as Board, RecordRow } from '../lib/recordBoards';

const RANK_MARK: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function RecordBoard({ board }: { board: Board }) {
  const t = useT();
  const { locale } = useLocale();

  const value = (r: RecordRow) => {
    switch (board.unit) {
      case 'steps':
        return fmtNumLocale(r.value, locale);
      case 'days':
        return t('rec.unit.days', r.value);
      case 'places':
        return t('rec.unit.places', r.value);
      case 'count':
        return String(r.value);
    }
  };

  const context = (r: RecordRow) => {
    switch (board.scope) {
      case 'date':
        return r.when ? formatDateLocale(r.when, locale) : '';
      case 'month':
        return r.when ? formatMonthLocale(r.when, locale) : '';
      case 'week':
      case 'dateRange':
        return r.when && r.whenEnd
          ? `${formatDateLocale(r.when, locale)} – ${formatDateLocale(r.whenEnd, locale)}`
          : r.when
            ? formatDateLocale(r.when, locale)
            : '';
      case 'none':
        return '';
    }
  };

  return (
    <section className="card p-4 sm:p-5">
      <div className="eyebrow mb-0.5">{t(`rec.${board.key}`)}</div>
      <p className="text-[12px] text-muted3 mb-3 leading-snug">{t(`rec.${board.key}.sub`)}</p>

      {board.rows.length === 0 ? (
        <p className="text-sm text-muted2 py-3 text-center">{t('rec.empty')}</p>
      ) : (
        <ol className="flex flex-col">
          {board.rows.map((r, i) => {
            const lead = i === 0;
            return (
              <li
                key={`${r.id}-${r.when ?? i}`}
                className={
                  lead
                    ? 'bg-podium1 rounded-xl px-3 py-2.5 mb-1.5 shadow-inset1'
                    : `flex-1 px-3 py-2 ${i > 1 ? 'border-t border-ink/5' : ''}`
                }
              >
                <div className="flex items-baseline gap-2.5">
                  <span
                    className={`tabnum shrink-0 ${
                      lead ? 'text-[13px] font-bold text-[#8a6b00]' : 'text-[12px] text-muted3'
                    }`}
                    style={{ minWidth: '1.35rem' }}
                  >
                    {RANK_MARK[i + 1] ?? i + 1}
                  </span>

                  <span
                    className={`min-w-0 truncate ${
                      lead ? 'text-[15px] font-bold' : 'text-[14px] font-semibold text-muted'
                    }`}
                  >
                    {displayName(r.id, r.name, locale)}
                  </span>

                  <span className="flex-1" />

                  <span
                    className={`tabnum whitespace-nowrap ${
                      lead ? 'display text-stat font-semibold' : 'text-[14px] font-bold'
                    }`}
                  >
                    {value(r)}
                  </span>
                </div>

                {context(r) && (
                  <div
                    className={`tabnum ${
                      lead ? 'text-[11px] text-[#8a6b00]/80 pl-[1.85rem]' : 'text-[11px] text-muted3 pl-[1.85rem]'
                    }`}
                  >
                    {context(r)}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
