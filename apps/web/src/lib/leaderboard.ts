import type { Week, WeekEntry } from './api';
import { elapsedDaysInWeek, parseLocalDate, todayIso } from './dates';
import { animalFor, type Animal, type AnimalBands } from './animals';

export type WeekRow = {
  id: string;
  name: string;
  steps: number;
  prevAligned: number | null;
  days: Record<string, number>;
  dailyAvg: number;
  elapsed: number;
  rank: number;
  delta: number | null;
  animal: Animal;
  syncStatus: SyncStatus;
};

// Indicator for whether a user's data looks "in sync" within this week's days.
// `none`           — they synced today (or yesterday — grace window)
// `notCurrentWeek` — we're not viewing the live week, indicator is irrelevant
// `staleSince`     — most recent non-zero day is older than yesterday
// `noDataThisWeek` — they have zero across all 7 days
export type SyncStatus =
  | { kind: 'none' }
  | { kind: 'notCurrentWeek' }
  | { kind: 'staleSince'; date: string; daysAgo: number }
  | { kind: 'noDataThisWeek' };

function addDaysIso(iso: string, n: number): string {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + n);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function sumFirstDays(entry: WeekEntry, weekStart: string, elapsed: number): number {
  let s = 0;
  for (let i = 0; i < elapsed; i++) {
    s += entry.days[addDaysIso(weekStart, i)] ?? 0;
  }
  return s;
}

function computeSyncStatus(days: Record<string, number>, weekStart: string, weekEnd: string): SyncStatus {
  const today = todayIso();
  if (today < weekStart || today > weekEnd) return { kind: 'notCurrentWeek' };
  const nonZero = Object.entries(days)
    .filter(([, s]) => s > 0)
    .map(([d]) => d)
    .sort();
  if (nonZero.length === 0) return { kind: 'noDataThisWeek' };
  const latest = nonZero[nonZero.length - 1]!;
  const yesterday = addDaysIso(today, -1);
  if (latest >= yesterday) return { kind: 'none' };
  const dToday = parseLocalDate(today);
  const dLatest = parseLocalDate(latest);
  const daysAgo = Math.round((dToday.getTime() - dLatest.getTime()) / 86400000);
  return { kind: 'staleSince', date: latest, daysAgo };
}

export function buildWeek(
  week: Week,
  prevWeek: Week | null,
  filter: (e: WeekEntry) => boolean,
  bands: AnimalBands
): WeekRow[] {
  const prevRank = new Map<string, number>();
  const prevEntries = new Map<string, WeekEntry>();
  if (prevWeek) {
    [...prevWeek.entries]
      .filter(filter)
      .sort((a, b) => b.steps - a.steps)
      .forEach((e, i) => {
        prevRank.set(e.id, i + 1);
        prevEntries.set(e.id, e);
      });
  }
  const elapsed = elapsedDaysInWeek(week.weekStart);
  const divisor = Math.max(1, elapsed);
  return [...week.entries]
    .filter(filter)
    .sort((a, b) => b.steps - a.steps)
    .map((e, i) => {
      const rank = i + 1;
      const prevR = prevRank.get(e.id);
      const dailyAvg = Math.round(e.steps / divisor);
      const animal = animalFor(dailyAvg, bands);
      const prevEntry = prevEntries.get(e.id);
      const prevAligned = prevEntry
        ? sumFirstDays(prevEntry, prevWeek!.weekStart, elapsed)
        : null;
      return {
        id: e.id,
        name: e.name,
        steps: e.steps,
        prevAligned,
        days: e.days,
        dailyAvg,
        elapsed,
        rank,
        delta: prevR != null ? prevR - rank : null,
        animal,
        syncStatus: computeSyncStatus(e.days, week.weekStart, week.weekEnd),
      };
    });
}

export type PersonalRecords = {
  bestDay: { date: string; steps: number } | null;
  bestWeek: { weekStart: string; weekEnd: string; steps: number } | null;
  longestStreak: { length: number; start: string; end: string } | null;
  totalKm: number;
  daysActive: number;
  totalDays: number;
  favoriteWeekday: { day: number; avg: number } | null;
};

function isoNext(iso: string): string {
  return addDaysIso(iso, 1);
}

export function buildPersonalRecords(
  weeks: Week[],
  userId: string,
  threshold = 10000
): PersonalRecords {
  let bestDay: PersonalRecords['bestDay'] = null;
  let bestWeek: PersonalRecords['bestWeek'] = null;
  let totalSteps = 0;
  const series = new Map<string, number>();

  for (const w of weeks) {
    const e = w.entries.find((x) => x.id === userId);
    if (!e) continue;
    if (!bestWeek || e.steps > bestWeek.steps) {
      bestWeek = { weekStart: w.weekStart, weekEnd: w.weekEnd, steps: e.steps };
    }
    for (const [date, steps] of Object.entries(e.days)) {
      series.set(date, steps);
      totalSteps += steps;
      if (steps > 0 && (!bestDay || steps > bestDay.steps)) {
        bestDay = { date, steps };
      }
    }
  }

  const sortedDates = [...series.keys()].sort();
  let longestStreak: PersonalRecords['longestStreak'] = null;
  let curStart: string | null = null;
  let curLen = 0;
  let curEnd: string | null = null;
  for (const d of sortedDates) {
    const steps = series.get(d) ?? 0;
    if (steps >= threshold) {
      if (curStart === null || (curEnd && isoNext(curEnd) !== d)) {
        if (curStart && (!longestStreak || curLen > longestStreak.length)) {
          longestStreak = { length: curLen, start: curStart, end: curEnd! };
        }
        curStart = d;
        curLen = 1;
        curEnd = d;
      } else {
        curLen++;
        curEnd = d;
      }
    } else {
      if (curStart && (!longestStreak || curLen > longestStreak.length)) {
        longestStreak = { length: curLen, start: curStart, end: curEnd! };
      }
      curStart = null;
      curLen = 0;
      curEnd = null;
    }
  }
  if (curStart && (!longestStreak || curLen > longestStreak.length)) {
    longestStreak = { length: curLen, start: curStart, end: curEnd! };
  }

  const byWeekday: number[][] = [[], [], [], [], [], [], []];
  for (const [date, steps] of series) {
    if (steps === 0) continue;
    const d = parseLocalDate(date);
    byWeekday[d.getDay()]!.push(steps);
  }
  let favoriteWeekday: PersonalRecords['favoriteWeekday'] = null;
  for (let i = 0; i < 7; i++) {
    const arr = byWeekday[i]!;
    if (arr.length === 0) continue;
    const avg = arr.reduce((s, x) => s + x, 0) / arr.length;
    if (!favoriteWeekday || avg > favoriteWeekday.avg) {
      favoriteWeekday = { day: i, avg: Math.round(avg) };
    }
  }

  return {
    bestDay,
    bestWeek,
    longestStreak,
    totalKm: Math.round(totalSteps * 0.000762),
    daysActive: [...series.values()].filter((v) => v > 0).length,
    totalDays: series.size,
    favoriteWeekday,
  };
}

export type YearRow = {
  id: string;
  name: string;
  total: number;
  weeks: number;
  best: number;
  bestWeek: string;
  wins: number;
  podiums: number;
  dailyAvg: number;
  rank: number;
  animal: Animal;
  records: PersonalRecords;
};

export function buildYear(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  bands: AnimalBands
): YearRow[] {
  type Acc = Omit<YearRow, 'dailyAvg' | 'rank' | 'animal' | 'records'>;
  const map = new Map<string, Acc>();
  weeks.forEach((w) => {
    const filtered = w.entries.filter(filter);
    if (filtered.length === 0) return;
    const ranked = [...filtered].sort((a, b) => b.steps - a.steps);
    ranked.forEach((e, i) => {
      if (!map.has(e.id)) {
        map.set(e.id, {
          id: e.id,
          name: e.name,
          total: 0,
          weeks: 0,
          best: 0,
          bestWeek: '',
          wins: 0,
          podiums: 0,
        });
      }
      const p = map.get(e.id)!;
      p.total += e.steps;
      p.weeks++;
      if (e.steps > p.best) {
        p.best = e.steps;
        p.bestWeek = w.weekStart;
      }
      if (i + 1 === 1) p.wins++;
      if (i + 1 <= 3) p.podiums++;
    });
  });

  const daysActive = new Map<string, number>();
  weeks.forEach((w) => {
    w.entries.filter(filter).forEach((e) => {
      const active = Object.values(e.days).filter((v) => v > 0).length;
      daysActive.set(e.id, (daysActive.get(e.id) ?? 0) + active);
    });
  });

  return [...map.values()]
    .map((p) => {
      const active = daysActive.get(p.id) ?? p.weeks * 7;
      const dailyAvg = active ? Math.round(p.total / active) : 0;
      const animal = animalFor(dailyAvg, bands);
      const records = buildPersonalRecords(weeks, p.id);
      return { ...p, dailyAvg, animal, records };
    })
    .sort((a, b) => b.total - a.total)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export function pickDefaultWeekIdx(weeks: Week[]): number {
  let idx = weeks.length - 1;
  if (idx <= 0) return idx;
  const last = weeks[idx]!;
  const tooFew = last.entries.length < 2;
  if (tooFew) idx--;
  return idx;
}

export function computeAnimalBands(weeks: Week[], filter: (e: WeekEntry) => boolean): AnimalBands {
  const avgs: number[] = [];
  for (const w of weeks) {
    const elapsed = elapsedDaysInWeek(w.weekStart);
    const divisor = Math.max(1, elapsed);
    for (const e of w.entries.filter(filter)) {
      avgs.push(e.steps / divisor);
    }
  }
  if (avgs.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...avgs), max: Math.max(...avgs) };
}
