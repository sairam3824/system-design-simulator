"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TrendIndicatorProps {
  trend: "improving" | "stable" | "declining";
  className?: string;
}

export function TrendIndicator({ trend, className }: TrendIndicatorProps) {
  const config = {
    improving: {
      label: "Improving",
      variant: "default" as const,
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
      bgColor: "bg-green-500/10",
      textColor: "text-green-600 dark:text-green-400",
    },
    stable: {
      label: "Stable",
      variant: "secondary" as const,
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      ),
      bgColor: "bg-muted",
      textColor: "text-muted-foreground",
    },
    declining: {
      label: "Declining",
      variant: "destructive" as const,
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
      bgColor: "bg-red-500/10",
      textColor: "text-red-600 dark:text-red-400",
    },
  };

  const { label, icon, bgColor, textColor } = config[trend];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full", bgColor, className)}>
      <span className={textColor}>{icon}</span>
      <span className={cn("text-sm font-medium", textColor)}>{label}</span>
    </div>
  );
}
