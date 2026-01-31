"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ file: string; content_preview: string }>;
}

const QUICK_QUESTIONS = [
  "How do I start an interview?",
  "What topics are available?",
  "How is scoring calculated?",
  "How do I improve my weak areas?",
  "What's the interview structure?",
  "How do I upload my resume?",
];

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to the Help Center! I'm your AI assistant powered by RAG (Retrieval Augmented Generation). " +
        "I can answer questions about the System Design Simulator using our documentation.\n\n" +
        "Try asking about:\n" +
        "- Getting started and navigation\n" +
        "- Interview structure and phases\n" +
        "- Scoring and evaluation\n" +
        "- Performance analytics\n" +
        "- Coding challenges\n" +
        "- Troubleshooting\n\n" +
        "What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<"checking" | "online" | "offline">("checking");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check service health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch("/api/help-bot");
        setServiceStatus(response.ok ? "online" : "offline");
      } catch {
        setServiceStatus("offline");
      }
    }
    checkHealth();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/help-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting to the help service. Please ensure the RAG service is running:\n\n" +
            "```bash\ncd help-bot\npython main.py\n```",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-1">
          Ask questions about the System Design Simulator
        </p>
      </div>

      {/* Service Status */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            serviceStatus === "online"
              ? "bg-green-500"
              : serviceStatus === "offline"
              ? "bg-red-500"
              : "bg-yellow-500 animate-pulse"
          )}
        />
        <span className="text-sm text-muted-foreground">
          {serviceStatus === "online"
            ? "Help bot is online"
            : serviceStatus === "offline"
            ? "Help bot is offline"
            : "Checking status..."}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chat with Help Bot</CardTitle>
            <CardDescription>
              Powered by RAG with Mistral and all-MiniLM-L6-v2 embeddings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-[400px] px-6" ref={scrollAreaRef}>
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Sources:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {message.sources.map((source, i) => (
                              <span
                                key={i}
                                className="text-xs bg-background/50 px-2 py-0.5 rounded"
                              >
                                {source.file}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  disabled={isLoading || serviceStatus === "offline"}
                  className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading || serviceStatus === "offline"}
                >
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Questions</CardTitle>
            <CardDescription>Click to ask common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {QUICK_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(question)}
                  disabled={isLoading || serviceStatus === "offline"}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {question}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions (shown when offline) */}
      {serviceStatus === "offline" && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Help Bot Service Offline</CardTitle>
            <CardDescription>
              The RAG service needs to be started separately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <p className="text-muted-foreground mb-2"># Navigate to help-bot directory</p>
              <p>cd help-bot</p>
              <p className="text-muted-foreground mb-2 mt-4"># Install dependencies (first time only)</p>
              <p>pip install -r requirements.txt</p>
              <p className="text-muted-foreground mb-2 mt-4"># Start the service</p>
              <p>python main.py</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
