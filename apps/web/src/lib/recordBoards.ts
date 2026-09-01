import type { Week, WeekEntry } from './api';
import { isWeekComplete, parseLocalDate, todayIso } from './dates';
import { buildMonths } from './months';

export type RecordUnit = 'steps' | 'days' | 'count' | 'places';
/** What the `when` fields mean, so the UI knows how to format them. */
export type RecordScope = 'date' | 'dateRange' | 'week' | 'month' | 'none';

export type RecordRow = {
  id: string;
  name: string;
  value: number;
  when?: string;
  whenEnd?: string;
};

export type RecordBoard = {
  key: string;
  unit: RecordUnit;
  scope: RecordScope;
  rows: RecordRow[];
};

export type RecordGroup = { key: string; boards: RecordBoard[] };

const THRESHOLD = 10_000;
const BIG_DAY = 20_000;
const TOP_N = 10;

type Series = { name: string; days: Map<string, number>; dates: string[] };

function isoShift(iso: string, delta: number): string {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + delta);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The ten best results overall. One person can hold several slots -- that is
 *  what a record board is: the top ten performances, not the top ten people. */
function top(rows: RecordRow[]): RecordRow[] {
  return rows
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value || (a.when ?? '').localeCompare(b.when ?? ''))
    .slice(0, TOP_N);
}

function buildSeries(weeks: Week[], filter: (e: WeekEntry) => boolean): Map<string, Series> {
  const out = new Map<string, Series>();
  for (const w of weeks) {
    for (const e of w.entries.filter(filter)) {
      let s = out.get(e.id);
      if (!s) {
        s = { name: e.name, days: new Map(), dates: [] };
        out.set(e.id, s);
      }
      for (const [date, steps] of Object.entries(e.days)) s.days.set(date, steps);
    }
  }
  for (const s of out.values()) s.dates = [...s.days.keys()].sort();
  return out;
}

export function buildRecordBoards(
  weeks: Week[],
  filter: (e: WeekEntry) => boolean
): RecordGroup[] {
  const series = buildSeries(weeks, filter);
  const complete = weeks.filter((w) => isWeekComplete(w.weekEnd));
  // Partly-observed months are excluded everywhere a month competes as a unit.
  const months = buildMonths(weeks, filter).filter((m) => m.complete && !m.partial);
  const today = todayIso();

  // --- single days ---------------------------------------------------------
  const dayRows: RecordRow[] = [];
  const bigDays = new Map<string, number>();
  for (const [id, s] of series) {
    for (const d of s.dates) {
      const steps = s.days.get(d)!;
      if (steps > 0) dayRows.push({ id, name: s.name, value: steps, when: d });
      if (steps >= BIG_DAY) bigDays.set(id, (bigDays.get(id) ?? 0) + 1);
    }
  }

  // --- weeks / months ------------------------------------------------------
  const weekRows: RecordRow[] = [];
  for (const w of complete) {
    for (const e of w.entries.filter(filter)) {
      weekRows.push({ id: e.id, name: e.name, value: e.steps, when: w.weekStart, whenEnd: w.weekEnd });
    }
  }
  const monthRows: RecordRow[] = months.flatMap((m) =>
    m.entries.map((e) => ({ id: e.id, name: e.name, value: e.steps, when: m.key }))
  );

  // --- rolling 7-day window (distinct from a calendar week) ----------------
  // Every window is a candidate, but overlapping windows from the same person
  // are near-duplicates -- Aug 15-21 and Aug 16-22 are essentially one feat.
  // Take them greedily best-first, skipping any that overlaps one already taken
  // by that same person, so the board holds ten distinct stretches.
  const rollingCandidates: RecordRow[] = [];
  for (const [id, s] of series) {
    if (s.dates.length === 0) continue;
    const last = s.dates[s.dates.length - 1]!;
    for (const start of s.dates) {
      const end = isoShift(start, 6);
      if (end > last) break;
      let sum = 0;
      for (let i = 0; i < 7; i++) sum += s.days.get(isoShift(start, i)) ?? 0;
      if (sum > 0) rollingCandidates.push({ id, name: s.name, value: sum, when: start, whenEnd: end });
    }
  }
  const takenByUser = new Map<string, { start: string; end: string }[]>();
  const rollingRows: RecordRow[] = [];
  for (const c of rollingCandidates.sort((a, b) => b.value - a.value)) {
    const taken = takenByUser.get(c.id) ?? [];
    if (taken.some((r) => c.when! <= r.end && c.whenEnd! >= r.start)) continue;
    taken.push({ start: c.when!, end: c.whenEnd! });
    takenByUser.set(c.id, taken);
    rollingRows.push(c);
  }

  // --- weekends ------------------------------------------------------------
  const weekendRows: RecordRow[] = [];
  for (const [id, s] of series) {
    for (const d of s.dates) {
      if (parseLocalDate(d).getDay() !== 6) continue; // Saturday
      const sun = isoShift(d, 1);
      const sum = (s.days.get(d) ?? 0) + (s.days.get(sun) ?? 0);
      if (sum > 0) weekendRows.push({ id, name: s.name, value: sum, when: d, whenEnd: sun });
    }
  }

  // --- streaks -------------------------------------------------------------
  const streakRows: RecordRow[] = [];
  const activeRows: RecordRow[] = [];
  const yesterday = isoShift(today, -1);

  /** Walk a date list and return every ≥threshold run, plus the run still open
   *  at the end of the list. */
  const runs = (s: Series, dates: string[]) => {
    const out: { start: string; end: string; len: number }[] = [];
    let start: string | null = null;
    let len = 0;
    let end: string | null = null;
    const flush = () => {
      if (start && end) out.push({ start, end, len });
    };
    for (const d of dates) {
      const steps = s.days.get(d) ?? 0;
      if (steps >= THRESHOLD) {
        if (start === null || (end && isoShift(end, 1) !== d)) {
          flush();
          start = d;
          len = 1;
        } else {
          len++;
        }
        end = d;
      } else {
        flush();
        start = null;
        len = 0;
        end = null;
      }
    }
    flush();
    return { all: out, open: start && end ? { start, end, len } : null };
  };

  for (const [id, s] of series) {
    for (const r of runs(s, s.dates).all) {
      streakRows.push({ id, name: s.name, value: r.len, when: r.start, whenEnd: r.end });
    }

    // Active streaks are evaluated as of yesterday. Today is still being walked,
    // so a partially-synced today sitting below the threshold must not be read
    // as the streak having ended.
    const { open } = runs(s, s.dates.filter((d) => d < today));
    if (open && open.end === yesterday) {
      activeRows.push({ id, name: s.name, value: open.len, when: open.start, whenEnd: open.end });
    }
  }

  // --- perfect weeks (all seven days at or above the threshold) ------------
  const perfect = new Map<string, number>();
  for (const w of complete) {
    for (const e of w.entries.filter(filter)) {
      const days = Object.values(e.days);
      if (days.length === 7 && days.every((v) => v >= THRESHOLD)) {
        perfect.set(e.id, (perfect.get(e.id) ?? 0) + 1);
      }
    }
  }

  // --- weekly wins, margins, podium streaks --------------------------------
  const wins = new Map<string, number>();
  const marginRows: RecordRow[] = [];
  const podiumBy = new Map<string, string[]>(); // id -> weekStarts on the podium
  const climbRows: RecordRow[] = [];
  let prevRanks = new Map<string, number>();

  for (const w of [...complete].sort((a, b) => a.weekStart.localeCompare(b.weekStart))) {
    const ranked = [...w.entries.filter(filter)].sort((a, b) => b.steps - a.steps);
    if (ranked.length === 0) continue;

    const winner = ranked[0]!;
    wins.set(winner.id, (wins.get(winner.id) ?? 0) + 1);
    if (ranked.length > 1) {
      marginRows.push({
        id: winner.id,
        name: winner.name,
        value: winner.steps - ranked[1]!.steps,
        when: w.weekStart,
        whenEnd: w.weekEnd,
      });
    }

    ranked.slice(0, 3).forEach((e) => {
      const list = podiumBy.get(e.id) ?? [];
      list.push(w.weekStart);
      podiumBy.set(e.id, list);
    });

    const thisRanks = new Map<string, number>();
    ranked.forEach((e, i) => thisRanks.set(e.id, i + 1));
    for (const [id, r] of thisRanks) {
      const prev = prevRanks.get(id);
      if (prev !== undefined && prev - r > 0) {
        const e = ranked.find((x) => x.id === id)!;
        climbRows.push({ id, name: e.name, value: prev - r, when: w.weekStart, whenEnd: w.weekEnd });
      }
    }
    prevRanks = thisRanks;
  }

  // Longest run of consecutive completed weeks on the podium.
  const orderedWeeks = [...complete].map((w) => w.weekStart).sort();
  const podiumStreakRows: RecordRow[] = [];
  for (const [id, starts] of podiumBy) {
    const set = new Set(starts);
    const name = series.get(id)?.name ?? id;
    let cur = 0;
    // Push every run, not just the best one, so the board can rank them all.
    orderedWeeks.forEach((ws, i) => {
      if (set.has(ws)) {
        cur++;
        const isLast = i === orderedWeeks.length - 1;
        if (isLast) {
          podiumStreakRows.push({
            id,
            name,
            value: cur,
            when: orderedWeeks[i - cur + 1],
            whenEnd: orderedWeeks[i],
          });
        }
      } else {
        if (cur > 0) {
          podiumStreakRows.push({
            id,
            name,
            value: cur,
            when: orderedWeeks[i - cur],
            whenEnd: orderedWeeks[i - 1],
          });
        }
        cur = 0;
      }
    });
  }

  // --- days finishing first ------------------------------------------------
  const daysFirst = new Map<string, number>();
  const allDates = new Set<string>();
  for (const s of series.values()) for (const d of s.dates) allDates.add(d);
  for (const d of allDates) {
    let topId: string | null = null;
    let topSteps = 0;
    for (const [id, s] of series) {
      const steps = s.days.get(d) ?? 0;
      if (steps > topSteps) {
        topSteps = steps;
        topId = id;
      }
    }
    if (topId && topSteps > 0) daysFirst.set(topId, (daysFirst.get(topId) ?? 0) + 1);
  }

  // --- month-over-month improvement ---------------------------------------
  const jumpRows: RecordRow[] = [];
  const chronological = [...months].sort((a, b) => a.key.localeCompare(b.key));
  // Earliest date anyone has data for. A month that began before collection
  // started is only partly observed, so it is not a fair baseline -- comparing
  // a full January against three days of December is an artifact, not a jump.
  let firstDate = '9999-12-31';
  for (const s of series.values()) {
    if (s.dates.length && s.dates[0]! < firstDate) firstDate = s.dates[0]!;
  }
  for (let i = 1; i < chronological.length; i++) {
    const prev = chronological[i - 1]!;
    const cur = chronological[i]!;
    // Only compare back-to-back months; a gap in the data is not an improvement.
    const [y, m] = cur.key.split('-').map(Number);
    const expected = m === 1 ? `${y! - 1}-12` : `${y}-${String(m! - 1).padStart(2, '0')}`;
    if (prev.key !== expected) continue;
    if (prev.start < firstDate) continue;
    for (const e of cur.entries) {
      const before = prev.entries.find((p) => p.id === e.id);
      if (!before) continue;
      const delta = e.steps - before.steps;
      if (delta > 0) jumpRows.push({ id: e.id, name: e.name, value: delta, when: cur.key });
    }
  }

  const tally = (m: Map<string, number>): RecordRow[] =>
    [...m.entries()].map(([id, value]) => ({ id, name: series.get(id)?.name ?? id, value }));

  return [
    {
      key: 'classic',
      boards: [
        { key: 'bestDay', unit: 'steps', scope: 'date', rows: top(dayRows) },
        { key: 'bestWeek', unit: 'steps', scope: 'week', rows: top(weekRows) },
        { key: 'longestStreak', unit: 'days', scope: 'dateRange', rows: top(streakRows) },
      ],
    },
    {
      key: 'volume',
      boards: [
        { key: 'bestMonth', unit: 'steps', scope: 'month', rows: top(monthRows) },
        { key: 'bestRolling7', unit: 'steps', scope: 'dateRange', rows: top(rollingRows) },
        { key: 'bestWeekend', unit: 'steps', scope: 'dateRange', rows: top(weekendRows) },
      ],
    },
    {
      key: 'consistency',
      boards: [
        { key: 'perfectWeeks', unit: 'count', scope: 'none', rows: top(tally(perfect)) },
        { key: 'bigDays', unit: 'count', scope: 'none', rows: top(tally(bigDays)) },
        { key: 'activeStreak', unit: 'days', scope: 'dateRange', rows: top(activeRows) },
      ],
    },
    {
      key: 'competition',
      boards: [
        { key: 'wins', unit: 'count', scope: 'none', rows: top(tally(wins)) },
        { key: 'biggestMargin', unit: 'steps', scope: 'week', rows: top(marginRows) },
        { key: 'daysFirst', unit: 'count', scope: 'none', rows: top(tally(daysFirst)) },
        { key: 'podiumStreak', unit: 'count', scope: 'dateRange', rows: top(podiumStreakRows) },
      ],
    },
    {
      key: 'comeback',
      boards: [
        { key: 'biggestClimb', unit: 'places', scope: 'week', rows: top(climbRows) },
        { key: 'monthJump', unit: 'steps', scope: 'month', rows: top(jumpRows) },
      ],
    },
  ];
}
