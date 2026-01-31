"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface InterviewChatProps {
  interview: {
    id: string;
    topic: string;
    difficulty: string;
    status: string;
    startedAt: string | null;
  };
  initialMessages: Message[];
  completedPhases?: string[];
  score: any | null;
}

export function InterviewChat({
  interview,
  initialMessages,
  completedPhases = [],
  score,
}: InterviewChatProps) {
  const [messages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    toast.info("This is a view-only demo. Interaction is disabled.");
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Exit
              </Button>
            </Link>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="font-semibold text-lg">{interview.topic}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{interview.difficulty}</Badge>
                <Badge className="bg-gray-500 text-white text-xs">
                  View Only
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat/Transcript Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-background/50">
          <div className="flex-1 min-h-0 overflow-y-auto p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No messages in this interview transcript.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                        }`}>
                        {message.role === "user" ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <span className="text-sm font-bold">B</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${message.role === "user" ? "text-muted-foreground" : "text-violet-400"}`}>
                        {message.role === "user" ? "You" : "Bobby"}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "flex flex-col items-end" : ""}`}>
                      <div className={`rounded-2xl px-4 py-3 ${message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border rounded-tl-sm"
                        }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 px-2">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Input Area (Disabled) */}
          <div className="p-4 border-t bg-background">
            <div className="max-w-3xl mx-auto relative cursor-not-allowed opacity-60">
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <span className="bg-background/80 px-3 py-1 text-xs font-medium border rounded shadow-sm text-muted-foreground">
                  Interaction disabled in view-only mode
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" disabled>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </Button>
                <div className="flex-1 bg-muted rounded-md h-10" />
                <Button size="icon" disabled>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
