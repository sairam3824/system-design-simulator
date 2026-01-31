"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DimensionMetrics {
  avgScore: number;
  trend: "improving" | "stable" | "declining";
  isWeak: boolean;
  isStrong: boolean;
  recentScores: number[];
}

interface DimensionRadarChartProps {
  dimensions: Record<string, DimensionMetrics>;
  isLoading?: boolean;
}

const DIMENSION_LABELS: Record<string, string> = {
  requirementsClarification: "Requirements",
  highLevelDesign: "HLD",
  detailedDesign: "Detailed",
  scalability: "Scalability",
  tradeoffs: "Trade-offs",
  communication: "Communication",
};

export function DimensionRadarChart({ dimensions, isLoading }: DimensionRadarChartProps) {
  if (isLoading) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  const hasData = Object.values(dimensions).some((d) => d.avgScore > 0);

  if (!hasData) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center text-muted-foreground">
          <p>No dimension data yet</p>
          <p className="text-sm mt-1">Complete interviews to see your skills breakdown</p>
        </div>
      </div>
    );
  }

  // Format data for radar chart
  const chartData = Object.entries(dimensions).map(([key, metrics]) => ({
    dimension: DIMENSION_LABELS[key] || key,
    fullName: key,
    score: metrics.avgScore,
    fullMark: 4,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 4]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickCount={5}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0].payload;
              const fullName = data.fullName.replace(/([A-Z])/g, " $1").trim();
              return (
                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-medium capitalize">{fullName}</p>
                  <p className="text-lg font-bold mt-1">
                    {data.score.toFixed(2)}/4.0
                  </p>
                </div>
              );
            }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
