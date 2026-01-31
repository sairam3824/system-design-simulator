"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import type {
  LeaderboardEntry,
  TimeFrame,
  Difficulty,
} from "@/types/leaderboard";

interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalUsers: number;
  currentUserRank?: number;
  availableTopics: string[];
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("all-time");
  const [topic, setTopic] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        timeFrame,
        difficulty,
      });

      if (topic && topic !== "all") {
        params.set("topic", topic);
      }

      const response = await fetch(`/api/leaderboard?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError("Failed to load leaderboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame, topic, difficulty]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">
          See how you rank against other system design practitioners
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-4xl">
              {isLoading ? "-" : data?.totalUsers || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Rank</CardDescription>
            <CardTitle className="text-4xl">
              {isLoading
                ? "-"
                : data?.currentUserRank
                ? `#${data.currentUserRank}`
                : "N/A"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Score</CardDescription>
            <CardTitle className="text-4xl">
              {isLoading || !data?.entries.length
                ? "-"
                : `${data.entries[0].avgOverallScore.toFixed(2)}/4.0`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Leaderboard Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Rankings</CardTitle>
              <CardDescription>
                Top performers based on average interview scores
              </CardDescription>
            </div>
            <LeaderboardFilters
              timeFrame={timeFrame}
              topic={topic}
              difficulty={difficulty}
              availableTopics={data?.availableTopics || []}
              onTimeFrameChange={setTimeFrame}
              onTopicChange={setTopic}
              onDifficultyChange={setDifficulty}
            />
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="mt-4 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <LeaderboardTable
              entries={data?.entries || []}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
