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
import { Progress } from "@/components/ui/progress";

export default async function HistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const interviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { score: true },
  });

  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const avgScore =
    completedInterviews.length > 0
      ? completedInterviews.reduce(
          (acc, i) => acc + (i.score?.overallScore || 0),
          0
        ) / completedInterviews.length
      : 0;
  const passRate =
    completedInterviews.length > 0
      ? (completedInterviews.filter((i) => i.score?.passStatus).length /
          completedInterviews.length) *
        100
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Interview History</h1>
        <p className="text-muted-foreground mt-1">
          Review your past interviews and track your progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Interviews</CardDescription>
            <CardTitle className="text-3xl">{interviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">
              {completedInterviews.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-3xl">
              {avgScore > 0 ? avgScore.toFixed(2) : "N/A"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pass Rate</CardDescription>
            <CardTitle className="text-3xl">
              {passRate > 0 ? `${passRate.toFixed(0)}%` : "N/A"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Interview List */}
      <Card>
        <CardHeader>
          <CardTitle>All Interviews</CardTitle>
          <CardDescription>Click on an interview to view details</CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No interviews yet. Start your first one!
              </p>
              <Button asChild>
                <Link href="/interviews">Start Interview</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <Link
                  key={interview.id}
                  href={`/interview/${interview.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{interview.topic}</h3>
                        <Badge variant="outline">{interview.difficulty}</Badge>
                        <Badge
                          variant={
                            interview.status === "completed"
                              ? "default"
                              : interview.status === "in_progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {interview.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(interview.createdAt).toLocaleDateString()} at{" "}
                        {new Date(interview.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {interview.score && (
                      <div className="flex items-center gap-6">
                        <div className="w-32">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Score</span>
                            <span className="font-medium">
                              {interview.score.overallScore.toFixed(2)}/4.0
                            </span>
                          </div>
                          <Progress
                            value={(interview.score.overallScore / 4) * 100}
                            className="h-2"
                          />
                        </div>
                        <Badge
                          variant={
                            interview.score.passStatus ? "default" : "destructive"
                          }
                        >
                          {interview.score.passStatus ? "PASS" : "FAIL"}
                        </Badge>
                      </div>
                    )}

                    {!interview.score && interview.status === "in_progress" && (
                      <Button variant="outline" size="sm">
                        Continue
                      </Button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
