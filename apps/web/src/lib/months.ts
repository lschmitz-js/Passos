import type { Week, WeekEntry } from './api';
import { monthKeyOf, monthBounds, isMonthComplete, elapsedDaysInMonth } from './dates';

export type MonthEntry = {
  id: string;
  name: string;
  steps: number;
  /** Days in the month with a non-zero reading. */
  days: number;
  /** Steps per elapsed day of the month, not per day walked. */
  avg: number;
  rank: number;
};

export type Month = {
  key: string;
  start: string;
  end: string;
  /** The calendar month has ended. */
  complete: boolean;
  /** The month began before collection started, so it was never fully observed
   *  -- winning three days of December is not winning December. */
  partial: boolean;
  entries: MonthEntry[];
};

/**
 * Aggregate monthly totals from the per-day map rather than by summing weeks.
 * Weeks straddle month boundaries -- the week of 29 Dec 2025 carries days in
 * both December and January -- so summing week totals would file those steps
 * under whichever month the week started in.
 */
export function buildMonths(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  range?: { from: string; to: string }
): Month[] {
  const byMonth = new Map<string, Map<string, { name: string; steps: number; days: number }>>();
  let firstDate = '9999-12-31';

  for (const w of weeks) {
    for (const e of w.entries.filter(filter)) {
      for (const [date, steps] of Object.entries(e.days)) {
        if (date < firstDate) firstDate = date;
        const key = monthKeyOf(date);
        let users = byMonth.get(key);
        if (!users) {
          users = new Map();
          byMonth.set(key, users);
        }
        let u = users.get(e.id);
        if (!u) {
          u = { name: e.name, steps: 0, days: 0 };
          users.set(e.id, u);
        }
        u.steps += steps;
        if (steps > 0) u.days++;
      }
    }
  }

  const months: Month[] = [];
  for (const [key, users] of byMonth) {
    const { start, end } = monthBounds(key);
    if (range && (end < range.from || start > range.to)) continue;
    const elapsed = Math.max(1, elapsedDaysInMonth(key));
    const entries = [...users.entries()]
      .map(([id, u]) => ({
        id,
        name: u.name,
        steps: u.steps,
        days: u.days,
        avg: Math.round(u.steps / elapsed),
        rank: 0,
      }))
      .filter((e) => e.steps > 0)
      .sort((a, b) => b.steps - a.steps)
      .map((e, i) => ({ ...e, rank: i + 1 }));
    if (entries.length === 0) continue;
    months.push({
      key,
      start,
      end,
      complete: isMonthComplete(key),
      partial: start < firstDate,
      entries,
    });
  }

  return months.sort((a, b) => b.key.localeCompare(a.key));
}

/**
 * Trophies are a new competition, started deliberately rather than backdated
 * over the whole dataset. August 2026 is the first month that awards one, so
 * the first trophy lands on 1 Sep 2026. Change this key to move the start.
 */
export const TROPHY_ERA_START = '2026-08';

export function isPreTrophyEra(monthKey: string): boolean {
  return monthKey < TROPHY_ERA_START;
}

/** id -> trophies held, for badging a name anywhere it appears. */
export function trophyCountsById(months: Month[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const c of buildTrophyTable(months)) out.set(c.id, c.trophies);
  return out;
}

export type TrophyCounts = {
  id: string;
  name: string;
  trophies: number;
  /** Month keys won, oldest first. */
  months: string[];
};

/**
 * The month winner alone takes the trophy. Runners-up are deliberately not
 * counted here: weekly medals already award a top three, so awarding one
 * monthly too would restate the same thing at a coarser resolution and make
 * trophies too common to be worth chasing. Second and third still appear in
 * the per-month history, where they read as context rather than as an award.
 *
 * Winners only count once the month is over, for the same reason weekly medals
 * wait for Sunday night.
 */
export function buildTrophyTable(months: Month[]): TrophyCounts[] {
  const map = new Map<string, TrophyCounts>();
  for (const m of months) {
    if (!m.complete || m.partial || isPreTrophyEra(m.key)) continue;
    const winner = m.entries[0];
    if (!winner) continue;
    let c = map.get(winner.id);
    if (!c) {
      c = { id: winner.id, name: winner.name, trophies: 0, months: [] };
      map.set(winner.id, c);
    }
    c.trophies++;
    c.months.push(m.key);
  }
  for (const c of map.values()) c.months.sort();
  return [...map.values()].sort(
    (a, b) =>
      b.trophies - a.trophies ||
      (b.months[b.months.length - 1] ?? '').localeCompare(a.months[a.months.length - 1] ?? '') ||
      a.name.localeCompare(b.name)
  );
}
