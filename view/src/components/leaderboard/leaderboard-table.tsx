"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry } from "@/types/leaderboard";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") {
    return (
      <svg
        className="w-4 h-4 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg
        className="w-4 h-4 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    );
  }
  return (
    <svg
      className="w-4 h-4 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14"
      />
    </svg>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold shadow-lg">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold shadow-lg">
        3
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
      {rank}
    </div>
  );
}

export function LeaderboardTable({ entries, isLoading }: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No leaderboard data available yet.</p>
        <p className="text-sm mt-1">Complete some interviews to appear here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-muted-foreground font-medium">
        <div className="col-span-1">Rank</div>
        <div className="col-span-4">User</div>
        <div className="col-span-2 text-center">Score</div>
        <div className="col-span-2 text-center">Interviews</div>
        <div className="col-span-2 text-center">Pass Rate</div>
        <div className="col-span-1 text-center">Trend</div>
      </div>

      {/* Entries */}
      {entries.map((entry) => (
        <div
          key={entry.userId}
          className={cn(
            "grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border transition-colors",
            entry.isCurrentUser
              ? "border-primary/50 bg-primary/5"
              : "border-border/50 hover:bg-muted/50"
          )}
        >
          {/* Rank */}
          <div className="col-span-1 flex items-center">
            <RankBadge rank={entry.rank} />
          </div>

          {/* User */}
          <div className="col-span-4 flex items-center gap-2">
            <span className={cn("font-medium", entry.isCurrentUser && "text-primary")}>
              {entry.displayName}
            </span>
            {entry.isCurrentUser && (
              <Badge variant="outline" className="text-xs">
                You
              </Badge>
            )}
          </div>

          {/* Score */}
          <div className="col-span-2 flex items-center justify-center">
            <span className="font-bold text-lg">
              {entry.avgOverallScore.toFixed(2)}
            </span>
            <span className="text-muted-foreground text-sm ml-1">/4.0</span>
          </div>

          {/* Interviews */}
          <div className="col-span-2 flex items-center justify-center text-muted-foreground">
            {entry.completedInterviews}
          </div>

          {/* Pass Rate */}
          <div className="col-span-2 flex items-center justify-center">
            <Badge
              variant={
                entry.passRate >= 70
                  ? "default"
                  : entry.passRate >= 50
                  ? "secondary"
                  : "outline"
              }
            >
              {entry.passRate}%
            </Badge>
          </div>

          {/* Trend */}
          <div className="col-span-1 flex items-center justify-center">
            <TrendIcon trend={entry.trend} />
          </div>
        </div>
      ))}
    </div>
  );
}
