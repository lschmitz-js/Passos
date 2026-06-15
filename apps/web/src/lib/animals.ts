import type { Locale } from './i18n';

export type Gender = 'm' | 'f';

export type Animal = {
  emoji: string;
  pt: { m: string; f: string };
  en: string;
  km: number;
  fact: { pt: string; en: string };
};

export const ANIMALS: Animal[] = [
  { emoji: '🦌', pt: { m: 'Caribu', f: 'Caribu' }, en: 'Caribou', km: 50, fact: { pt: 'Migra até 5.000 km/ano, ~50 km/dia em rotas longas', en: 'Migrates up to 5,000 km/year, ~50 km/day on long routes' } },
  { emoji: '🐺', pt: { m: 'Lobo', f: 'Loba' }, en: 'Wolf', km: 35, fact: { pt: 'Patrulha território enorme em alcateia, até 60 km/dia', en: 'Patrols a huge territory in packs, up to 60 km/day' } },
  { emoji: '🐪', pt: { m: 'Camelo', f: 'Camela' }, en: 'Camel', km: 40, fact: { pt: 'Caravanas no deserto, 30–40 km/dia carregando peso', en: 'Desert caravans, 30–40 km/day carrying loads' } },
  { emoji: '🐘', pt: { m: 'Elefante', f: 'Elefanta' }, en: 'Elephant', km: 25, fact: { pt: 'Família anda 15–25 km/dia procurando água', en: 'Family walks 15–25 km/day looking for water' } },
  { emoji: '🦓', pt: { m: 'Zebra', f: 'Zebra' }, en: 'Zebra', km: 30, fact: { pt: 'Acompanha gnus na grande migração do Serengeti', en: 'Joins wildebeest in the great Serengeti migration' } },
  { emoji: '🦒', pt: { m: 'Girafa', f: 'Girafa' }, en: 'Giraffe', km: 20, fact: { pt: 'Anda devagar mas constante, ~20 km/dia em savana', en: 'Walks slow but steady, ~20 km/day in savanna' } },
  { emoji: '🐆', pt: { m: 'Leopardo', f: 'Leoparda' }, en: 'Leopard', km: 14, fact: { pt: 'Caçador solitário, percorre 10–18 km/noite', en: 'Solitary hunter, roams 10–18 km/night' } },
  { emoji: '🦬', pt: { m: 'Bisão', f: 'Bisão' }, en: 'Bison', km: 12, fact: { pt: 'Manada migra 10–12 km/dia entre pastagens', en: 'Herd migrates 10–12 km/day between pastures' } },
  { emoji: '🐃', pt: { m: 'Búfalo', f: 'Búfala' }, en: 'Buffalo', km: 11, fact: { pt: 'Cardume robusto, faz 10–12 km/dia em rebanho', en: 'Sturdy herd, walks 10–12 km/day together' } },
  { emoji: '🦏', pt: { m: 'Rinoceronte', f: 'Rinoceronte' }, en: 'Rhino', km: 10, fact: { pt: 'Pesado mas territorial, 8–10 km/dia', en: 'Heavy but territorial, 8–10 km/day' } },
  { emoji: '🐎', pt: { m: 'Cavalo', f: 'Égua' }, en: 'Horse', km: 9, fact: { pt: 'Selvagem em estepe, 8–10 km/dia em harém', en: 'Wild on the steppe, 8–10 km/day in a band' } },
  { emoji: '🦁', pt: { m: 'Leão', f: 'Leoa' }, en: 'Lion', km: 8, fact: { pt: 'Caça em grupo, descansa 20h/dia', en: 'Hunts in groups, rests 20h/day' } },
  { emoji: '🐕', pt: { m: 'Cachorro', f: 'Cachorra' }, en: 'Dog', km: 6, fact: { pt: 'Anda 4–8 km/dia com humanos no passeio', en: 'Walks 4–8 km/day with humans' } },
  { emoji: '🦘', pt: { m: 'Canguru', f: 'Canguru' }, en: 'Kangaroo', km: 5, fact: { pt: 'Salta longas distâncias quando precisa, 4–6 km/dia', en: 'Hops long distances when needed, 4–6 km/day' } },
  { emoji: '🐈', pt: { m: 'Gato', f: 'Gata' }, en: 'Cat', km: 3, fact: { pt: 'Dorme 16h/dia, anda em rondas curtas', en: 'Sleeps 16h/day, short patrols only' } },
  { emoji: '🐢', pt: { m: 'Tartaruga', f: 'Tartaruga' }, en: 'Turtle', km: 1, fact: { pt: 'Devagar e sempre, ~1 km/dia em terra', en: 'Slow and steady, ~1 km/day on land' } },
  { emoji: '🦦', pt: { m: 'Lontra', f: 'Lontra' }, en: 'Otter', km: 0.5, fact: { pt: 'Adora água, anda pouco em terra', en: 'Loves water, walks little on land' } },
  { emoji: '🐌', pt: { m: 'Caracol', f: 'Caracol' }, en: 'Snail', km: 0.05, fact: { pt: 'Famoso pela lentidão, ~50 m/dia', en: 'Famously slow, ~50 m/day' } },
  { emoji: '🦥', pt: { m: 'Preguiça', f: 'Preguiça' }, en: 'Sloth', km: 0.04, fact: { pt: 'Lenda da lentidão, ~40 m/dia', en: 'Legendary slowness, ~40 m/day' } },
  { emoji: '🐨', pt: { m: 'Coala', f: 'Coala' }, en: 'Koala', km: 0.02, fact: { pt: 'Quase não desce da árvore, ~20 m/dia', en: 'Rarely leaves the tree, ~20 m/day' } },
];

export type AnimalBands = { min: number; max: number };

export function animalIndexFor(dailyAvg: number, bands: AnimalBands): number {
  if (bands.max <= bands.min) return 0;
  const clamped = Math.max(bands.min, Math.min(bands.max, dailyAvg));
  const fraction = (clamped - bands.min) / (bands.max - bands.min);
  return Math.round((1 - fraction) * (ANIMALS.length - 1));
}

export function animalFor(dailyAvg: number, bands: AnimalBands): Animal {
  return ANIMALS[animalIndexFor(dailyAvg, bands)]!;
}

export function animalName(animal: Animal, gender: Gender, locale: Locale): string {
  if (locale === 'en') return animal.en;
  return gender === 'f' ? animal.pt.f : animal.pt.m;
}

export function animalFact(animal: Animal, locale: Locale): string {
  return locale === 'en' ? animal.fact.en : animal.fact.pt;
}

// Returns the daily-avg step range that maps to animal at `idx`. Inverse of
// the animalIndexFor rounding-to-nearest scheme: each tier covers a slice of
// width 1/(N-1) centered on the tier midpoint.
export function bandRange(idx: number, bands: AnimalBands): { lo: number; hi: number } {
  const total = ANIMALS.length;
  if (bands.max <= bands.min) return { lo: 0, hi: 0 };
  const span = bands.max - bands.min;
  const flo = Math.max(0, (total - 1 - idx - 0.5) / (total - 1));
  const fhi = Math.min(1, (total - 1 - idx + 0.5) / (total - 1));
  return {
    lo: Math.round(bands.min + flo * span),
    hi: Math.round(bands.min + fhi * span),
  };
}
