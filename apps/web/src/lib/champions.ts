import type { Week, WeekEntry } from './api';
import { monthBounds } from './dates';
import { buildMonths, isPreTrophyEra, type Month } from './months';

const THRESHOLD = 10_000;
const BIG_DAY = 20_000;

export type ChampionDay = {
  date: string;
  /** Day of month, for a compact axis. */
  dom: number;
  steps: number;
  /** Cumulative totals for the month's top three, keyed by person id. */
  cum: Record<string, number>;
};

export type Champion = {
  monthKey: string;
  winner: { id: string; name: string; steps: number };
  /** Top three of the month, in order. Colours are assigned from this order. */
  podium: { id: string; name: string; steps: number }[];
  days: ChampionDay[];
  stats: {
    total: number;
    avgPerDay: number;
    bestDay: { date: string; steps: number };
    daysOver10k: number;
    daysTotal: number;
    days20k: number;
    longestStreak: number;
    daysLed: number;
    marginOverSecond: number;
  };
  /**
   * The date the champion took the lead and never lost it. Null when they led
   * from day one -- a race with no lead change has no moment to point at.
   */
  leadTakenOn: string | null;
};

/** Every month that actually awarded a trophy, newest first. */
export function buildChampions(weeks: Week[], filter: (e: WeekEntry) => boolean): Champion[] {
  const months = buildMonths(weeks, filter).filter(
    (m) => m.complete && !m.partial && !isPreTrophyEra(m.key)
  );

  // Per-person daily series, needed for the race and the streaks.
  const series: Record<string, Record<string, number>> = {};
  for (const w of weeks) {
    for (const e of w.entries.filter(filter)) {
      for (const [d, s] of Object.entries(e.days)) (series[e.id] ??= {})[d] = s;
    }
  }

  return months.map((m) => championFor(m, series));
}

function championFor(m: Month, series: Record<string, Record<string, number>>): Champion {
  const podium = m.entries.slice(0, 3).map((e) => ({ id: e.id, name: e.name, steps: e.steps }));
  const winner = podium[0]!;
  const { start, end } = monthBounds(m.key);

  const dates: string[] = [];
  for (const id of Object.keys(series)) {
    for (const d of Object.keys(series[id]!)) {
      if (d >= start && d <= end && !dates.includes(d)) dates.push(d);
    }
  }
  dates.sort();

  const running: Record<string, number> = {};
  for (const p of podium) running[p.id] = 0;

  let leadTakenOn: string | null = null;
  let ledFromStart = true;

  const days: ChampionDay[] = dates.map((date) => {
    for (const p of podium) running[p.id] = (running[p.id] ?? 0) + (series[p.id]?.[date] ?? 0);
    const cum = { ...running };

    // Track the last day the champion was not in front; the day after is when
    // the lead changed hands for good.
    const best = Math.max(...podium.map((p) => cum[p.id] ?? 0));
    const championAhead = (cum[winner.id] ?? 0) >= best;
    if (!championAhead) {
      ledFromStart = false;
      leadTakenOn = null;
    } else if (!ledFromStart && leadTakenOn === null) {
      leadTakenOn = date;
    }

    return {
      date,
      dom: Number(date.slice(8, 10)),
      steps: series[winner.id]?.[date] ?? 0,
      cum,
    };
  });

  const vals = days.map((d) => d.steps);
  const nonZero = vals.filter((v) => v > 0);
  const bestDay = days.reduce((a, b) => (b.steps > a.steps ? b : a), days[0]!);

  let streak = 0;
  let longest = 0;
  for (const v of vals) {
    if (v >= THRESHOLD) {
      streak++;
      longest = Math.max(longest, streak);
    } else streak = 0;
  }

  let daysLed = 0;
  for (const d of dates) {
    let top = 0;
    let topId: string | null = null;
    for (const id of Object.keys(series)) {
      const v = series[id]?.[d] ?? 0;
      if (v > top) {
        top = v;
        topId = id;
      }
    }
    if (topId === winner.id && top > 0) daysLed++;
  }

  return {
    monthKey: m.key,
    winner,
    podium,
    days,
    stats: {
      total: winner.steps,
      avgPerDay: nonZero.length ? Math.round(winner.steps / nonZero.length) : 0,
      bestDay: { date: bestDay.date, steps: bestDay.steps },
      daysOver10k: vals.filter((v) => v >= THRESHOLD).length,
      daysTotal: nonZero.length,
      days20k: vals.filter((v) => v >= BIG_DAY).length,
      longestStreak: longest,
      daysLed,
      marginOverSecond: podium[1] ? winner.steps - podium[1].steps : 0,
    },
    leadTakenOn,
  };
}

/**
 * Month winners from before trophies existed. Shown as an unofficial record so
 * the gallery has history behind it, clearly separated from real trophies.
 */
export function buildPreEraWinners(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean
): { monthKey: string; name: string; steps: number }[] {
  return buildMonths(weeks, filter)
    .filter((m) => m.complete && !m.partial && isPreTrophyEra(m.key))
    .map((m) => ({ monthKey: m.key, name: m.entries[0]!.name, steps: m.entries[0]!.steps }));
}
