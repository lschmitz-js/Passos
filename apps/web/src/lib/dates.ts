import type { Locale } from './i18n';
import { localeMeses, localeDias, fmtNumLocale } from './i18n';

export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

export function todayIso(): string {
  const t = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

export function formatDateLocale(iso: string, locale: Locale): string {
  const d = parseLocalDate(iso);
  const months = localeMeses(locale);
  return locale === 'en'
    ? `${months[d.getMonth()]} ${d.getDate()}`
    : `${d.getDate()} ${months[d.getMonth()]}`;
}

export function formatDayShortLocale(iso: string, locale: Locale): string {
  const d = parseLocalDate(iso);
  const days = localeDias(locale);
  return `${days[d.getDay()]} ${d.getDate()}`;
}

export function elapsedDaysInWeek(weekStartIso: string): number {
  const start = parseLocalDate(weekStartIso);
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diff = Math.round((today.getTime() - start.getTime()) / 86400000);
  if (diff < 0) return 0;
  if (diff >= 7) return 7;
  return diff + 1;
}

// Locale-agnostic number formatter (defaults to pt-BR thousands separators).
// Components that want locale-aware grouping should call fmtNumLocale via i18n.
export function fmtNum(n: number): string {
  return n.toLocaleString('pt-BR');
}

export { fmtNumLocale };
