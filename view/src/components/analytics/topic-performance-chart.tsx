"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TopicStats {
  count: number;
  avgScore: number;
  passRate: number;
}

interface TopicPerformanceChartProps {
  topicStats: Record<string, TopicStats>;
  isLoading?: boolean;
}

export function TopicPerformanceChart({ topicStats, isLoading }: TopicPerformanceChartProps) {
  if (isLoading) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  const entries = Object.entries(topicStats);
  if (entries.length === 0) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center text-muted-foreground">
          <p>No topic data yet</p>
          <p className="text-sm mt-1">Complete interviews on different topics</p>
        </div>
      </div>
    );
  }

  // Sort by count and take top 8
  const chartData = entries
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([topic, stats]) => ({
      topic: topic.replace("Design ", ""),
      fullTopic: topic,
      avgScore: stats.avgScore,
      count: stats.count,
      passRate: stats.passRate,
    }));

  // Color based on score
  const getBarColor = (score: number) => {
    if (score >= 3.0) return "hsl(142, 76%, 36%)"; // green-600
    if (score >= 2.5) return "hsl(var(--primary))";
    if (score >= 2.0) return "hsl(38, 92%, 50%)"; // amber-500
    return "hsl(0, 72%, 51%)"; // red-500
  };

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
            axisLine={{ className: "stroke-muted" }}
          />
          <YAxis
            type="category"
            dataKey="topic"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
            axisLine={{ className: "stroke-muted" }}
            width={80}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-medium">{data.fullTopic}</p>
                  <p className="text-lg font-bold mt-1">
                    {data.avgScore.toFixed(2)}/4.0
                  </p>
                  <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                    <p>{data.count} interview{data.count !== 1 ? "s" : ""}</p>
                    <p>Pass rate: {data.passRate.toFixed(0)}%</p>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.avgScore)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
