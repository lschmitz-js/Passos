#!/usr/bin/env node
//
// Computes the facts behind the weekly family report. It deliberately does NOT
// write the announcement: choosing which stories matter is judgment, and a
// fixed template reads stale after a few weeks. This emits everything an author
// might want to draw on, already compared across the full history, so the
// numbers are never estimated.
//
//   node scripts/weekly-report.mjs                 # last completed week, family
//   node scripts/weekly-report.mjs --group todos   # everyone
//   node scripts/weekly-report.mjs --week 35       # a specific week number
//   node scripts/weekly-report.mjs --pretty        # readable instead of JSON

const API = process.env.PASSOS_API ?? 'https://zoologico.lbschmitz.ca/api/leaderboard';

const NAMES = {
  '136367709': 'Joana',
  '136467633': 'Pai',
  '133104715': 'Mãe',
  '111100771': 'Leo',
  '139402941': 'Ivana',
  '111133818': 'Elisabeth',
  '149194897': 'Laurent',
};
const FAMILY = Object.keys(NAMES);
const THRESHOLD = 10_000;
const BIG_DAY = 20_000;
const DOW = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const args = process.argv.slice(2);
const flag = (n, fb) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? (args[i + 1] ?? true) : fb;
};
const GROUP = flag('group', 'familia');
const WEEK_ARG = flag('week', null);
const PRETTY = args.includes('--pretty');

const res = await fetch(API);
if (!res.ok) {
  console.error(`failed to fetch ${API}: ${res.status}`);
  process.exit(1);
}
const { weeks: rawWeeks } = await res.json();

const inGroup = (e) => (GROUP === 'familia' ? FAMILY.includes(e.id) : true);
const weeks = rawWeeks.map((w) => ({ ...w, entries: w.entries.filter(inGroup) }));
const nameOf = (id) => NAMES[id] ?? `User ${id}`;

const today = (() => {
  const t = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
})();

const completed = weeks.map((w, i) => ({ w, i })).filter(({ w }) => w.weekEnd < today);
if (!completed.length) {
  console.error('no completed weeks yet');
  process.exit(1);
}
const idx = WEEK_ARG ? Number(WEEK_ARG) - 1 : completed[completed.length - 1].i;
const wk = weeks[idx];
if (!wk) {
  console.error(`week ${WEEK_ARG} not found (have 1..${weeks.length})`);
  process.exit(1);
}

const upto = weeks.slice(0, idx + 1);
const rank = (w) => [...w.entries].sort((a, b) => b.steps - a.steps);
const posOf = (w, id) => {
  const p = rank(w).findIndex((e) => e.id === id);
  return p < 0 ? null : p + 1;
};
const stepsOf = (w, id) => w.entries.find((e) => e.id === id)?.steps ?? 0;
const R = rank(wk);

// --- per-day series, for streaks and single-day facts ----------------------
const series = {};
for (const w of weeks) {
  for (const e of w.entries) {
    for (const [d, s] of Object.entries(e.days)) (series[e.id] ??= {})[d] = s;
  }
}
const streakAt = (id, endDate) => {
  const ds = Object.keys(series[id] ?? {}).sort().filter((d) => d <= endDate);
  let run = 0;
  for (let k = ds.length - 1; k >= 0; k--) {
    if ((series[id][ds[k]] ?? 0) >= THRESHOLD) run++;
    else break;
  }
  return run;
};

// --- standings -------------------------------------------------------------
const prev = idx > 0 ? weeks[idx - 1] : null;
const standings = R.map((e, n) => {
  const dayVals = Object.entries(e.days).sort(([a], [b]) => a.localeCompare(b));
  const vals = dayVals.map(([, v]) => v);
  const bestDay = dayVals.reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0]);
  const sat = dayVals.find(([d]) => new Date(`${d}T12:00`).getDay() === 6);
  const sun = dayVals.find(([d]) => new Date(`${d}T12:00`).getDay() === 0 && d > (sat?.[0] ?? ''));
  return {
    id: e.id,
    name: nameOf(e.id),
    rank: n + 1,
    steps: e.steps,
    perDay: Math.round(e.steps / 7),
    prevRank: prev ? posOf(prev, e.id) : null,
    rankDelta: prev && posOf(prev, e.id) ? posOf(prev, e.id) - (n + 1) : null,
    stepsDelta: prev ? e.steps - stepsOf(prev, e.id) : null,
    daysOver10k: vals.filter((v) => v >= THRESHOLD).length,
    days20k: vals.filter((v) => v >= BIG_DAY).length,
    perfectWeek: vals.length === 7 && vals.every((v) => v >= THRESHOLD),
    bestDay: { date: bestDay[0], steps: bestDay[1] },
    weekendSteps: (sat?.[1] ?? 0) + (sun?.[1] ?? 0),
    streakAtWeekEnd: streakAt(e.id, wk.weekEnd),
  };
});

// --- the winning margin, ranked against every completed week ---------------
const allMargins = upto
  .map((w, n) => {
    const r = rank(w);
    if (r.length < 2 || w.weekEnd >= today) return null;
    return { week: n + 1, margin: r[0].steps - r[1].steps, winner: nameOf(r[0].id), runnerUp: nameOf(r[1].id) };
  })
  .filter(Boolean)
  .sort((a, b) => a.margin - b.margin);
const thisMargin = R.length > 1 ? R[0].steps - R[1].steps : null;
const marginRank = allMargins.findIndex((m) => m.week === idx + 1) + 1;

// --- career history per person --------------------------------------------
const history = FAMILY.filter((id) => upto.some((w) => stepsOf(w, id) > 0)).map((id) => {
  const rows = upto.map((w, n) => ({ week: n + 1, pos: posOf(w, id), steps: stepsOf(w, id) }));
  const played = rows.filter((r) => r.steps > 0);
  const wins = played.filter((r) => r.pos === 1).map((r) => r.week);
  const podiums = played.filter((r) => r.pos && r.pos <= 3).map((r) => r.week);
  const priorWeeks = played.filter((r) => r.week < idx + 1);
  const careerBest = priorWeeks.reduce((a, b) => (b.steps > a.steps ? b : a), { week: null, steps: 0 });
  const thisWeekSteps = stepsOf(wk, id);

  // how many consecutive weeks on the podium ended just before this one
  let runBefore = 0;
  for (let k = idx - 1; k >= 0; k--) {
    const p = posOf(weeks[k], id);
    if (p && p <= 3) runBefore++;
    else break;
  }
  const thisPos = posOf(wk, id);
  return {
    id,
    name: nameOf(id),
    weeksPlayed: played.length,
    firstWeek: played[0]?.week ?? null,
    wins: wins.length,
    podiums: podiums.length,
    lastWin: wins.length ? { week: wins[wins.length - 1], weeksAgo: idx + 1 - wins[wins.length - 1] } : null,
    prevWinBeforeThis: wins.length > 1 && wins[wins.length - 1] === idx + 1
      ? { week: wins[wins.length - 2], weeksAgo: idx + 1 - wins[wins.length - 2] }
      : null,
    lastPodium: podiums.length
      ? { week: podiums[podiums.length - 1], weeksAgo: idx + 1 - podiums[podiums.length - 1] }
      : null,
    careerBestWeek: careerBest.week ? careerBest : null,
    setPersonalRecord: priorWeeks.length >= 3 && thisWeekSteps > careerBest.steps,
    bestFinishEver: Math.min(...played.map((r) => r.pos).filter(Boolean)),
    podiumRunEndedThisWeek: runBefore >= 2 && thisPos > 3 ? runBefore : null,
    prevWeekWasCareerBest:
      prev && stepsOf(prev, id) > 0 && stepsOf(prev, id) === Math.max(...priorWeeks.map((r) => r.steps)),
  };
});

// --- day by day ------------------------------------------------------------
const byDay = {};
for (const e of wk.entries) for (const [d, s] of Object.entries(e.days)) (byDay[d] ??= []).push([e.id, s]);
const days = Object.keys(byDay).sort().map((d) => {
  const rows = byDay[d].sort((a, b) => b[1] - a[1]);
  return {
    date: d,
    weekday: DOW[new Date(`${d}T12:00`).getDay()],
    total: rows.reduce((a, b) => a + b[1], 0),
    leader: rows[0][1] > 0 ? nameOf(rows[0][0]) : null,
    leaderSteps: rows[0][1],
    over10k: rows.filter((r) => r[1] >= THRESHOLD).length,
    competitors: rows.length,
  };
});
const daysLed = {};
for (const d of days) if (d.leader) daysLed[d.leader] = (daysLed[d.leader] ?? 0) + 1;

// --- group totals ----------------------------------------------------------
const totalOf = (w) => w.entries.reduce((a, e) => a + e.steps, 0);
const thisTotal = totalOf(wk);
const priorTotals = upto.slice(0, idx).filter((w) => w.weekEnd < today).map(totalOf);
const avgPrior = priorTotals.length
  ? Math.round(priorTotals.reduce((a, b) => a + b, 0) / priorTotals.length)
  : null;
const bestGroupWeek = upto
  .filter((w) => w.weekEnd < today)
  .map((w, n) => ({ week: n + 1, total: totalOf(w) }))
  .sort((a, b) => b.total - a.total)[0];

// --- the month the week ended in ------------------------------------------
const monthKey = wk.weekEnd.slice(0, 7);
const monthSteps = {};
for (const w of weeks) {
  for (const e of w.entries) {
    for (const [d, s] of Object.entries(e.days)) {
      if (d.startsWith(monthKey)) monthSteps[e.id] = (monthSteps[e.id] ?? 0) + s;
    }
  }
}
const monthStandings = Object.entries(monthSteps)
  .sort((a, b) => b[1] - a[1])
  .map(([id, steps], n) => ({
    rank: n + 1,
    name: nameOf(id),
    steps,
    behindLeader: n === 0 ? 0 : Object.values(monthSteps).sort((a, b) => b - a)[0] - steps,
  }));
const lastDayOfMonth = (() => {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m, 0);
  return `${y}-${String(m).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();
const TROPHY_ERA_START = '2026-08';

const facts = {
  group: GROUP,
  week: { number: idx + 1, start: wk.weekStart, end: wk.weekEnd, totalWeeksInData: weeks.length },
  generatedFor: today,
  standings,
  margin: thisMargin === null ? null : {
    steps: thisMargin,
    pctOfWinner: Number(((thisMargin / R[0].steps) * 100).toFixed(2)),
    winner: nameOf(R[0].id),
    runnerUp: nameOf(R[1].id),
    allTimeRank: marginRank,
    outOfWeeks: allMargins.length,
    tightestEver: allMargins[0],
    tightestThree: allMargins.slice(0, 3),
  },
  history,
  days,
  daysLed,
  groupTotals: {
    thisWeek: thisTotal,
    avgPriorWeeks: avgPrior,
    pctVsAvg: avgPrior ? Math.round(((thisTotal - avgPrior) / avgPrior) * 100) : null,
    bestWeekEver: bestGroupWeek,
    isBestWeekEver: bestGroupWeek?.week === idx + 1,
  },
  month: {
    key: monthKey,
    complete: lastDayOfMonth < today,
    awardsTrophy: monthKey >= TROPHY_ERA_START,
    standings: monthStandings,
  },
};

if (!PRETTY) {
  console.log(JSON.stringify(facts, null, 2));
} else {
  const n = (x) => x.toLocaleString('pt-BR');
  console.log(`W${facts.week.number}  ${facts.week.start} → ${facts.week.end}  (${GROUP})\n`);
  for (const s of standings) {
    const d = s.rankDelta === null ? 'new' : s.rankDelta > 0 ? `▲${s.rankDelta}` : s.rankDelta < 0 ? `▼${-s.rankDelta}` : '=';
    console.log(
      `  ${s.rank}. ${s.name.padEnd(10)} ${n(s.steps).padStart(9)}  ${d.padEnd(4)}` +
        `${s.stepsDelta !== null ? ` ${s.stepsDelta > 0 ? '+' : ''}${n(s.stepsDelta)}` : ''}` +
        `${s.perfectWeek ? '  PERFECT' : ''}${s.days20k ? `  ${s.days20k}x20k` : ''}` +
        `${s.streakAtWeekEnd >= 5 ? `  streak ${s.streakAtWeekEnd}d` : ''}`
    );
  }
  if (facts.margin) {
    console.log(`\n  margin ${n(facts.margin.steps)} — ${facts.margin.allTimeRank}º tightest of ${facts.margin.outOfWeeks}`);
  }
  console.log(`\n  group ${n(thisTotal)} (${facts.groupTotals.pctVsAvg > 0 ? '+' : ''}${facts.groupTotals.pctVsAvg}% vs avg)`);
  console.log(`\n  ${monthKey} ${facts.month.complete ? '(complete)' : '(in progress)'}:`);
  monthStandings.slice(0, 3).forEach((m) => console.log(`    ${m.rank}. ${m.name} ${n(m.steps)}`));
}
