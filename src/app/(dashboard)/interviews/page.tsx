"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const interviewTopics = [
  {
    name: "Design Twitter",
    description: "Social feed, real-time updates, trending topics",
    difficulty: "medium",
    icon: "X",
    concepts: ["Feed ranking", "Real-time updates", "Caching", "Sharding"],
  },
  {
    name: "Design Uber",
    description: "Ride matching, geo-location, real-time tracking",
    difficulty: "hard",
    icon: "U",
    concepts: ["Geo-hashing", "Real-time matching", "ETA calculation", "Surge pricing"],
  },
  {
    name: "Design Netflix",
    description: "Video streaming, recommendations, CDN",
    difficulty: "hard",
    icon: "N",
    concepts: ["Video transcoding", "CDN", "Recommendations", "Adaptive bitrate"],
  },
  {
    name: "Design WhatsApp",
    description: "Messaging, E2E encryption, presence",
    difficulty: "medium",
    icon: "W",
    concepts: ["Message delivery", "E2E encryption", "Presence system", "Group chat"],
  },
  {
    name: "Design Instagram",
    description: "Photo sharing, stories, explore feed",
    difficulty: "medium",
    icon: "I",
    concepts: ["Image storage", "Feed generation", "Stories", "Search"],
  },
  {
    name: "Design YouTube",
    description: "Video upload, transcoding, recommendations",
    difficulty: "hard",
    icon: "Y",
    concepts: ["Video processing", "Live streaming", "Recommendations", "Comments"],
  },
];

interface DifficultyPreview {
  selectedDifficulty: string;
  calculatedDifficulty: string;
  wasAdjusted: boolean;
  adjustmentReason: string;
  confidenceScore: number;
  breakdown: {
    experienceScore: number;
    skillsScore: number;
    companiesScore: number;
    resumeScore: number;
    selectedScore: number;
    totalScore: number;
  };
  recommendations: string[];
  profileSummary: {
    hasProfile: boolean;
    hasResume: boolean;
    yearsExperience: number | null;
    skillsCount: number;
    targetCompaniesCount: number;
  };
}

export default function InterviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTopic = searchParams.get("topic");

  const [selectedTopic, setSelectedTopic] = useState(preselectedTopic || "");
  const [difficulty, setDifficulty] = useState("medium");
  const [isStarting, setIsStarting] = useState(false);
  const [usePersonalized, setUsePersonalized] = useState(true);
  const [difficultyPreview, setDifficultyPreview] = useState<DifficultyPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const selectedTopicData = interviewTopics.find((t) => t.name === selectedTopic);

  // Fetch difficulty preview when settings change
  useEffect(() => {
    if (!usePersonalized || !selectedTopic) {
      setDifficultyPreview(null);
      return;
    }

    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const response = await fetch(
          `/api/interview/personalized?difficulty=${difficulty}&topic=${encodeURIComponent(selectedTopic)}`
        );
        if (response.ok) {
          const data = await response.json();
          setDifficultyPreview(data);
        }
      } catch (error) {
        console.error("Failed to fetch difficulty preview:", error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    const debounce = setTimeout(fetchPreview, 300);
    return () => clearTimeout(debounce);
  }, [difficulty, selectedTopic, usePersonalized]);

  const handleStartInterview = async () => {
    if (!selectedTopic) {
      toast.error("Please select a topic");
      return;
    }

    setIsStarting(true);
    try {
      const endpoint = usePersonalized ? "/api/interview/personalized" : "/api/interview";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty,
          selectedDifficulty: difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create interview");
      }

      const data = await response.json();
      const interview = data.interview;

      if (usePersonalized && data.personalization?.wasAdjusted) {
        toast.info(
          `Difficulty adjusted to ${data.personalization.calculatedDifficulty}`,
          { description: data.personalization.adjustmentReason }
        );
      }

      router.push(`/interview/${interview.id}`);
    } catch {
      toast.error("Failed to start interview");
    } finally {
      setIsStarting(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "text-emerald-500";
      case "medium": return "text-amber-500";
      case "hard": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "hard": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Start New Interview</h1>
        <p className="text-muted-foreground mt-1">
          Select a system design problem and difficulty level
        </p>
      </div>

      {/* Topic Selection */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interviewTopics.map((topic) => (
          <Card
            key={topic.name}
            className={`cursor-pointer transition-all ${
              selectedTopic === topic.name
                ? "border-primary ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedTopic(topic.name)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {topic.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{topic.name}</CardTitle>
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
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{topic.description}</CardDescription>
              <div className="flex flex-wrap gap-1 mt-3">
                {topic.concepts.map((concept) => (
                  <Badge key={concept} variant="outline" className="text-xs">
                    {concept}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interview Configuration */}
      {selectedTopic && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Configuration</CardTitle>
              <CardDescription>
                Customize your interview experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Topic</label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedTopic}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTopicData?.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">
                      Easy - Basic requirements, more guidance
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium - Standard FAANG interview
                    </SelectItem>
                    <SelectItem value="hard">
                      Hard - Deep dives, edge cases, tradeoffs
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Personalization Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-violet-500/5 rounded-lg border border-primary/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="font-medium">Smart Personalization</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adjust difficulty based on your profile, skills & resume
                  </p>
                </div>
                <Switch
                  checked={usePersonalized}
                  onCheckedChange={setUsePersonalized}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Interview Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• The interview will last approximately 45 minutes</li>
                  <li>• Start by clarifying requirements and scope</li>
                  <li>• Draw your high-level architecture first</li>
                  <li>• Discuss tradeoffs and justify your decisions</li>
                  <li>• The AI will evaluate you on 6 dimensions</li>
                </ul>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleStartInterview}
                disabled={isStarting}
              >
                {isStarting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Preparing Your Interview...
                  </span>
                ) : (
                  "Start Interview"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Personalization Preview */}
          {usePersonalized && (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Difficulty Analysis
                    </CardTitle>
                    <CardDescription>
                      Based on your profile and resume
                    </CardDescription>
                  </div>
                  {isLoadingPreview && (
                    <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {difficultyPreview ? (
                  <>
                    {/* Difficulty Adjustment */}
                    <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Selected</p>
                        <Badge className={getDifficultyBadge(difficultyPreview.selectedDifficulty)}>
                          {difficultyPreview.selectedDifficulty.toUpperCase()}
                        </Badge>
                      </div>
                      <svg className={`w-6 h-6 ${difficultyPreview.wasAdjusted ? "text-amber-500" : "text-emerald-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Recommended</p>
                        <Badge className={getDifficultyBadge(difficultyPreview.calculatedDifficulty)}>
                          {difficultyPreview.calculatedDifficulty.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {difficultyPreview.wasAdjusted && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          {difficultyPreview.adjustmentReason}
                        </p>
                      </div>
                    )}

                    {/* Score Breakdown */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Score Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Experience</span>
                          <span className="font-medium">{difficultyPreview.breakdown.experienceScore}%</span>
                        </div>
                        <Progress value={difficultyPreview.breakdown.experienceScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Skills Match</span>
                          <span className="font-medium">{difficultyPreview.breakdown.skillsScore}%</span>
                        </div>
                        <Progress value={difficultyPreview.breakdown.skillsScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Target Companies</span>
                          <span className="font-medium">{difficultyPreview.breakdown.companiesScore}%</span>
                        </div>
                        <Progress value={difficultyPreview.breakdown.companiesScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Resume Analysis</span>
                          <span className="font-medium">{difficultyPreview.breakdown.resumeScore}%</span>
                        </div>
                        <Progress value={difficultyPreview.breakdown.resumeScore} className="h-2" />
                      </div>
                    </div>

                    {/* Profile Summary */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-lg font-bold">{difficultyPreview.profileSummary.yearsExperience || "-"}</p>
                        <p className="text-xs text-muted-foreground">Years Exp</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-lg font-bold">{difficultyPreview.profileSummary.skillsCount}</p>
                        <p className="text-xs text-muted-foreground">Skills</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-lg font-bold">{difficultyPreview.breakdown.totalScore}%</p>
                        <p className="text-xs text-muted-foreground">Total Score</p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {difficultyPreview.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommendations</p>
                        <ul className="space-y-1">
                          {difficultyPreview.recommendations.slice(0, 3).map((rec, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <svg className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Data Warning */}
                    {(!difficultyPreview.profileSummary.hasProfile || !difficultyPreview.profileSummary.hasResume) && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {!difficultyPreview.profileSummary.hasProfile && !difficultyPreview.profileSummary.hasResume
                            ? "Add your profile and resume for better personalization"
                            : !difficultyPreview.profileSummary.hasProfile
                            ? "Complete your profile for better results"
                            : "Upload a resume for more accurate analysis"}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm">Select a topic to see difficulty analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
