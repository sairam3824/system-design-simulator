"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScoreCard } from "./score-card";
import { toast } from "sonner";

// Interview phases configuration
const INTERVIEW_PHASES = [
  {
    id: "requirements",
    name: "Requirements",
    duration: 8,
    startTime: 45,
    endTime: 37,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    tips: ["Ask about scale (DAU, QPS)", "Clarify functional requirements", "Identify non-functional needs"]
  },
  {
    id: "high-level",
    name: "High-Level Design",
    duration: 12,
    startTime: 37,
    endTime: 25,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    tips: ["Draw core components", "Define APIs", "Explain data flow"]
  },
  {
    id: "deep-dive",
    name: "Deep Dive",
    duration: 12,
    startTime: 25,
    endTime: 13,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-500",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    tips: ["Data models & schemas", "Algorithms & protocols", "Handle failure scenarios"]
  },
  {
    id: "scalability",
    name: "Scalability",
    duration: 10,
    startTime: 13,
    endTime: 3,
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-500",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    tips: ["10x-100x growth", "Caching strategies", "Trade-offs & CAP theorem"]
  },
  {
    id: "wrapup",
    name: "Wrap-up",
    duration: 3,
    startTime: 3,
    endTime: 0,
    color: "from-gray-500 to-slate-600",
    bgColor: "bg-gray-500",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    tips: ["Summarize design", "Address concerns", "Ask questions"]
  },
] as const;

const TOTAL_INTERVIEW_TIME = 45 * 60;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface PhaseAnalysis {
  phase: string;
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

interface Score {
  requirementsClarification: number;
  highLevelDesign: number;
  detailedDesign: number;
  scalability: number;
  tradeoffs: number;
  communication: number;
  overallScore: number;
  passStatus: boolean;
  feedback: {
    requirementsClarification: string;
    highLevelDesign: string;
    detailedDesign: string;
    scalability: string;
    tradeoffs: string;
    communication: string;
    overallFeedback: string;
    strengths: string[];
    improvements: string[];
  };
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
  score: Score | null;
}

export function InterviewChat({
  interview,
  initialMessages,
  score: initialScore,
}: InterviewChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [score, setScore] = useState<Score | null>(initialScore);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Timer and phase states
  const [remainingTime, setRemainingTime] = useState(TOTAL_INTERVIEW_TIME);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseAnalyses, setPhaseAnalyses] = useState<PhaseAnalysis[]>([]);
  const [isAnalyzingPhase, setIsAnalyzingPhase] = useState(false);
  const [phaseStartMessageIndex, setPhaseStartMessageIndex] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(true);

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "keyboard">("voice");
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isCompleted = interview.status === "completed" || score !== null;
  const currentPhase = INTERVIEW_PHASES[currentPhaseIndex];

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined" || !speechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInput((prev) => prev + finalTranscript);
        setTranscript("");
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone access.");
        setInputMode("keyboard");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch {
          // Ignore
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [speechSupported, isListening]);

  // Countdown timer
  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }

        const newTime = prev - 1;
        const minutesLeft = Math.floor(newTime / 60);

        // Time warnings
        if (minutesLeft === 30 && newTime % 60 === 0) {
          setShowTimeWarning("30 minutes remaining");
          setTimeout(() => setShowTimeWarning(null), 3000);
        } else if (minutesLeft === 15 && newTime % 60 === 0) {
          setShowTimeWarning("15 minutes - Move to scalability!");
          setTimeout(() => setShowTimeWarning(null), 4000);
        } else if (minutesLeft === 5 && newTime % 60 === 0) {
          setShowTimeWarning("5 minutes - Start wrapping up!");
          setTimeout(() => setShowTimeWarning(null), 4000);
        } else if (minutesLeft === 1 && newTime % 60 === 0) {
          setShowTimeWarning("1 minute remaining!");
          setTimeout(() => setShowTimeWarning(null), 3000);
        }

        // Auto phase transition
        const newPhaseIndex = INTERVIEW_PHASES.findIndex(
          (phase) => minutesLeft < phase.startTime && minutesLeft >= phase.endTime
        );
        if (newPhaseIndex !== -1 && newPhaseIndex !== currentPhaseIndex) {
          handlePhaseTransition(newPhaseIndex);
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCompleted, currentPhaseIndex]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    const minutes = remainingTime / 60;
    if (minutes <= 5) return "text-red-400";
    if (minutes <= 15) return "text-yellow-400";
    return "text-primary";
  };

  const getTimerRingColor = () => {
    const minutes = remainingTime / 60;
    if (minutes <= 5) return "stroke-red-500";
    if (minutes <= 15) return "stroke-yellow-500";
    return "stroke-primary";
  };

  const handlePhaseTransition = async (newPhaseIndex: number) => {
    if (messages.length > phaseStartMessageIndex + 1) {
      setIsAnalyzingPhase(true);
      const phaseMessages = messages.slice(phaseStartMessageIndex);

      try {
        const response = await fetch(`/api/interview/${interview.id}/analyze-phase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phaseId: currentPhase.id,
            phaseMessages: phaseMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setPhaseAnalyses((prev) => [...prev, data.analysis]);
          toast.success(`${currentPhase.name} phase analyzed`);
        }
      } catch (error) {
        console.error("Phase analysis error:", error);
      } finally {
        setIsAnalyzingPhase(false);
      }
    }

    setCurrentPhaseIndex(newPhaseIndex);
    setPhaseStartMessageIndex(messages.length);
    toast.info(`Moving to ${INTERVIEW_PHASES[newPhaseIndex].name} phase`);
  };

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start recognition:", error);
        toast.error("Failed to start voice recognition");
      }
    }
  }, [isListening]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const messageContent = input.trim();
    if (!messageContent || isLoading || isCompleted) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTranscript("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/interview/${interview.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg.role === "assistant") {
                    lastMsg.content = fullContent;
                  }
                  return updated;
                });
              }
            } catch {
              // Ignore
            }
          }
        }
      }

      // Check for phase transition
      const transitionMatch = fullContent.match(/\[PHASE_TRANSITION:\s*(\w+-?\w*)\]/);
      if (transitionMatch) {
        const nextPhaseId = transitionMatch[1];
        const nextPhaseIndex = INTERVIEW_PHASES.findIndex((p) => p.id === nextPhaseId);
        if (nextPhaseIndex !== -1 && nextPhaseIndex > currentPhaseIndex) {
          setTimeout(() => handlePhaseTransition(nextPhaseIndex), 1000);
        }
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.role === "assistant") {
            lastMsg.content = lastMsg.content.replace(/\[PHASE_TRANSITION:\s*\w+-?\w*\]/g, "").trim();
          }
          return updated;
        });
      }
    } catch {
      toast.error("Failed to send message. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    setIsEnding(true);
    try {
      const response = await fetch(`/api/interview/${interview.id}/end`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to end interview");

      const data = await response.json();
      setScore(data.score);
      setShowEndDialog(false);
      toast.success("Interview completed!");
      router.refresh();
    } catch {
      toast.error("Failed to end interview.");
    } finally {
      setIsEnding(false);
    }
  };

  const progressPercentage = ((TOTAL_INTERVIEW_TIME - remainingTime) / TOTAL_INTERVIEW_TIME) * 100;
  const timerCircumference = 2 * Math.PI * 40;
  const timerProgress = (remainingTime / TOTAL_INTERVIEW_TIME) * timerCircumference;

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
                {!isCompleted && (
                  <Badge className={`${currentPhase.bgColor} text-white text-xs`}>
                    {currentPhase.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {!isCompleted && (
            <div className="flex items-center gap-6">
              {/* Circular Timer */}
              <div className="relative flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted/20"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    strokeWidth="4"
                    strokeDasharray={timerCircumference}
                    strokeDashoffset={timerCircumference - timerProgress}
                    strokeLinecap="round"
                    className={`${getTimerRingColor()} transition-all duration-1000`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`font-mono text-xl font-bold ${getTimeColor()}`}>
                    {formatTime(remainingTime)}
                  </span>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowEndDialog(true)}
                className="gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                End Interview
              </Button>
            </div>
          )}
        </div>

        {/* Phase Progress */}
        {!isCompleted && (
          <div className="mt-4 flex gap-2">
            {INTERVIEW_PHASES.map((phase, index) => (
              <div
                key={phase.id}
                className={`flex-1 relative overflow-hidden rounded-lg transition-all duration-300 ${
                  index === currentPhaseIndex
                    ? `bg-gradient-to-r ${phase.color} shadow-lg shadow-primary/20`
                    : index < currentPhaseIndex
                    ? "bg-muted/50"
                    : "bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <svg
                    className={`w-4 h-4 flex-shrink-0 ${index === currentPhaseIndex ? "text-white" : "text-muted-foreground"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={phase.icon} />
                  </svg>
                  <span className={`text-xs font-medium truncate ${
                    index === currentPhaseIndex ? "text-white" : "text-muted-foreground"
                  } ${index < currentPhaseIndex ? "line-through" : ""}`}>
                    {phase.name}
                  </span>
                  {index < currentPhaseIndex && (
                    <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {index === currentPhaseIndex && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-white/30"
                    style={{
                      width: `${((currentPhase.startTime * 60 - remainingTime) / (currentPhase.duration * 60)) * 100}%`,
                      transition: "width 1s linear"
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Time Warning */}
      {showTimeWarning && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{showTimeWarning}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                  }`}>
                    {message.role === "user" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "flex flex-col items-end" : ""}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
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
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 animate-in fade-in-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          {!isCompleted && (
            <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4">
              <div className="max-w-3xl mx-auto">
                {/* Live Transcription */}
                {isListening && transcript && (
                  <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl animate-pulse">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-primary rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 16 + 8}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-primary font-medium">Listening...</span>
                    </div>
                    <p className="text-foreground">{transcript}</p>
                  </div>
                )}

                {/* Mode Toggle & Tips */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {speechSupported && (
                      <div className="flex items-center bg-muted rounded-full p-1">
                        <button
                          onClick={() => {
                            setInputMode("voice");
                            if (!isListening) toggleListening();
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            inputMode === "voice"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          Voice
                        </button>
                        <button
                          onClick={() => {
                            setInputMode("keyboard");
                            if (isListening && recognitionRef.current) {
                              recognitionRef.current.stop();
                              setIsListening(false);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            inputMode === "keyboard"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Type
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Tips Toggle */}
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showTips ? "Hide tips" : "Show tips"}
                  </button>
                </div>

                {/* Phase Tips */}
                {showTips && !isCompleted && (
                  <div className="mb-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${currentPhase.bgColor}`} />
                      <span className="text-xs font-medium text-muted-foreground">Focus on:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentPhase.tips.map((tip, i) => (
                        <span key={i} className="text-xs bg-background px-2 py-1 rounded-md border border-border/50">
                          {tip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-3 items-end">
                    {/* Mic Button */}
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={isLoading}
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                          isListening
                            ? "bg-red-500 hover:bg-red-600 text-white scale-110"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        } disabled:opacity-50 disabled:scale-100`}
                      >
                        {isListening ? (
                          <div className="relative">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
                          </div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Text Input */}
                    <div className="flex-1 relative">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={inputMode === "voice" ? "Speak or type your response..." : "Type your response..."}
                        className="resize-none rounded-xl pr-4 min-h-[48px] max-h-32 bg-muted/50 border-border/50 focus:border-primary/50"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Send Button */}
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      size="icon"
                      className="flex-shrink-0 w-12 h-12 rounded-full shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {(phaseAnalyses.length > 0 || (isCompleted && score)) && (
          <div className="w-80 border-l border-border/50 bg-background/50 backdrop-blur-sm overflow-auto p-4">
            {phaseAnalyses.length > 0 && !isCompleted && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Live Scores
                </h3>
                <div className="space-y-3">
                  {phaseAnalyses.map((analysis) => (
                    <div key={analysis.phase} className="p-3 bg-card rounded-xl border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {analysis.phase.replace("-", " ")}
                        </span>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          analysis.score >= 3 ? "bg-green-500/20 text-green-400" :
                          analysis.score >= 2 ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {analysis.score}/4
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{analysis.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isCompleted && score && <ScoreCard score={score} />}
          </div>
        )}
      </div>

      {/* End Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              End Interview?
            </DialogTitle>
            <DialogDescription className="text-left">
              {remainingTime > 0 && (
                <span className="block mb-2">
                  You have <strong>{formatTime(remainingTime)}</strong> remaining.
                </span>
              )}
              The AI will evaluate your entire interview and provide detailed feedback on all dimensions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Continue
            </Button>
            <Button onClick={handleEndInterview} disabled={isEnding} className="gap-2">
              {isEnding ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Evaluating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Get Results
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
