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
