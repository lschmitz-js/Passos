import { Link } from 'wouter';
import { useT } from '../lib/i18n';
import { LocalePicker } from './LocalePicker';

type Props = {
  title: string;
  subtitle?: string;
  pill?: string;
  showBack?: boolean;
};

export function Header({ title, subtitle, pill, showBack }: Props) {
  const t = useT();
  return (
    <header className="text-center mb-7 relative">
      <div className="absolute top-0 right-0">
        <LocalePicker />
      </div>
      {showBack && (
        <Link href="/" className="inline-block mb-3 text-muted2 text-[13px] font-semibold hover:text-ink">
          {t('header.back')}
        </Link>
      )}
      <h1 className="text-[36px] font-extrabold tracking-tight mb-1.5">{title}</h1>
      {subtitle && <p className="text-muted text-[15px]">{subtitle}</p>}
      {pill && (
        <div className="inline-block mt-2 px-3.5 py-1 rounded-full text-[13px] font-semibold bg-white/70 text-muted">
          {pill}
        </div>
      )}
    </header>
  );
}
