import type { Week, WeekEntry } from './api';
import { isWeekComplete } from './dates';

export type MedalCounts = {
  id: string;
  name: string;
  gold: number;
  silver: number;
  bronze: number;
};

export function buildMedalTable(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  range?: { from: string; to: string }
): MedalCounts[] {
  const map = new Map<string, MedalCounts>();
  for (const w of weeks) {
    // Only finished weeks award medals -- see isWeekComplete.
    if (!isWeekComplete(w.weekEnd)) continue;
    if (range && (w.weekStart < range.from || w.weekStart > range.to)) continue;
    const ranked = [...w.entries.filter(filter)].sort((a, b) => b.steps - a.steps);
    ranked.slice(0, 3).forEach((e, i) => {
      let m = map.get(e.id);
      if (!m) {
        m = { id: e.id, name: e.name, gold: 0, silver: 0, bronze: 0 };
        map.set(e.id, m);
      }
      if (i === 0) m.gold++;
      else if (i === 1) m.silver++;
      else if (i === 2) m.bronze++;
    });
  }
  return [...map.values()].sort(
    (a, b) =>
      b.gold - a.gold ||
      b.silver - a.silver ||
      b.bronze - a.bronze ||
      a.name.localeCompare(b.name)
  );
}

export type WeekPodium = {
  weekStart: string;
  weekEnd: string;
  podium: { rank: 1 | 2 | 3; id: string; name: string; steps: number }[];
};

export function buildWeekPodiums(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  range?: { from: string; to: string }
): WeekPodium[] {
  return weeks
    .filter((w) => isWeekComplete(w.weekEnd))
    .filter((w) => !range || (w.weekStart >= range.from && w.weekStart <= range.to))
    .map((w) => {
      const ranked = [...w.entries.filter(filter)]
        .sort((a, b) => b.steps - a.steps)
        .slice(0, 3);
      return {
        weekStart: w.weekStart,
        weekEnd: w.weekEnd,
        podium: ranked.map((e, i) => ({
          rank: (i + 1) as 1 | 2 | 3,
          id: e.id,
          name: e.name,
          steps: e.steps,
        })),
      };
    })
    .reverse();
}
