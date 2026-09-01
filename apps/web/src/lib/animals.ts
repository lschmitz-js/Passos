import type { Locale } from './i18n';

export type Gender = 'm' | 'f';

export type Animal = {
  emoji: string;
  pt: { m: string; f: string };
  en: string;
  fr: { m: string; f: string };
  km: number;
  fact: { pt: string; en: string; fr: string };
};

export const ANIMALS: Animal[] = [
  { emoji: '🦌', pt: { m: 'Caribu', f: 'Caribu' }, en: 'Caribou', fr: { m: 'Caribou', f: 'Caribou' }, km: 50, fact: { pt: 'Migra até 5.000 km/ano, ~50 km/dia em rotas longas', en: 'Migrates up to 5,000 km/year, ~50 km/day on long routes', fr: 'Migre jusqu’à 5 000 km/an, ~50 km/jour sur les longs trajets' } },
  { emoji: '🐺', pt: { m: 'Lobo', f: 'Loba' }, en: 'Wolf', fr: { m: 'Loup', f: 'Louve' }, km: 35, fact: { pt: 'Patrulha território enorme em alcateia, até 60 km/dia', en: 'Patrols a huge territory in packs, up to 60 km/day', fr: 'Patrouille un immense territoire en meute, jusqu’à 60 km/jour' } },
  { emoji: '🐪', pt: { m: 'Camelo', f: 'Camela' }, en: 'Camel', fr: { m: 'Chameau', f: 'Chamelle' }, km: 40, fact: { pt: 'Caravanas no deserto, 30–40 km/dia carregando peso', en: 'Desert caravans, 30–40 km/day carrying loads', fr: 'Caravanes du désert, 30–40 km/jour avec des charges' } },
  { emoji: '🐘', pt: { m: 'Elefante', f: 'Elefanta' }, en: 'Elephant', fr: { m: 'Éléphant', f: 'Éléphante' }, km: 25, fact: { pt: 'Família anda 15–25 km/dia procurando água', en: 'Family walks 15–25 km/day looking for water', fr: 'La famille marche 15–25 km/jour à la recherche d’eau' } },
  { emoji: '🦓', pt: { m: 'Zebra', f: 'Zebra' }, en: 'Zebra', fr: { m: 'Zèbre', f: 'Zèbre' }, km: 30, fact: { pt: 'Acompanha gnus na grande migração do Serengeti', en: 'Joins wildebeest in the great Serengeti migration', fr: 'Suit les gnous dans la grande migration du Serengeti' } },
  { emoji: '🦒', pt: { m: 'Girafa', f: 'Girafa' }, en: 'Giraffe', fr: { m: 'Girafe', f: 'Girafe' }, km: 20, fact: { pt: 'Anda devagar mas constante, ~20 km/dia em savana', en: 'Walks slow but steady, ~20 km/day in savanna', fr: 'Avance lentement mais sûrement, ~20 km/jour en savane' } },
  { emoji: '🐆', pt: { m: 'Leopardo', f: 'Leoparda' }, en: 'Leopard', fr: { m: 'Léopard', f: 'Léoparde' }, km: 14, fact: { pt: 'Caçador solitário, percorre 10–18 km/noite', en: 'Solitary hunter, roams 10–18 km/night', fr: 'Chasseur solitaire, parcourt 10–18 km/nuit' } },
  { emoji: '🦬', pt: { m: 'Bisão', f: 'Bisão' }, en: 'Bison', fr: { m: 'Bison', f: 'Bisonne' }, km: 12, fact: { pt: 'Manada migra 10–12 km/dia entre pastagens', en: 'Herd migrates 10–12 km/day between pastures', fr: 'Le troupeau migre 10–12 km/jour entre les pâturages' } },
  { emoji: '🐃', pt: { m: 'Búfalo', f: 'Búfala' }, en: 'Buffalo', fr: { m: 'Buffle', f: 'Bufflonne' }, km: 11, fact: { pt: 'Cardume robusto, faz 10–12 km/dia em rebanho', en: 'Sturdy herd, walks 10–12 km/day together', fr: 'Troupeau robuste, 10–12 km/jour tous ensemble' } },
  { emoji: '🦏', pt: { m: 'Rinoceronte', f: 'Rinoceronte' }, en: 'Rhino', fr: { m: 'Rhinocéros', f: 'Rhinocéros' }, km: 10, fact: { pt: 'Pesado mas territorial, 8–10 km/dia', en: 'Heavy but territorial, 8–10 km/day', fr: 'Lourd mais territorial, 8–10 km/jour' } },
  { emoji: '🐎', pt: { m: 'Cavalo', f: 'Égua' }, en: 'Horse', fr: { m: 'Cheval', f: 'Jument' }, km: 9, fact: { pt: 'Selvagem em estepe, 8–10 km/dia em harém', en: 'Wild on the steppe, 8–10 km/day in a band', fr: 'Sauvage dans la steppe, 8–10 km/jour en troupeau' } },
  { emoji: '🦁', pt: { m: 'Leão', f: 'Leoa' }, en: 'Lion', fr: { m: 'Lion', f: 'Lionne' }, km: 8, fact: { pt: 'Caça em grupo, descansa 20h/dia', en: 'Hunts in groups, rests 20h/day', fr: 'Chasse en groupe, se repose 20 h/jour' } },
  { emoji: '🐕', pt: { m: 'Cachorro', f: 'Cachorra' }, en: 'Dog', fr: { m: 'Chien', f: 'Chienne' }, km: 6, fact: { pt: 'Anda 4–8 km/dia com humanos no passeio', en: 'Walks 4–8 km/day with humans', fr: 'Marche 4–8 km/jour en promenade avec les humains' } },
  { emoji: '🦘', pt: { m: 'Canguru', f: 'Canguru' }, en: 'Kangaroo', fr: { m: 'Kangourou', f: 'Kangourou' }, km: 5, fact: { pt: 'Salta longas distâncias quando precisa, 4–6 km/dia', en: 'Hops long distances when needed, 4–6 km/day', fr: 'Bondit sur de longues distances au besoin, 4–6 km/jour' } },
  { emoji: '🐈', pt: { m: 'Gato', f: 'Gata' }, en: 'Cat', fr: { m: 'Chat', f: 'Chatte' }, km: 3, fact: { pt: 'Dorme 16h/dia, anda em rondas curtas', en: 'Sleeps 16h/day, short patrols only', fr: 'Dort 16 h/jour, ne fait que de courtes rondes' } },
  { emoji: '🐢', pt: { m: 'Tartaruga', f: 'Tartaruga' }, en: 'Turtle', fr: { m: 'Tortue', f: 'Tortue' }, km: 1, fact: { pt: 'Devagar e sempre, ~1 km/dia em terra', en: 'Slow and steady, ~1 km/day on land', fr: 'Lente mais constante, ~1 km/jour sur terre' } },
  { emoji: '🦦', pt: { m: 'Lontra', f: 'Lontra' }, en: 'Otter', fr: { m: 'Loutre', f: 'Loutre' }, km: 0.5, fact: { pt: 'Adora água, anda pouco em terra', en: 'Loves water, walks little on land', fr: 'Adore l’eau, marche peu sur terre' } },
  { emoji: '🐌', pt: { m: 'Caracol', f: 'Caracol' }, en: 'Snail', fr: { m: 'Escargot', f: 'Escargot' }, km: 0.05, fact: { pt: 'Famoso pela lentidão, ~50 m/dia', en: 'Famously slow, ~50 m/day', fr: 'Célèbre pour sa lenteur, ~50 m/jour' } },
  { emoji: '🦥', pt: { m: 'Preguiça', f: 'Preguiça' }, en: 'Sloth', fr: { m: 'Paresseux', f: 'Paresseuse' }, km: 0.04, fact: { pt: 'Lenda da lentidão, ~40 m/dia', en: 'Legendary slowness, ~40 m/day', fr: 'Légende de la lenteur, ~40 m/jour' } },
  { emoji: '🐨', pt: { m: 'Coala', f: 'Coala' }, en: 'Koala', fr: { m: 'Koala', f: 'Koala' }, km: 0.02, fact: { pt: 'Quase não desce da árvore, ~20 m/dia', en: 'Rarely leaves the tree, ~20 m/day', fr: 'Descend rarement de son arbre, ~20 m/jour' } },
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
  const forms = locale === 'fr' ? animal.fr : animal.pt;
  return gender === 'f' ? forms.f : forms.m;
}

export function animalFact(animal: Animal, locale: Locale): string {
  return animal.fact[locale];
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
