import type { Week, WeekEntry } from './api';
import { parseLocalDate } from './dates';

export type Records = {
  bestDay: { userId: string; name: string; date: string; steps: number } | null;
  bestStreak: { userId: string; name: string; length: number; start: string; end: string } | null;
  bestWeek: { userId: string; name: string; weekStart: string; weekEnd: string; steps: number } | null;
  totalKm: number;
};

function isoNext(iso: string): string {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function buildRecords(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  threshold = 10000
): Records {
  let bestDay: Records['bestDay'] = null;
  let bestWeek: Records['bestWeek'] = null;
  let totalSteps = 0;

  const userDaily = new Map<string, { name: string; days: Map<string, number> }>();

  for (const w of weeks) {
    const filtered = w.entries.filter(filter);
    let weekTop: { id: string; name: string; steps: number } | null = null;

    for (const e of filtered) {
      totalSteps += e.steps;
      if (!weekTop || e.steps > weekTop.steps) {
        weekTop = { id: e.id, name: e.name, steps: e.steps };
      }
      let series = userDaily.get(e.id);
      if (!series) {
        series = { name: e.name, days: new Map() };
        userDaily.set(e.id, series);
      }
      for (const [date, steps] of Object.entries(e.days)) {
        series.days.set(date, steps);
        if (steps > 0 && (!bestDay || steps > bestDay.steps)) {
          bestDay = { userId: e.id, name: e.name, date, steps };
        }
      }
    }

    if (weekTop && (!bestWeek || weekTop.steps > bestWeek.steps)) {
      bestWeek = {
        userId: weekTop.id,
        name: weekTop.name,
        weekStart: w.weekStart,
        weekEnd: w.weekEnd,
        steps: weekTop.steps,
      };
    }
  }

  let bestStreak: Records['bestStreak'] = null;
  for (const [id, series] of userDaily) {
    const dates = [...series.days.keys()].sort();
    let curStart: string | null = null;
    let curLen = 0;
    let curEnd: string | null = null;
    for (const d of dates) {
      const steps = series.days.get(d) ?? 0;
      if (steps >= threshold) {
        if (curStart === null || (curEnd && isoNext(curEnd) !== d)) {
          if (curStart && (!bestStreak || curLen > bestStreak.length)) {
            bestStreak = { userId: id, name: series.name, length: curLen, start: curStart, end: curEnd! };
          }
          curStart = d;
          curLen = 1;
          curEnd = d;
        } else {
          curLen++;
          curEnd = d;
        }
      } else {
        if (curStart && (!bestStreak || curLen > bestStreak.length)) {
          bestStreak = { userId: id, name: series.name, length: curLen, start: curStart, end: curEnd! };
        }
        curStart = null;
        curLen = 0;
        curEnd = null;
      }
    }
    if (curStart && (!bestStreak || curLen > bestStreak.length)) {
      bestStreak = { userId: id, name: series.name, length: curLen, start: curStart, end: curEnd! };
    }
  }

  return {
    bestDay,
    bestStreak,
    bestWeek,
    totalKm: Math.round(totalSteps * 0.000762),
  };
}
