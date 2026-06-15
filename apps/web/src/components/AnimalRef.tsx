import { ANIMALS, animalName, bandRange, type AnimalBands } from '../lib/animals';
import { genderFor } from '../lib/groups';
import { useLocale, useT, fmtNumLocale } from '../lib/i18n';

type Props = {
  bands?: AnimalBands;
  perspectiveId?: string;
};

export function AnimalRef({ bands, perspectiveId }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const showBands = bands != null && bands.max > bands.min;
  const gender = perspectiveId ? genderFor(perspectiveId) : 'm';
  const total = ANIMALS.length;

  return (
    <div className="mt-9 bg-white/60 rounded-2xl px-5 py-5">
      <h2 className="text-[18px] font-bold mb-1">{t('animalRef.title')}</h2>
      <p className="text-xs text-muted2 mb-3.5">{t('animalRef.sub')}</p>
      <div>
        {ANIMALS.map((a, i) => {
          const name = animalName(a, gender, locale);
          const range = showBands ? bandRange(i, bands!) : null;
          let rangeLabel = '';
          if (range) {
            if (i === 0) rangeLabel = t('animalRef.bandTop', fmtNumLocale(range.lo, locale));
            else if (i === total - 1) rangeLabel = t('animalRef.bandBottom', fmtNumLocale(range.hi, locale));
            else rangeLabel = t('animalRef.bandRange', fmtNumLocale(range.lo, locale), fmtNumLocale(range.hi, locale));
          }
          return (
            <div
              key={a.emoji + name}
              className={`grid items-center gap-3 py-2 px-1 text-[13px] ${i > 0 ? 'border-t border-black/5' : ''}`}
              style={{ gridTemplateColumns: '38px 120px 130px 1fr' }}
            >
              <div className="text-2xl text-center">{a.emoji}</div>
              <div className="font-semibold text-ink">{name}</div>
              <div className="tabnum text-muted font-semibold text-right">
                {showBands ? rangeLabel : fmtKm(a.km, locale, t)}
              </div>
              <div className="text-muted text-xs">{locale === 'en' ? a.fact.en : a.fact.pt}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmtKm(km: number, locale: 'pt' | 'en', t: (key: string, ...args: (string | number)[]) => string): string {
  if (km >= 1) return t('animalRef.km.day', km);
  return t('animalRef.m.day', fmtNumLocale(km * 1000, locale));
}
