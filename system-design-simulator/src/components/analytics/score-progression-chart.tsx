"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

interface ScoreDataPoint {
  date: string;
  overallScore: number;
  passStatus: boolean;
  topic: string;
  interviewId: string;
}

interface ScoreProgressionChartProps {
  data: ScoreDataPoint[];
  isLoading?: boolean;
}

export function ScoreProgressionChart({ data, isLoading }: ScoreProgressionChartProps) {
  if (isLoading) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center text-muted-foreground">
          <p>No interview data yet</p>
          <p className="text-sm mt-1">Complete interviews to see your progress</p>
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((point) => ({
    ...point,
    date: format(new Date(point.date), "MMM d"),
    fullDate: format(new Date(point.date), "MMM d, yyyy"),
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
            axisLine={{ className: "stroke-muted" }}
          />
          <YAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
            axisLine={{ className: "stroke-muted" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-medium">{data.topic}</p>
                  <p className="text-sm text-muted-foreground">{data.fullDate}</p>
                  <p className="text-lg font-bold mt-1">
                    {data.overallScore.toFixed(2)}/4.0
                  </p>
                  <p className={`text-sm ${data.passStatus ? "text-green-600" : "text-red-500"}`}>
                    {data.passStatus ? "Passed" : "Did not pass"}
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine
            y={2.5}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="5 5"
            label={{
              value: "Pass",
              position: "insideTopRight",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 10,
            }}
          />
          <Line
            type="monotone"
            dataKey="overallScore"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{
              fill: "hsl(var(--primary))",
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: "hsl(var(--primary))",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
