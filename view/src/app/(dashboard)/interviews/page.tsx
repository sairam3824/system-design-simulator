"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  // ... (keeping a few for brevity in view mode)
];

export default function InterviewsPage() {
  const router = useRouter();

  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [usePersonalized, setUsePersonalized] = useState(true);

  const selectedTopicData = interviewTopics.find((t) => t.name === selectedTopic);

  const handleStartInterview = async () => {
    if (!selectedTopic) {
      toast.error("Please select a topic");
      return;
    }

    // Direct navigate to mock interview
    toast.info("Starting mock interview (View Only mode)");
    router.push(`/interview/mock-interview-1`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Start New Interview</h1>
        <p className="text-muted-foreground mt-1">
          Select a system design problem and difficulty level (View Only Mode)
        </p>
      </div>

      {/* Topic Selection */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interviewTopics.map((topic) => (
          <Card
            key={topic.name}
            className={`cursor-pointer transition-all ${selectedTopic === topic.name
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
                  <Badge variant="outline">{topic.difficulty}</Badge>
                </div>
              </div>
            </CardHeader>
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
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Personalization Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border">
                <div className="space-y-1">
                  <span className="font-medium">Smart Personalization</span>
                  <p className="text-xs text-muted-foreground">Adjust difficulty based on profile</p>
                </div>
                <Switch checked={usePersonalized} onCheckedChange={setUsePersonalized} />
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleStartInterview}
              >
                Start Interview (Demo)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
