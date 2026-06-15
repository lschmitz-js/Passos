import type { Week, WeekEntry } from './api';
import { animalFor, type Animal, type AnimalBands } from './animals';
import { elapsedDaysInWeek, todayIso } from './dates';

export type AnimalCounts = {
  id: string;
  name: string;
  counts: Map<string, number>;
  totalWeeks: number;
};

export function buildAnimalCounts(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  bands: AnimalBands,
  range?: { from: string; to: string }
): AnimalCounts[] {
  const today = todayIso();
  const map = new Map<string, AnimalCounts>();
  for (const w of weeks) {
    if (w.weekStart > today) continue;
    if (range && (w.weekStart < range.from || w.weekStart > range.to)) continue;
    const divisor = Math.max(1, elapsedDaysInWeek(w.weekStart));
    for (const e of w.entries.filter(filter)) {
      const animal = animalFor(e.steps / divisor, bands);
      let a = map.get(e.id);
      if (!a) {
        a = { id: e.id, name: e.name, counts: new Map(), totalWeeks: 0 };
        map.set(e.id, a);
      }
      a.counts.set(animal.emoji, (a.counts.get(animal.emoji) ?? 0) + 1);
      a.totalWeeks++;
    }
  }
  return [...map.values()].sort(
    (a, b) => b.totalWeeks - a.totalWeeks || a.name.localeCompare(b.name)
  );
}

export type WeekAnimals = {
  weekStart: string;
  weekEnd: string;
  entries: { id: string; name: string; animal: Animal; dailyAvg: number; steps: number }[];
};

export function buildWeekAnimals(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  bands: AnimalBands,
  range?: { from: string; to: string }
): WeekAnimals[] {
  const today = todayIso();
  return weeks
    .filter((w) => w.weekStart <= today)
    .filter((w) => !range || (w.weekStart >= range.from && w.weekStart <= range.to))
    .map((w) => {
      const divisor = Math.max(1, elapsedDaysInWeek(w.weekStart));
      const entries = w.entries
        .filter(filter)
        .map((e) => {
          const dailyAvg = Math.round(e.steps / divisor);
          return {
            id: e.id,
            name: e.name,
            animal: animalFor(dailyAvg, bands),
            dailyAvg,
            steps: e.steps,
          };
        })
        .sort((a, b) => b.steps - a.steps);
      return { weekStart: w.weekStart, weekEnd: w.weekEnd, entries };
    })
    .reverse();
}
