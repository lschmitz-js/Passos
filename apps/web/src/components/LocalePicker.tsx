import { useLocale, LOCALES } from '../lib/i18n';

export function LocalePicker() {
  const { locale, setLocale } = useLocale();
  const btnBase = 'px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider transition-colors';
  const active = 'bg-ink text-white';
  const idle = 'text-muted hover:text-ink';
  return (
    <div className="flex items-center gap-0.5 bg-white/80 rounded-full p-0.5 shadow-sm">
      {LOCALES.map((l) => (
        <button
          key={l}
          className={`${btnBase} ${locale === l ? active : idle}`}
          onClick={() => setLocale(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
