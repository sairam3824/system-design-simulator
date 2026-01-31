"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimeFrame, Difficulty } from "@/types/leaderboard";

interface LeaderboardFiltersProps {
  timeFrame: TimeFrame;
  topic: string;
  difficulty: Difficulty;
  availableTopics: string[];
  onTimeFrameChange: (value: TimeFrame) => void;
  onTopicChange: (value: string) => void;
  onDifficultyChange: (value: Difficulty) => void;
}

export function LeaderboardFilters({
  timeFrame,
  topic,
  difficulty,
  availableTopics,
  onTimeFrameChange,
  onTopicChange,
  onDifficultyChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Time Frame Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted-foreground">Time Frame</label>
        <Select value={timeFrame} onValueChange={onTimeFrameChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Topic Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted-foreground">Topic</label>
        <Select value={topic} onValueChange={onTopicChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {availableTopics.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted-foreground">Difficulty</label>
        <Select value={difficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
