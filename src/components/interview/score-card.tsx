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
}

const dimensions = [
  { key: "requirementsClarification", label: "Requirements", weight: "10%" },
  { key: "highLevelDesign", label: "High-Level Design", weight: "20%" },
  { key: "detailedDesign", label: "Detailed Design", weight: "15%" },
  { key: "scalability", label: "Scalability", weight: "20%" },
  { key: "tradeoffs", label: "Tradeoffs", weight: "25%" },
  { key: "communication", label: "Communication", weight: "10%" },
];

const getScoreColor = (score: number) => {
  if (score >= 3.5) return "text-green-500";
  if (score >= 2.5) return "text-yellow-500";
  if (score >= 2) return "text-orange-500";
  return "text-red-500";
};

const getScoreLabel = (score: number) => {
  if (score >= 3.5) return "Strong Hire";
  if (score >= 2.5) return "Hire";
  if (score >= 2) return "Lean No Hire";
  return "No Hire";
};

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Interview Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div
              className={`text-5xl font-bold ${getScoreColor(
                score.overallScore
              )}`}
            >
              {score.overallScore.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">out of 4.0</p>
            <Badge
              variant={score.passStatus ? "default" : "destructive"}
              className="mt-3"
            >
              {score.passStatus ? "PASS" : "NEEDS IMPROVEMENT"}
            </Badge>
            <p className="text-sm mt-2 font-medium">
              {getScoreLabel(score.overallScore)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Scores */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Dimension Scores</CardTitle>
          <CardDescription>
            Based on FAANG evaluation criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dimensions.map((dim) => {
            const dimScore = score[dim.key as keyof Score] as number;
            return (
              <div key={dim.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span>
                    {dim.label}{" "}
                    <span className="text-muted-foreground">({dim.weight})</span>
                  </span>
                  <span className={`font-medium ${getScoreColor(dimScore)}`}>
                    {dimScore}/4
                  </span>
                </div>
                <Progress value={(dimScore / 4) * 100} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Feedback Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Feedback Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {score.feedback.overallFeedback}
          </p>

          <Separator />

          <div>
            <h4 className="font-medium text-green-500 mb-2">Strengths</h4>
            <ul className="text-sm space-y-1">
              {score.feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-orange-500 mb-2">
              Areas for Improvement
            </h4>
            <ul className="text-sm space-y-1">
              {score.feedback.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500">-</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Detailed Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {dimensions.map((dim) => (
            <div key={dim.key}>
              <h4 className="font-medium">{dim.label}</h4>
              <p className="text-muted-foreground">
                {score.feedback[dim.key as keyof typeof score.feedback]}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
