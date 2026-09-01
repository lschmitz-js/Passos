export type WeekEntry = {
  id: string;
  name: string;
  steps: number;
  rank: number;
  days: Record<string, number>;
};

export type Week = {
  weekStart: string;
  weekEnd: string;
  collectedAt: string;
  entries: WeekEntry[];
};

export type LeaderboardResponse = { weeks: Week[] };

export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const res = await fetch('/api/leaderboard');
  if (!res.ok) throw new Error(`leaderboard fetch failed: ${res.status}`);
  return res.json();
}

/** Hand-written champion notes, keyed by month ("2026-08"). Absent months are
 *  simply not in the map -- a champion without a story still renders. */
export type ChampionNote = {
  photo?: string;
  /** A full celebration image for the month. Shown in place of the avatar. */
  poster?: string;
  lead?: string;
  acts?: { label: string; text: string }[];
  closing?: string;
};

export async function fetchChampionNotes(): Promise<Record<string, ChampionNote>> {
  const res = await fetch('/api/champions');
  if (!res.ok) return {};
  return res.json();
}
