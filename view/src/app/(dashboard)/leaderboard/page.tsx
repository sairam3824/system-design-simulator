"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LeaderboardPage() {
  const users = [
    { rank: 1, name: "Alice", score: 3.9, role: "Senior Engineer" },
    { rank: 2, name: "Bob", score: 3.8, role: "Staff Engineer" },
    { rank: 3, name: "Charlie", score: 3.7, role: "Backend Dev" },
    { rank: 4, name: "Dave", score: 3.6, role: "Full Stack" },
    { rank: 5, name: "Eve", score: 3.5, role: "Frontend Dev" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">
          See how you rank against other system design practitioners (View Only)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-4xl">1,245</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Rank</CardDescription>
            <CardTitle className="text-4xl">#42</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Score</CardDescription>
            <CardTitle className="text-4xl">3.9/4.0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.rank} className="border-b">
                    <td className="px-4 py-3 font-medium">#{u.rank}</td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.role}</td>
                    <td className="px-4 py-3 text-right font-bold">{u.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
