import { useState } from 'react';
import { useT, useLocale } from '../lib/i18n';
import { displayName, genderFor } from '../lib/groups';
import { ANIMALS, animalName } from '../lib/animals';
import { formatDateLocale } from '../lib/dates';
import type { AnimalCounts, WeekAnimals } from '../lib/animalStats';

type Props = {
  counts: AnimalCounts[];
  weekly: WeekAnimals[];
};

export function AnimalsSection({ counts, weekly }: Props) {
  const t = useT();
  const [view, setView] = useState<'table' | 'history'>('table');
  const tabBase = 'px-3 py-1 rounded-full text-[12px] font-semibold transition-colors';
  const tabActive = 'bg-ink text-white';
  const tabIdle = 'text-muted hover:text-ink';

  return (
    <section className="card p-5 mb-7">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold tracking-tight">{t('animals.title')}</h2>
        <div className="flex gap-0.5 bg-black/5 rounded-full p-0.5">
          <button onClick={() => setView('table')} className={`${tabBase} ${view === 'table' ? tabActive : tabIdle}`}>
            {t('medals.tab.table')}
          </button>
          <button onClick={() => setView('history')} className={`${tabBase} ${view === 'history' ? tabActive : tabIdle}`}>
            {t('medals.tab.history')}
          </button>
        </div>
      </div>

      {view === 'table' && <AnimalTable counts={counts} />}
      {view === 'history' && <WeekAnimalsView weekly={weekly} />}
    </section>
  );
}

function AnimalTable({ counts }: { counts: AnimalCounts[] }) {
  const t = useT();
  const { locale } = useLocale();
  if (counts.length === 0) {
    return <p className="text-sm text-muted2 py-4 text-center">{t('medals.empty')}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {counts.map((c, i) => (
        <div
          key={c.id}
          className={`flex flex-col sm:grid sm:items-center gap-1.5 sm:gap-3 ${i > 0 ? 'pt-3 border-t border-black/5' : ''}`}
          style={{ gridTemplateColumns: '120px 1fr' }}
        >
          <div className="text-[14px] sm:text-[15px] font-bold truncate">
            {displayName(c.id, c.name, locale)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ANIMALS.filter((a) => (c.counts.get(a.emoji) ?? 0) > 0).map((a) => {
              const n = c.counts.get(a.emoji)!;
              return (
                <span
                  key={a.emoji}
                  className="text-[12px] px-2 py-0.5 rounded-full bg-black/5 whitespace-nowrap font-semibold tabnum"
                  title={animalName(a, genderFor(c.id), locale)}
                >
                  {a.emoji} {n}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function WeekAnimalsView({ weekly }: { weekly: WeekAnimals[] }) {
  const t = useT();
  const { locale } = useLocale();
  if (weekly.length === 0) {
    return <p className="text-sm text-muted2 py-4 text-center">{t('medals.empty')}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {weekly.map((w) => (
        <div
          key={w.weekStart}
          className="flex flex-col sm:grid sm:items-center gap-1.5 sm:gap-3"
          style={{ gridTemplateColumns: '120px 1fr' }}
        >
          <div className="text-[11px] sm:text-[12px] text-muted2 tabnum whitespace-nowrap">
            {formatDateLocale(w.weekStart, locale)} – {formatDateLocale(w.weekEnd, locale)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {w.entries.map((e) => (
              <span
                key={`${w.weekStart}-${e.id}`}
                className="text-[12px] px-2 py-0.5 rounded-full bg-black/5 whitespace-nowrap font-semibold"
                title={animalName(e.animal, genderFor(e.id), locale)}
              >
                {e.animal.emoji} {displayName(e.id, e.name, locale)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
