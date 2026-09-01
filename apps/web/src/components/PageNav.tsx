import { Link } from 'wouter';
import { useT } from '../lib/i18n';

type Props = {
  current: 'ranking' | 'records' | 'galeria' | 'dashboard';
  group: string;
};

const TABS: { key: Props['current']; href: (g: string) => string; label: string }[] = [
  { key: 'ranking', href: (g) => `/zoo?group=${g}`, label: 'nav.ranking' },
  { key: 'records', href: (g) => `/records?group=${g}`, label: 'nav.records' },
  { key: 'galeria', href: (g) => `/galeria?group=${g}`, label: 'nav.galeria' },
  { key: 'dashboard', href: (g) => `/dashboard?group=${g}`, label: 'nav.graphs' },
];

export function PageNav({ current, group }: Props) {
  const t = useT();
  const base = 'px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors';
  const active = 'bg-ink text-white shadow-e1';
  const idle = 'bg-card/70 text-muted hover:bg-card hover:text-ink';
  return (
    <nav className="flex justify-center gap-2 mb-4">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href(group)}
          className={`${base} ${current === tab.key ? active : idle}`}
          aria-current={current === tab.key ? 'page' : undefined}
        >
          {t(tab.label)}
        </Link>
      ))}
    </nav>
  );
}
