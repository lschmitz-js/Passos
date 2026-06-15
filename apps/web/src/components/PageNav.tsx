import { Link } from 'wouter';
import { useT } from '../lib/i18n';

type Props = {
  current: 'ranking' | 'dashboard';
  group: string;
};

export function PageNav({ current, group }: Props) {
  const t = useT();
  const base = `px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors`;
  const active = `bg-ink text-white shadow-sm`;
  const idle = `bg-white/70 text-muted hover:bg-white hover:text-ink`;
  return (
    <div className="flex justify-center gap-2 mb-4">
      <Link
        href={`/zoo?group=${group}`}
        className={`${base} ${current === 'ranking' ? active : idle}`}
      >
        {t('nav.ranking')}
      </Link>
      <Link
        href={`/dashboard?group=${group}`}
        className={`${base} ${current === 'dashboard' ? active : idle}`}
      >
        {t('nav.graphs')}
      </Link>
    </div>
  );
}
