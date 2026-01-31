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
  {
    name: "Design Netflix",
    description: "Video streaming, CDN, adaptive bitrate streaming",
    difficulty: "medium",
    icon: "N",
    concepts: ["CDN", "Adaptive Bitrate", "Recommendation Systems", "Database Partitioning"],
  },
  {
    name: "Design WhatsApp",
    description: "Real-time messaging, end-to-end encryption",
    difficulty: "medium",
    icon: "W",
    concepts: ["WebSockets", "Encryption", "Message Queues", "Push Notifications"],
  },
  {
    name: "Design Instagram",
    description: "Photo sharing, news feed generation, stories",
    difficulty: "medium",
    icon: "I",
    concepts: ["Blob Storage", "Feed Generation", "Fan-out on write", "CDN"],
  },
  {
    name: "Design YouTube",
    description: "Video upload, processing, streaming at scale",
    difficulty: "hard",
    icon: "Y",
    concepts: ["Video Transcoding", "Content Delivery", "Sharding", "Analytics"],
  },
  {
    name: "Design Google Search",
    description: "Web crawling, indexing, ranking algorithms",
    difficulty: "hard",
    icon: "G",
    concepts: ["Web Crawler", "Inverted Index", "MapReduce", "PageRank"],
  },
  {
    name: "Design URL Shortener",
    description: "TinyURL service, unique ID generation, redirection",
    difficulty: "easy",
    icon: "S",
    concepts: ["Hashing", "Base62 Encoding", "Key Generation Service", "Caching"],
  },
  {
    name: "Design Rate Limiter",
    description: "API throttling, distributed counting, security",
    difficulty: "medium",
    icon: "R",
    concepts: ["Token Bucket", "Leaky Bucket", "Redis", "Distributed Counters"],
  },
  {
    name: "Design Web Crawler",
    description: "Scalable crawling, politeness, duplicate detection",
    difficulty: "medium",
    icon: "C",
    concepts: ["URL Frontier", "DNS Resolution", "Robots.txt", "Content Deduplication"],
  },
  {
    name: "Design Notification System",
    description: "Push notifications, email, SMS, reliability",
    difficulty: "medium",
    icon: "P",
    concepts: ["Message Queues", "Workers", "Idempotency", "Retry Mechanisms"],
  },
  {
    name: "Design Google Maps",
    description: "Map rendering, navigation, shortest path service",
    difficulty: "hard",
    icon: "M",
    concepts: ["QuadTree", "Graph Algorithms", "Dijkstra", "A* Search"],
  },
  {
    name: "Design Dropbox",
    description: "File synchronization, chunking, block storage",
    difficulty: "hard",
    icon: "D",
    concepts: ["Block Storage", "Data Deduplication", "Synchronization", "Versioning"],
  },
  {
    name: "Design Tinder",
    description: "Geospatial matching, swiping, real-time potential matches",
    difficulty: "medium",
    icon: "T",
    concepts: ["Geospatial Indexing", "Active Users", "Sharding by Location", "Caching"],
  },
  {
    name: "Design Amazon",
    description: "E-commerce, catalog, cart, checkout flow",
    difficulty: "hard",
    icon: "A",
    concepts: ["Inventory Management", "Strong Consistency", "Transactions", "Search"],
  },
  {
    name: "Design Ticketmaster",
    description: "Booking system, high concurrency, seat locking",
    difficulty: "hard",
    icon: "TM",
    concepts: ["Concurrency Control", "Locking", "Database Isolation", "Virtual Waiting Queue"],
  },
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
