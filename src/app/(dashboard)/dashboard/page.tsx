import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

const interviewTopics = [
  { name: "Design Twitter", difficulty: "medium", icon: "X" },
  { name: "Design Uber", difficulty: "hard", icon: "U" },
  { name: "Design Netflix", difficulty: "hard", icon: "N" },
  { name: "Design WhatsApp", difficulty: "medium", icon: "W" },
  { name: "Design Instagram", difficulty: "medium", icon: "I" },
  { name: "Design YouTube", difficulty: "hard", icon: "Y" },
];

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Get user stats
  const [totalInterviews, completedInterviews, avgScore, recentInterviews] =
    await Promise.all([
      prisma.interview.count({ where: { userId } }),
      prisma.interview.count({ where: { userId, status: "completed" } }),
      prisma.score.aggregate({
        where: { interview: { userId } },
        _avg: { overallScore: true },
      }),
      prisma.interview.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { score: true },
      }),
    ]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name || "Engineer"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Ready to ace your next system design interview?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Interviews</CardDescription>
            <CardTitle className="text-4xl">{totalInterviews}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-4xl">{completedInterviews}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-4xl">
              {avgScore._avg.overallScore
                ? avgScore._avg.overallScore.toFixed(1)
                : "N/A"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Start Interview */}
      <Card>
        <CardHeader>
          <CardTitle>Start a New Interview</CardTitle>
          <CardDescription>
            Choose a classic FAANG system design problem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {interviewTopics.map((topic) => (
              <Link key={topic.name} href={`/interviews?topic=${encodeURIComponent(topic.name)}`}>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      {topic.icon}
                    </div>
                    <div>
                      <p className="font-medium">{topic.name}</p>
                      <Badge
                        variant={
                          topic.difficulty === "hard"
                            ? "destructive"
                            : topic.difficulty === "medium"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {topic.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Interviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription>Your latest practice sessions</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/history">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentInterviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No interviews yet. Start your first one above!
            </p>
          ) : (
            <div className="space-y-4">
              {recentInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{interview.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        interview.status === "completed"
                          ? "default"
                          : interview.status === "in_progress"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {interview.status}
                    </Badge>
                    {interview.score && (
                      <span className="font-bold">
                        {interview.score.overallScore.toFixed(1)}/4.0
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
