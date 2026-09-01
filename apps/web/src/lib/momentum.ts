import type { Week, WeekEntry } from './api';

/**
 * Who is hottest right now, over the last couple of days.
 *
 * The board is cumulative, so someone having a huge two days looks identical to
 * someone coasting until the totals catch up days later. This surfaces form
 * rather than standing -- you can sit sixth overall and still be the one on
 * fire, which is a second competition the leaderboard cannot show on its own.
 *
 * The window is the most recent dates present in the data rather than "today
 * and yesterday" by the clock: on a Monday morning nobody has meaningful steps
 * yet, and a window anchored to real data still says something.
 */
export function hotLeader(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean,
  days = 2
): { id: string; steps: number; from: string; to: string } | null {
  const series = new Map<string, Map<string, number>>();
  const allDates = new Set<string>();

  for (const w of weeks) {
    for (const e of w.entries.filter(filter)) {
      let m = series.get(e.id);
      if (!m) {
        m = new Map();
        series.set(e.id, m);
      }
      for (const [d, s] of Object.entries(e.days)) {
        m.set(d, s);
        if (s > 0) allDates.add(d);
      }
    }
  }

  const window = [...allDates].sort().slice(-days);
  if (window.length === 0) return null;

  let best: { id: string; steps: number } | null = null;
  for (const [id, m] of series) {
    const steps = window.reduce((a, d) => a + (m.get(d) ?? 0), 0);
    if (steps > 0 && (!best || steps > best.steps)) best = { id, steps };
  }
  if (!best) return null;

  return { ...best, from: window[0]!, to: window[window.length - 1]! };
}
