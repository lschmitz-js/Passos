import type { WeekEntry } from './api';
import type { Gender } from './animals';
import type { Locale } from './i18n';

export type GroupKey = 'familia' | 'todos';

const FAMILY_IDS = new Set([
  '136367709', // Joana
  '136467633', // Joao Bruno
  '133104715', // Alice
  '111100771', // Leo
  '139402941', // Ivana
  '111133818', // Elisabeth
  '149194897', // Laurent
]);

// Hardcoded gender per Garmin profile id. Used to pick the right form of the
// assigned animal (Camelo vs Camela, Lobo vs Loba, ...).
export const GENDERS: Record<string, Gender> = {
  '136367709': 'f', // Joana
  '136467633': 'm', // Joao Bruno
  '133104715': 'f', // Alice
  '111100771': 'm', // Leo
  '139402941': 'f', // Ivana
  '111133818': 'f', // Elisabeth
  '149194897': 'm', // Laurent
  '115345692': 'm', // Andre
  '8646058':   'm', // Felipe
  '142597657': 'm', // Bill
  '115366554': 'f', // Amanda Sad
};

export function genderFor(id: string): Gender {
  return GENDERS[id] ?? 'm';
}

const DISPLAY_OVERRIDES: Record<string, Record<Locale, string>> = {
  '133104715': { pt: 'Mãe', en: 'Mom', fr: 'Maman' }, // Alice
  '136467633': { pt: 'Pai', en: 'Dad', fr: 'Papa' }, // Joao Bruno
};

export function displayName(id: string, fullName: string, locale: Locale): string {
  const override = DISPLAY_OVERRIDES[id];
  if (override) return override[locale];
  return fullName.split(' ')[0] ?? fullName;
}

export const GROUPS: Record<GroupKey, { label: string; filter: (e: WeekEntry) => boolean }> = {
  familia: {
    label: '🏡 Família',
    filter: (e) => FAMILY_IDS.has(e.id),
  },
  todos: {
    label: '🌍 Família e Amigos',
    filter: () => true,
  },
};

export function parseGroup(value: string | null | undefined): GroupKey {
  return value === 'familia' ? 'familia' : 'todos';
}
