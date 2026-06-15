import { useT } from '../lib/i18n';

export type RangeKey = 'MTD' | 'LAST_MONTH' | 'L3M' | 'L6M' | 'YTD' | 'ALL';

const ORDER: RangeKey[] = ['MTD', 'LAST_MONTH', 'L3M', 'L6M', 'YTD', 'ALL'];

type Props = {
  value: RangeKey;
  onChange: (k: RangeKey) => void;
};

export function RangePicker({ value, onChange }: Props) {
  const t = useT();
  return (
    <div className="flex flex-wrap justify-center gap-1.5 mb-5">
      {ORDER.map((k) => {
        const on = value === k;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${on ? 'bg-ink text-white' : 'bg-white/70 text-muted hover:bg-white hover:text-ink'}`}
          >
            {t(`range.${k}`)}
          </button>
        );
      })}
    </div>
  );
}

export function rangeBounds(key: RangeKey, now: Date = new Date()): { from: string; to: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = toIso(now);
  switch (key) {
    case 'MTD': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toIso(s), to: today };
    }
    case 'LAST_MONTH': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toIso(s), to: toIso(e) };
    }
    case 'L3M': {
      const s = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      return { from: toIso(s), to: today };
    }
    case 'L6M': {
      const s = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      return { from: toIso(s), to: today };
    }
    case 'YTD': {
      const s = new Date(now.getFullYear(), 0, 1);
      return { from: toIso(s), to: today };
    }
    case 'ALL':
      return { from: '0000-01-01', to: '9999-12-31' };
  }
}
