import type { Week, WeekEntry } from './api';

export type DailyPoint = { date: string; [userId: string]: number | string };

function aggregateUsers(weeks: Week[], filter: (e: WeekEntry) => boolean) {
  const totals = new Map<string, { name: string; total: number }>();
  for (const w of weeks) {
    for (const e of w.entries.filter(filter)) {
      const cur = totals.get(e.id);
      if (cur) cur.total += e.steps;
      else totals.set(e.id, { name: e.name, total: e.steps });
    }
  }
  return [...totals.entries()]
    .map(([id, v]) => ({ id, name: v.name, total: v.total }))
    .sort((a, b) => b.total - a.total);
}

export function buildDailyTimeline(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  range: { from: string; to: string }
): { points: DailyPoint[]; users: { id: string; name: string; total: number }[] } {
  const byDate = new Map<string, Record<string, number>>();
  for (const w of weeks) {
    for (const e of w.entries.filter(filter)) {
      for (const [date, steps] of Object.entries(e.days)) {
        if (date < range.from || date > range.to) continue;
        if (!byDate.has(date)) byDate.set(date, {});
        byDate.get(date)![e.id] = steps;
      }
    }
  }
  const sortedDates = [...byDate.keys()].sort();
  const points: DailyPoint[] = sortedDates.map((date) => ({ date, ...byDate.get(date)! }));
  return { points, users: aggregateUsers(weeks, filter) };
}

export function buildWeeklyTimeline(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  range: { from: string; to: string }
): { points: DailyPoint[]; users: { id: string; name: string; total: number }[] } {
  const points: DailyPoint[] = weeks
    .filter((w) => w.weekStart >= range.from && w.weekStart <= range.to)
    .map((w) => {
      const point: DailyPoint = { date: w.weekStart };
      for (const e of w.entries.filter(filter)) {
        point[e.id] = e.steps;
      }
      return point;
    });
  return { points, users: aggregateUsers(weeks, filter) };
}

export function buildRankTimeline(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  range: { from: string; to: string }
): { points: DailyPoint[]; users: { id: string; name: string; total: number }[] } {
  const points: DailyPoint[] = weeks
    .filter((w) => w.weekStart >= range.from && w.weekStart <= range.to)
    .map((w) => {
      const filtered = [...w.entries.filter(filter)].sort((a, b) => b.steps - a.steps);
      const point: DailyPoint = { date: w.weekStart };
      filtered.forEach((e, i) => {
        point[e.id] = i + 1;
      });
      return point;
    });
  return { points, users: aggregateUsers(weeks, filter) };
}

export const TIMELINE_COLORS = [
  '#d4a017',
  '#c08850',
  '#1e7a8c',
  '#3d8b3d',
  '#9c5d8b',
  '#c4541d',
  '#5d8c7a',
  '#6b4c8b',
  '#8b4513',
  '#7a8c3d',
];

export function colorForIndex(i: number): string {
  return TIMELINE_COLORS[i % TIMELINE_COLORS.length]!;
}
