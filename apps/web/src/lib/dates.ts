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

// --- Period completeness -------------------------------------------------
//
// A medal or trophy is only *earned* once its period has finished. A week whose
// last day is today is still being walked, so its provisional podium must not
// count -- otherwise Wednesday's leader shows a gold that Sunday may take away.
// Requiring weekEnd < today means the previous week's medals land on Monday,
// which is exactly when people expect to see them.

export function isWeekComplete(weekEndIso: string): boolean {
  return weekEndIso < todayIso();
}

/** 'YYYY-MM-DD' -> 'YYYY-MM'. */
export function monthKeyOf(iso: string): string {
  return iso.slice(0, 7);
}

/** Inclusive first/last day of a 'YYYY-MM' key. */
export function monthBounds(monthKey: string): { start: string; end: string } {
  const [y, m] = monthKey.split('-').map(Number);
  const last = new Date(y!, m!, 0).getDate();
  return { start: `${monthKey}-01`, end: `${monthKey}-${String(last).padStart(2, '0')}` };
}

export function isMonthComplete(monthKey: string): boolean {
  return monthBounds(monthKey).end < todayIso();
}

/** Compact form for chips: "Ago '26". Keeps the year so wins from different
 *  years can't be read as the same month. */
export function formatMonthShortLocale(monthKey: string, locale: Locale): string {
  const [y, m] = monthKey.split('-').map(Number);
  return `${localeMeses(locale)[m! - 1]} ’${String(y).slice(2)}`;
}

export function formatMonthLocale(monthKey: string, locale: Locale): string {
  const [y, m] = monthKey.split('-').map(Number);
  return `${localeMeses(locale)[m! - 1]} ${y}`;
}

/** Number of days of a month that have actually happened (for in-progress months). */
export function elapsedDaysInMonth(monthKey: string): number {
  const { start, end } = monthBounds(monthKey);
  const today = todayIso();
  if (today < start) return 0;
  if (today > end) return parseLocalDate(end).getDate();
  return parseLocalDate(today).getDate();
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
