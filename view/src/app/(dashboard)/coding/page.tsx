"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { COMPANIES, PROBLEM_CATEGORIES, CATEGORY_LABELS } from "@/lib/coding/constants";

export default function CodingPage() {
  const router = useRouter();
  const [company, setCompany] = useState<string>("no_preference");
  const [category, setCategory] = useState<string>("arrays");

  const handleStartChallenge = () => {
    toast.success("Starting mock coding challenge...");
    router.push("/coding/mock-1");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Coding Challenges (View Only)</h1>
        <p className="text-muted-foreground mt-1">
          Practice DSA problems with AI-powered evaluation
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Practice</CardTitle>
            <CardDescription>Select topic and start coding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_preference">No preference</SelectItem>
                  {COMPANIES && COMPANIES.length > 0 ? COMPANIES.map((c: string) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  )) : <SelectItem value="google">Google</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROBLEM_CATEGORIES && PROBLEM_CATEGORIES.length > 0 ? PROBLEM_CATEGORIES.map((c: string) => (
                    <SelectItem key={c} value={c}>{(CATEGORY_LABELS as any)[c] || c}</SelectItem>
                  )) : <SelectItem value="arrays">Arrays</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleStartChallenge}>Generate & Start (Demo)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Two Sum", status: "completed", score: 100 },
                { title: "LRU Cache", status: "completed", score: 90 }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded bg-muted/20">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">{item.status}</div>
                  </div>
                  <Badge variant={item.score > 80 ? "default" : "secondary"}>{item.score}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
