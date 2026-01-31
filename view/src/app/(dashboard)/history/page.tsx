"use client";

import { useSession } from "@/components/mock-session-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitBranch,
  Code2,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Activity,
  Calendar,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { MOCK_INTERVIEWS } from "@/lib/mock-data";

export default function HistoryPage() {
  const { data: session } = useSession();

  const interviews = MOCK_INTERVIEWS.map(i => ({
    ...i,
    difficulty: "hard", // Adding missing property for mock usage
    score: { ...i.score, passStatus: i.score ? i.score.overallScore > 3.0 : false }
  }));

  const codingChallenges = [
    {
      id: "code-1",
      title: "Two Sum",
      difficulty: "Easy",
      language: "Python",
      status: "completed",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      score: { overallScore: 100, passStatus: true }
    },
    {
      id: "code-2",
      title: "LRU Cache",
      difficulty: "Medium",
      language: "TypeScript",
      status: "completed",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      score: { overallScore: 90, passStatus: true }
    }
  ];

  // System Design Stats
  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const avgInterviewScore =
    completedInterviews.length > 0
      ? completedInterviews.reduce(
        (acc, i) => acc + (i.score?.overallScore || 0),
        0
      ) / completedInterviews.length
      : 0;
  const interviewPassRate =
    completedInterviews.length > 0
      ? (completedInterviews.filter((i) => i.score?.passStatus).length /
        completedInterviews.length) *
      100
      : 0;

  // Coding Stats
  const completedCoding = codingChallenges.filter((c) => c.status === "completed");
  const avgCodingScore =
    completedCoding.length > 0
      ? completedCoding.reduce(
        (acc, c) => acc + (c.score?.overallScore || 0),
        0
      ) / completedCoding.length
      : 0;
  const codingPassRate =
    completedCoding.length > 0
      ? (completedCoding.filter((c) => c.score?.passStatus).length /
        completedCoding.length) *
      100
      : 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Activity History
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your progress and review past performances.
        </p>
      </div>

      <Tabs defaultValue="system-design" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] h-12">
          <TabsTrigger value="system-design" className="flex items-center gap-2 h-10 text-base">
            <GitBranch className="h-4 w-4" />
            System Design
          </TabsTrigger>
          <TabsTrigger value="coding" className="flex items-center gap-2 h-10 text-base">
            <Code2 className="h-4 w-4" />
            Coding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system-design" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Interviews"
              value={interviews.length}
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Completed"
              value={completedInterviews.length}
              icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Avg Score"
              value={avgInterviewScore > 0 ? avgInterviewScore.toFixed(2) : "N/A"}
              subValue={avgInterviewScore > 0 ? "/ 4.0" : ""}
              icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Pass Rate"
              value={interviewPassRate > 0 ? `${interviewPassRate.toFixed(0)}%` : "N/A"}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <Card className="border-muted/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/50">
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>Review your past system design performances</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {interviews.length === 0 ? (
                <EmptyState
                  title="No system design interviews yet"
                  description="Start your first system design interview to see your progress here."
                  actionLink="/interviews"
                  actionText="Start Interview"
                />
              ) : (
                <div className="divide-y divide-border/50">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="block group hover:bg-muted/30 transition-colors cursor-default"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {interview.topic}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`capitalize ${interview.difficulty === 'hard'
                                ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                : interview.difficulty === 'medium'
                                  ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
                                  : 'border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                }`}
                            >
                              {interview.difficulty}
                            </Badge>
                            <StatusBadge status={interview.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(interview.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(interview.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 flex items-center justify-between md:justify-end gap-6 min-w-[300px]">
                          {interview.score ? (
                            <>
                              <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Score</span>
                                  <span className="font-medium">
                                    {interview.score?.overallScore?.toFixed(2)}/4.0
                                  </span>
                                </div>
                                <Progress
                                  value={((interview.score?.overallScore || 0) / 4) * 100}
                                  className="h-2"
                                />
                              </div>
                              <Badge
                                variant={interview.score?.passStatus ? "default" : "destructive"}
                                className="h-7 px-3"
                              >
                                {interview.score?.passStatus ? "PASS" : "FAIL"}
                              </Badge>
                            </>
                          ) : (
                            interview.status === "in_progress" && (
                              <Button variant="outline" size="sm" className="ml-auto gap-2" disabled>
                                Continue <ArrowRight className="h-3 w-3" />
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coding" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid md:grid-cols-4 gap-4">
            <StatsCard
              title="Coding Questions"
              value={codingChallenges.length}
              icon={<Terminal className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Completed"
              value={completedCoding.length}
              icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Avg Score"
              value={avgCodingScore > 0 ? avgCodingScore.toFixed(2) : "N/A"}
              subValue={avgCodingScore > 0 ? "/ 100" : ""}
              icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Pass Rate"
              value={codingPassRate > 0 ? `${codingPassRate.toFixed(0)}%` : "N/A"}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <Card className="border-muted/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/50">
              <CardTitle>Coding Challenges</CardTitle>
              <CardDescription>Review your code submission history</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {codingChallenges.length === 0 ? (
                <EmptyState
                  title="No coding challenges yet"
                  description="Start solving coding problems to build your history."
                  actionLink="/coding"
                  actionText="Explore Problems"
                />
              ) : (
                <div className="divide-y divide-border/50">
                  {codingChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="block group hover:bg-muted/30 transition-colors cursor-default"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {challenge.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`capitalize ${challenge.difficulty.toLowerCase() === 'hard'
                                ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                : challenge.difficulty.toLowerCase() === 'medium'
                                  ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
                                  : 'border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                }`}
                            >
                              {challenge.difficulty}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                              {challenge.language}
                            </Badge>
                            <StatusBadge status={challenge.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(challenge.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(challenge.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 flex items-center justify-between md:justify-end gap-6 min-w-[300px]">
                          {challenge.score ? (
                            <>
                              <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Score</span>
                                  <span className="font-medium">
                                    {challenge.score?.overallScore?.toFixed(0)}/100
                                  </span>
                                </div>
                                <Progress
                                  value={challenge.score?.overallScore || 0}
                                  className="h-2"
                                />
                              </div>
                              <Badge
                                variant={challenge.score?.passStatus ? "default" : "destructive"}
                                className="h-7 px-3"
                              >
                                {challenge.score?.passStatus ? "PASS" : "FAIL"}
                              </Badge>
                            </>
                          ) : (
                            challenge.status === "in_progress" && (
                              <Button variant="outline" size="sm" className="ml-auto gap-2" disabled>
                                Resume <ArrowRight className="h-3 w-3" />
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subValue = "",
  icon
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{title}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {subValue && <span className="text-sm text-muted-foreground font-normal ml-1">{subValue}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: "bg-primary/10 text-primary border-primary/20",
    in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    pending: "bg-muted text-muted-foreground border-border",
  };

  const formattedStatus = status.replace("_", " ");

  return (
    <Badge
      variant="outline"
      className={`capitalize border ${styles[status as keyof typeof styles] || styles.pending}`}
    >
      {formattedStatus}
    </Badge>
  );
}

function EmptyState({
  title,
  description,
  actionLink,
  actionText
}: {
  title: string;
  description: string;
  actionLink: string;
  actionText: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="p-4 rounded-full bg-muted/30">
        <Activity className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button asChild className="mt-4" disabled>
        <Link href={actionLink}>{actionText}</Link>
      </Button>
    </div>
  );
}
