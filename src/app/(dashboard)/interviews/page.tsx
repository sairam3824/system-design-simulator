"use client";

import { useState } from "react";
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

export default function InterviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTopic = searchParams.get("topic");

  const [selectedTopic, setSelectedTopic] = useState(preselectedTopic || "");
  const [difficulty, setDifficulty] = useState("medium");
  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = async () => {
    if (!selectedTopic) {
      toast.error("Please select a topic");
      return;
    }

    setIsStarting(true);
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create interview");
      }

      const { interview } = await response.json();
      router.push(`/interview/${interview.id}`);
    } catch {
      toast.error("Failed to start interview");
    } finally {
      setIsStarting(false);
    }
  };

  const selectedTopicData = interviewTopics.find((t) => t.name === selectedTopic);

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
        <Card>
          <CardHeader>
            <CardTitle>Interview Configuration</CardTitle>
            <CardDescription>
              Customize your interview experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                      Easy - Basic requirements, less probing
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
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Interview Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- The interview will last approximately 45-60 minutes</li>
                <li>- Start by clarifying requirements and scope</li>
                <li>- Draw your high-level architecture first</li>
                <li>- Discuss tradeoffs and justify your decisions</li>
                <li>- The AI will evaluate you on 6 dimensions</li>
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleStartInterview}
              disabled={isStarting}
            >
              {isStarting ? "Starting Interview..." : "Start Interview"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
