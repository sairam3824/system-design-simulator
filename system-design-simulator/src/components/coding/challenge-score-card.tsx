"use client";

import { CheckCircle, XCircle, Target, Zap, Code, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChallengeScoreCardProps {
  score: {
    correctness: number;
    efficiency: number;
    codeQuality: number;
    edgeCases: number;
    overallScore: number;
    passStatus: boolean;
    feedback: string;
    suggestedApproach?: string | null;
    complexityAnalysis?: string | null;
  };
  testResults?: {
    total: number;
    passed: number;
    hidden?: any[];
  };
}

export function ChallengeScoreCard({ score, testResults }: ChallengeScoreCardProps) {
  const dimensions = [
    {
      name: "Correctness",
      value: score.correctness,
      icon: Target,
      weight: "40%",
      description: "Logic accuracy and test case handling",
    },
    {
      name: "Efficiency",
      value: score.efficiency,
      icon: Zap,
      weight: "25%",
      description: "Time and space complexity",
    },
    {
      name: "Code Quality",
      value: score.codeQuality,
      icon: Code,
      weight: "20%",
      description: "Readability and best practices",
    },
    {
      name: "Edge Cases",
      value: score.edgeCases,
      icon: Shield,
      weight: "15%",
      description: "Handling boundary conditions",
    },
  ];

  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    if (value >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    if (value >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6 pb-24">
        {/* Overall Score */}
        <Card
          className={`border-2 ${score.passStatus
            ? "border-green-500/30 bg-green-500/5"
            : "border-red-500/30 bg-red-500/5"
            }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {score.passStatus ? (
                  <CheckCircle className="h-10 w-10 text-green-500" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-500" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className={`text-4xl font-bold ${getScoreColor(score.overallScore)}`}>
                    {Math.round(score.overallScore)}%
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-lg px-4 py-2 ${score.passStatus
                  ? "bg-green-500/10 text-green-500 border-green-500/30"
                  : "bg-red-500/10 text-red-500 border-red-500/30"
                  }`}
              >
                {score.passStatus ? "PASSED" : "FAILED"}
              </Badge>
            </div>

            {testResults && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Total Test Cases</span>
                    <span className="font-medium text-foreground">
                      {testResults.passed}/{testResults.total} passed
                    </span>
                  </div>
                  <Progress
                    value={(testResults.passed / testResults.total) * 100}
                    className="h-2"
                  />
                </div>

                {testResults.hidden && testResults.hidden.length > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Hidden Test Cases
                        <span className="text-[10px] bg-muted px-1 rounded text-muted-foreground/80">
                          (inc. Edge Cases)
                        </span>
                      </span>
                      <span className="font-medium text-foreground">
                        {testResults.hidden.filter((t: any) => t.passed).length}/
                        {testResults.hidden.length} passed
                      </span>
                    </div>
                    <Progress
                      value={
                        (testResults.hidden.filter((t: any) => t.passed).length /
                          testResults.hidden.length) *
                        100
                      }
                      className="h-1.5 opacity-80"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dimensions.map((dim) => (
              <div key={dim.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <dim.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{dim.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({dim.weight})
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(dim.value)}`}>
                    {Math.round(dim.value)}%
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full rounded-full transition-all ${getProgressColor(
                      dim.value
                    )}`}
                    style={{ width: `${dim.value}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{dim.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{score.feedback}</p>
            </div>

            {score.complexityAnalysis && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Complexity Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    {score.complexityAnalysis}
                  </p>
                </div>
              </>
            )}

            {score.suggestedApproach && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Suggested Approach</h4>
                  <p className="text-sm text-muted-foreground">
                    {score.suggestedApproach}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
