"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScoreProgressionChart } from "./score-progression-chart";
import { DimensionRadarChart } from "./dimension-radar-chart";
import { TopicPerformanceChart } from "./topic-performance-chart";
import { TrendIndicator } from "./trend-indicator";

interface DimensionMetrics {
  avgScore: number;
  trend: "improving" | "stable" | "declining";
  isWeak: boolean;
  isStrong: boolean;
  recentScores: number[];
}

interface ScoreDataPoint {
  date: string;
  overallScore: number;
  passStatus: boolean;
  topic: string;
  interviewId: string;
}

interface TopicStats {
  count: number;
  avgScore: number;
  passRate: number;
}

interface PerformanceMetrics {
  overall: {
    totalInterviews: number;
    completedInterviews: number;
    avgScore: number;
    passRate: number;
    scoreTrend: "improving" | "stable" | "declining";
  };
  dimensions: Record<string, DimensionMetrics>;
  recentScores: ScoreDataPoint[];
  insights: string[];
  recommendations: string[];
}

interface AnalyticsData {
  avgOverallScore: number | null;
  topicStats: string;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch performance metrics
        const response = await fetch("/api/analytics/performance?limit=20");
        if (!response.ok) {
          throw new Error("Failed to fetch performance data");
        }
        const data = await response.json();
        setMetrics(data.metrics);

        // Parse topic stats from user analytics if needed
        if (data.metrics?.recentScores?.length > 0) {
          // Build topic stats from recent scores
          const topicMap: Record<string, { count: number; totalScore: number; passCount: number }> = {};
          for (const score of data.metrics.recentScores) {
            if (!topicMap[score.topic]) {
              topicMap[score.topic] = { count: 0, totalScore: 0, passCount: 0 };
            }
            topicMap[score.topic].count++;
            topicMap[score.topic].totalScore += score.overallScore;
            if (score.passStatus) topicMap[score.topic].passCount++;
          }

          const topicStats: Record<string, TopicStats> = {};
          for (const [topic, stats] of Object.entries(topicMap)) {
            topicStats[topic] = {
              count: stats.count,
              avgScore: stats.totalScore / stats.count,
              passRate: (stats.passCount / stats.count) * 100,
            };
          }

          setAnalytics({
            avgOverallScore: data.metrics.overall.avgScore,
            topicStats: JSON.stringify(topicStats),
          });
        }
      } catch (err) {
        console.error("Performance data fetch error:", err);
        setError("Failed to load performance data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const topicStats: Record<string, TopicStats> = analytics?.topicStats
    ? JSON.parse(analytics.topicStats)
    : {};

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Progression */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Score Progression</CardTitle>
            <CardDescription>Your overall score trend over time</CardDescription>
          </div>
          {metrics?.overall.scoreTrend && (
            <TrendIndicator trend={metrics.overall.scoreTrend} />
          )}
        </CardHeader>
        <CardContent>
          <ScoreProgressionChart
            data={metrics?.recentScores || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Two column layout for radar and bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAANG Dimensions Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills Breakdown</CardTitle>
            <CardDescription>Performance across 6 FAANG dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <DimensionRadarChart
              dimensions={metrics?.dimensions || {}}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Topic Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Topic Performance</CardTitle>
            <CardDescription>Your scores by interview topic</CardDescription>
          </CardHeader>
          <CardContent>
            <TopicPerformanceChart
              topicStats={topicStats}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      {metrics && (metrics.insights.length > 0 || metrics.recommendations.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metrics.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insights</CardTitle>
                <CardDescription>Key observations from your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {metrics.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {metrics.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
                <CardDescription>Actionable tips to improve</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {metrics.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
