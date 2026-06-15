import { Link } from 'wouter';
import { useT } from '../lib/i18n';
import { LocalePicker } from '../components/LocalePicker';

export function HomePage() {
  const t = useT();
  return (
    <div className="container mx-auto max-w-[820px] px-4 py-6 pb-16">
      <header className="text-center mb-8 relative">
        <div className="absolute top-0 right-0">
          <LocalePicker />
        </div>
        <h1 className="text-[36px] font-extrabold tracking-tight mb-1.5">{t('home.title')}</h1>
        <p className="text-muted text-[15px]">{t('home.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/zoo?group=familia"
          className="card card-hover p-7 text-center cursor-pointer block no-underline text-ink"
        >
          <div className="text-5xl mb-2">🏡</div>
          <div className="text-xl font-bold">{t('home.tile.familia.title')}</div>
          <div className="text-sm text-muted2 mt-1">{t('home.tile.familia.sub')}</div>
        </Link>
        <Link
          href="/zoo?group=todos"
          className="card card-hover p-7 text-center cursor-pointer block no-underline text-ink"
        >
          <div className="text-5xl mb-2">🌍</div>
          <div className="text-xl font-bold">{t('home.tile.todos.title')}</div>
          <div className="text-sm text-muted2 mt-1">{t('home.tile.todos.sub')}</div>
        </Link>
      </div>
    </div>
  );
}
