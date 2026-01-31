/**
 * Leaderboard Types
 */

export type TimeFrame = "week" | "month" | "all-time";
export type Difficulty = "easy" | "medium" | "hard" | "all";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string; // Name or "User #XXXX" for privacy
  avgOverallScore: number;
  completedInterviews: number;
  passRate: number;
  trend: "up" | "down" | "stable";
  isCurrentUser?: boolean;
}

export interface LeaderboardFilters {
  timeFrame: TimeFrame;
  topic?: string;
  difficulty?: Difficulty;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalUsers: number;
  currentUserRank?: number;
  filters: LeaderboardFilters;
}
