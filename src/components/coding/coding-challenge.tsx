"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, Send, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CodeEditor } from "./code-editor";
import { ProblemPanel } from "./problem-panel";
import { TestResults } from "./test-results";
import { ChallengeScoreCard } from "./challenge-score-card";
import { ChallengeWorkspace } from "./challenge-workspace";
import { SUPPORTED_LANGUAGES, SupportedLanguage, TestCase } from "@/lib/coding/constants";

interface ChallengeData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  company?: string | null;
  language: string;
  timeLimit: number;
  status: string;
  startedAt?: string | null;
  starterCode?: string | null;
  finalCode?: string | null;
  visibleTests: TestCase[];
  remainingTime?: number | null;
  score?: {
    correctness: number;
    efficiency: number;
    codeQuality: number;
    edgeCases: number;
    overallScore: number;
    passStatus: boolean;
    feedback: string;
    suggestedApproach?: string | null;
    complexityAnalysis?: string | null;
  } | null;
}

interface TestResult {
  input: string;
  expectedOutput: string;
  passed: boolean;
  actualOutput?: string;
  analysis?: string;
}

interface CodingChallengeProps {
  initialChallenge: ChallengeData;
  hideHeader?: boolean;
  isTestMode?: boolean;
}

export function CodingChallenge({ initialChallenge, hideHeader = false, isTestMode = false }: CodingChallengeProps) {
  const router = useRouter();
  const [challenge, setChallenge] = useState(initialChallenge);
  const [code, setCode] = useState(
    initialChallenge.finalCode || initialChallenge.starterCode || ""
  );
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    initialChallenge.language as SupportedLanguage
  );
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    initialChallenge.remainingTime ?? null
  );
  const [activeTab, setActiveTab] = useState("problem");
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([]);
  const [logicAnalysis, setLogicAnalysis] = useState<string | undefined>();
  const [completionStats, setCompletionStats] = useState<{
    total: number;
    passed: number;
    hidden?: any[];
  } | null>(null);

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoStarted = useRef(false);
  const isCompletingRef = useRef(false);

  // Auto-start the challenge when page loads (if pending)
  useEffect(() => {
    if (challenge.status === "pending" && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startChallengeAuto();
    }
  }, []);

  const startChallengeAuto = async () => {
    try {
      const response = await fetch(`/api/coding/challenge/${challenge.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      if (!response.ok) {
        throw new Error("Failed to start challenge");
      }

      const data = await response.json();
      setChallenge({
        ...challenge,
        status: data.challenge.status,
        startedAt: data.challenge.startedAt,
      });
      setTimeRemaining(data.challenge.timeLimit * 60 * 1000);
      toast.success("Challenge started! Good luck!");
    } catch {
      toast.error("Failed to start challenge");
    }
  };

  // Auto-save code every 30 seconds
  useEffect(() => {
    if (challenge.status !== "in_progress") return;

    autoSaveRef.current = setInterval(async () => {
      try {
        await fetch(`/api/coding/challenge/${challenge.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", code }),
        });
      } catch {
        console.error("Auto-save failed");
      }
    }, 30000);

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [challenge.id, challenge.status, code]);


  // Timer countdown with auto-complete - only if not in test mode
  useEffect(() => {
    if (isTestMode || challenge.status !== "in_progress" || timeRemaining === null) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1000) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-complete when time expires
          if (!isCompletingRef.current) {
            isCompletingRef.current = true;
            toast.warning("Time's up! Submitting your code...");
            handleCompleteAuto();
          }
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [challenge.status, challenge.id, isTestMode]);

  // Handle auto-complete when time expires
  const handleCompleteAuto = async () => {
    setIsCompleting(true);

    try {
      const response = await fetch(
        `/api/coding/challenge/${challenge.id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete challenge");
      }

      setChallenge((prev) => ({
        ...prev,
        status: "completed",
        score: data.score,
      }));
      setCompletionStats(data.testResults);
      setActiveTab("score");

      if (data.score.passStatus) {
        toast.success("Challenge completed! You passed!");
      } else {
        toast.info("Challenge completed. Review your score for feedback.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete challenge"
      );
    } finally {
      setIsCompleting(false);
      isCompletingRef.current = false;
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSyntaxErrors([]);
    setActiveTab("results");

    try {
      const response = await fetch(
        `/api/coding/challenge/${challenge.id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      if (!data.submission.isValid) {
        setErrorMessage(data.submission.errorMessage);
        setSyntaxErrors(data.submission.syntaxErrors || []);
        setTestResults(null);
      } else {
        setTestResults(data.submission.testResults);
        setLogicAnalysis(data.submission.logicAnalysis);
        const passed = data.submission.testResults.filter(
          (r: TestResult) => r.passed
        ).length;
        const total = data.submission.testResults.length;
        toast.success(`${passed}/${total} tests passed`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit code"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      const response = await fetch(
        `/api/coding/challenge/${challenge.id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete challenge");
      }

      setChallenge({
        ...challenge,
        status: "completed",
        score: data.score,
      });
      setCompletionStats(data.testResults);
      setActiveTab("score");

      if (data.score.passStatus) {
        toast.success("Challenge completed! You passed!");
      } else {
        toast.info("Challenge completed. Review your score for feedback.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete challenge"
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const resetCode = () => {
    setCode(challenge.starterCode || "");
    toast.info("Code reset to starter template");
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const isRunning = challenge.status === "in_progress";
  const isCompleted = challenge.status === "completed";
  const isTimeCritical = timeRemaining !== null && timeRemaining < 5 * 60 * 1000;

  return (
    <div className={`h-screen flex flex-col bg-background ${hideHeader ? 'h-full' : ''}`}>
      {/* Header */}
      {!hideHeader && (
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg truncate max-w-md">
              {challenge.title}
            </h1>
            <Badge
              variant="outline"
              className={
                challenge.difficulty === "easy"
                  ? "bg-green-500/10 text-green-500"
                  : challenge.difficulty === "medium"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-red-500/10 text-red-500"
              }
            >
              {challenge.difficulty}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            {isRunning && timeRemaining !== null && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isTimeCritical
                  ? "bg-red-500/10 text-red-500 animate-pulse"
                  : "bg-muted"
                  }`}
              >
                <Clock className="h-4 w-4" />
                <span className="font-mono font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}

            {/* Action Buttons moved to Workspace, only Global/Nav actions here */}
            {challenge.status === "pending" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Starting challenge...</span>
              </div>
            )}

            {isCompleted && (
              <Button onClick={() => router.push("/coding")}>
                New Challenge
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <ChallengeWorkspace
        challenge={challenge}
        code={code}
        onCodeChange={setCode}
        language={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        testResults={testResults}
        errorMessage={errorMessage}
        syntaxErrors={syntaxErrors}
        logicAnalysis={logicAnalysis}
        completionStats={completionStats}
        isSubmitting={isSubmitting}
        isCompleting={isCompleting || isCompletingRef.current}
        onReset={resetCode}
        onRunTests={handleSubmit} // Run Tests = Submit for feedback
        onSubmit={handleComplete} // Submit Final = Complete
        readOnly={isCompleted}
      />
    </div>
  );
}

