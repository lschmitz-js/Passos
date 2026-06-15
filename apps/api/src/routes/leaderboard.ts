import { Hono } from 'hono';
import { getDb } from '../db/index.js';

export const leaderboard = new Hono();

type Row = {
  profile_pk: string;
  name: string;
  date: string;
  steps: number;
  captured_at: number;
};

function mondayOf(dateIso: string): string {
  const d = new Date(dateIso + 'T00:00:00Z');
  const day = d.getUTCDay();
  const offset = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}

function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type WeekEntry = {
  id: string;
  name: string;
  steps: number;
  rank: number;
  days: Record<string, number>;
};
type Week = { weekStart: string; weekEnd: string; collectedAt: string; entries: WeekEntry[] };

function buildWeeks(): { weeks: Week[] } {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT d.profile_pk, u.name, d.date, d.steps, d.captured_at
       FROM daily_steps d
       JOIN users u ON u.profile_pk = d.profile_pk
       ORDER BY d.date ASC`
    )
    .all() as Row[];

  if (rows.length === 0) return { weeks: [] };

  type Agg = { name: string; total: number; latest: number; days: Record<string, number> };
  const byWeek = new Map<string, Map<string, Agg>>();
  for (const r of rows) {
    const ws = mondayOf(r.date);
    let users = byWeek.get(ws);
    if (!users) {
      users = new Map();
      byWeek.set(ws, users);
    }
    const cur = users.get(r.profile_pk);
    if (cur) {
      cur.total += r.steps;
      cur.days[r.date] = r.steps;
      if (r.captured_at > cur.latest) cur.latest = r.captured_at;
    } else {
      users.set(r.profile_pk, {
        name: r.name,
        total: r.steps,
        latest: r.captured_at,
        days: { [r.date]: r.steps },
      });
    }
  }

  const weeks: Week[] = [];
  const sortedStarts = [...byWeek.keys()].sort();
  for (const weekStart of sortedStarts) {
    const users = byWeek.get(weekStart)!;
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) weekDates.push(addDays(weekStart, i));

    const entries = [...users.entries()]
      .map(([id, v]) => {
        const days: Record<string, number> = {};
        for (const d of weekDates) days[d] = v.days[d] ?? 0;
        return { id, name: v.name, steps: v.total, days };
      })
      .sort((a, b) => b.steps - a.steps)
      .map((e, i) => ({ ...e, rank: i + 1 }));
    const latest = Math.max(...[...users.values()].map((v) => v.latest));
    weeks.push({
      weekStart,
      weekEnd: addDays(weekStart, 6),
      collectedAt: new Date(latest * 1000).toISOString().replace(/\.\d{3}Z$/, ''),
      entries,
    });
  }

  return { weeks };
}

function emitJs(data: unknown): string {
  return 'const LEADERBOARD_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
}

leaderboard.get('/data/leaderboard.js', (c) => {
  const data = buildWeeks();
  c.header('Content-Type', 'application/javascript; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=60');
  return c.body(emitJs(data));
});

leaderboard.get('/api/leaderboard.js', (c) => {
  const data = buildWeeks();
  c.header('Content-Type', 'application/javascript; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=60');
  return c.body(emitJs(data));
});

leaderboard.get('/api/leaderboard', (c) => {
  const data = buildWeeks();
  c.header('Cache-Control', 'public, max-age=60');
  return c.json(data);
});
