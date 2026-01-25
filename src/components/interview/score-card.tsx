"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  Lightbulb,
  MessageSquare,
  Layers,
  Scale,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface Score {
  requirementsClarification: number;
  highLevelDesign: number;
  detailedDesign: number;
  scalability: number;
  tradeoffs: number;
  communication: number;
  overallScore: number;
  passStatus: boolean;
  feedback: {
    requirementsClarification: string;
    highLevelDesign: string;
    detailedDesign: string;
    scalability: string;
    tradeoffs: string;
    communication: string;
    overallFeedback: string;
    strengths: string[];
    improvements: string[];
  };
}

interface ScoreCardProps {
  score: Score;
  completedPhases?: string[]; // List of phase names that were actually completed
}

const dimensions = [
  { key: "requirementsClarification", label: "Requirements Clarification", weight: "10%", icon: MessageSquare, phase: "Requirements Clarification" },
  { key: "highLevelDesign", label: "High-Level Design", weight: "20%", icon: Layers, phase: "High-Level Design" },
  { key: "detailedDesign", label: "Detailed Design", weight: "15%", icon: Target, phase: "Deep Dive" },
  { key: "scalability", label: "Scalability", weight: "20%", icon: TrendingUp, phase: "Scalability & Trade-offs" },
  { key: "tradeoffs", label: "Tradeoffs Analysis", weight: "25%", icon: Scale, phase: "Scalability & Trade-offs" },
  { key: "communication", label: "Communication", weight: "10%", icon: Lightbulb, phase: "all" }, // Communication is evaluated across all phases
];

const getScoreColor = (score: number) => {
  if (score >= 3.5) return "text-emerald-500";
  if (score >= 2.5) return "text-amber-500";
  if (score >= 2) return "text-orange-500";
  return "text-red-500";
};

const getScoreBgColor = (score: number) => {
  if (score >= 3.5) return "bg-emerald-500/10";
  if (score >= 2.5) return "bg-amber-500/10";
  if (score >= 2) return "bg-orange-500/10";
  return "bg-red-500/10";
};

const getProgressColor = (score: number) => {
  if (score >= 3.5) return "bg-emerald-500";
  if (score >= 2.5) return "bg-amber-500";
  if (score >= 2) return "bg-orange-500";
  return "bg-red-500";
};

const getScoreLabel = (score: number) => {
  if (score >= 3.5) return "Strong Hire";
  if (score >= 2.5) return "Hire";
  if (score >= 2) return "Lean No Hire";
  return "No Hire";
};

const getScoreDescription = (score: number) => {
  if (score >= 3.5) return "Exceptional performance across all dimensions";
  if (score >= 2.5) return "Solid performance with room for growth";
  if (score >= 2) return "Some gaps that need addressing";
  return "Significant areas need improvement";
};

// Circular Progress Component
function CircularProgress({ value, max = 4 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100;
  const strokeWidth = 8;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-44 h-44">
        {/* Background circle */}
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 1s ease-in-out",
          }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={value >= 2.5 ? "#10b981" : "#f59e0b"} />
            <stop offset="100%" stopColor={value >= 3.5 ? "#06b6d4" : value >= 2.5 ? "#10b981" : "#ef4444"} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${getScoreColor(value)}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">out of 4.0</span>
      </div>
    </div>
  );
}

export function ScoreCard({ score, completedPhases = [] }: ScoreCardProps) {
  // Helper function to check if a phase was completed
  const wasPhaseCompleted = (phaseName: string) => {
    if (phaseName === "all") return true; // Communication is always evaluated
    return completedPhases.includes(phaseName);
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Compact Overall Score */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className={`relative ${score.passStatus ? "bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-blue-500/5" : "bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5"}`}>
          <div className="absolute inset-0 bg-grid-white/5" />
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <CircularProgress value={score.overallScore} />
                <div className="space-y-2">
                  <Badge
                    variant={score.passStatus ? "default" : "destructive"}
                    className={`px-4 py-1.5 text-sm font-semibold ${score.passStatus
                        ? "bg-emerald-500/90 hover:bg-emerald-500"
                        : "bg-red-500/90 hover:bg-red-500"
                      }`}
                  >
                    {score.passStatus ? (
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1.5" />
                    )}
                    {score.passStatus ? "PASSED" : "NEEDS IMPROVEMENT"}
                  </Badge>
                  <h3 className={`text-xl font-semibold ${getScoreColor(score.overallScore)}`}>
                    {getScoreLabel(score.overallScore)}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {getScoreDescription(score.overallScore)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Detailed Feedback by Dimension - MOVED UP & HIGHLIGHTED */}
      <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-violet-500/5">
        <CardHeader className="pb-4 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20 ring-2 ring-primary/30">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-primary">Detailed Analysis</CardTitle>
              <CardDescription>In-depth feedback for each evaluation dimension</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {dimensions.map((dim, index) => {
              const dimScore = score[dim.key as keyof Score] as number;
              const Icon = dim.icon;
              const phaseCompleted = wasPhaseCompleted(dim.phase);

              return (
                <div key={dim.key}>
                  <div className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${phaseCompleted
                      ? 'bg-background/80 border-border/50 hover:border-primary/30'
                      : 'bg-muted/30 border-muted/50 opacity-60'
                    }`}>
                    <div className={`p-2.5 rounded-lg shrink-0 ${getScoreBgColor(dimScore)} ring-1 ring-inset ${dimScore >= 2.5 ? 'ring-emerald-500/20' : 'ring-red-500/20'}`}>
                      <Icon className={`w-5 h-5 ${getScoreColor(dimScore)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div>
                            <h4 className="font-semibold">{dim.label}</h4>
                            <span className="text-xs text-muted-foreground">Weight: {dim.weight}</span>
                          </div>
                          {!phaseCompleted && (
                            <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-muted-foreground/30">
                              Not Reached
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className={`${getScoreColor(dimScore)} border-current`}>
                          {dimScore.toFixed(1)}/4.0
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {score.feedback[dim.key as keyof typeof score.feedback]}
                      </p>
                    </div>
                  </div>
                  {index < dimensions.length - 1 && <Separator className="my-4 bg-primary/10" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown - Compact Grid */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Score Breakdown</CardTitle>
              <CardDescription>
                Evaluated against FAANG interview standards
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
            {dimensions.map((dim) => {
              const dimScore = score[dim.key as keyof Score] as number;
              const Icon = dim.icon;
              return (
                <div
                  key={dim.key}
                  className={`p-3 rounded-xl border transition-all hover:shadow-md ${getScoreBgColor(dimScore)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${getScoreColor(dimScore)}`} />
                      <span className="font-medium text-xs truncate">{dim.label}</span>
                    </div>
                    <div className={`text-sm font-bold ${getScoreColor(dimScore)}`}>
                      {dimScore.toFixed(1)}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getProgressColor(dimScore)}`}
                        style={{ width: `${(dimScore / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Summary - Strengths & Improvements */}
      <div className="grid gap-4 grid-cols-2">
        {/* Strengths */}
        <Card className="border shadow-sm border-emerald-500/20">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <CardTitle className="text-base text-emerald-600 dark:text-emerald-400">
                Strengths
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ul className="space-y-2">
              {score.feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="border shadow-sm border-amber-500/20">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <CardTitle className="text-base text-amber-600 dark:text-amber-400">
                Areas to Improve
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ul className="space-y-2">
              {score.feedback.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <ArrowUpRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-xs leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Overall Feedback */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <MessageSquare className="w-4 h-4 text-blue-500" />
            </div>
            <CardTitle className="text-base">Overall Assessment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {score.feedback.overallFeedback}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
