"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  PROBLEM_CATEGORIES,
  CATEGORY_LABELS,
  COMPANIES,
  SUPPORTED_LANGUAGES,
  TIME_LIMITS,
  COMPANY_PATTERNS,
  ProblemCategory,
  SupportedLanguage,
  Company,
  CompanyInterviewPattern,
} from "@/lib/coding/constants";

interface ChallengeHistory {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  language: string;
  status: string;
  createdAt: string;
  score?: {
    overallScore: number;
    passStatus: boolean;
  } | null;
}

interface Analytics {
  summary: {
    totalChallenges: number;
    passedChallenges: number;
    passRate: number;
    avgOverallScore: number;
  };
  scores: {
    correctness: number;
    efficiency: number;
    codeQuality: number;
    edgeCases: number;
  };
  categoryStats: Record<string, { total: number; passed: number; avgScore: number }>;
}

interface GeneratedProblem {
  difficulty: string;
  title: string;
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  visibleTestCases: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
  hiddenTestCases: Array<{ input: string; expectedOutput: string; explanation?: string; isHidden?: boolean }>;
  starterCode: string;
  solutionApproaches: string[];
  expectedComplexity: { time: string; space: string };
}

export default function CodingPage() {
  const router = useRouter();

  // Form state
  const [company, setCompany] = useState<string>("no_preference");
  const [customCompany, setCustomCompany] = useState("");
  const [easyCount, setEasyCount] = useState<number>(0);
  const [mediumCount, setMediumCount] = useState<number>(1);
  const [hardCount, setHardCount] = useState<number>(0);
  const [category, setCategory] = useState<ProblemCategory>("arrays");
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [mode, setMode] = useState<string>("coding-interview");

  // Company recommendations state
  const [customRecommendations, setCustomRecommendations] = useState<CompanyInterviewPattern | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Generated problems state
  const [generatedProblems, setGeneratedProblems] = useState<GeneratedProblem[]>([]);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);

  // Data state
  const [history, setHistory] = useState<ChallengeHistory[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch history and analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, analyticsRes] = await Promise.all([
          fetch("/api/coding/challenge"),
          fetch("/api/coding/analytics"),
        ]);

        if (historyRes.ok) {
          const data = await historyRes.json();
          setHistory(data.challenges || []);
        }

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchData();
  }, []);

  const totalQuestions = easyCount + mediumCount + hardCount;

  const getSelectedCompany = () => {
    return company === "custom"
      ? customCompany
      : company === "no_preference"
        ? ""
        : company;
  };

  // Get company pattern - either from predefined or custom recommendations
  const getCompanyPattern = useCallback((): CompanyInterviewPattern | null => {
    if (company === "custom" && customRecommendations) {
      return customRecommendations;
    }
    if (company !== "no_preference" && company !== "custom") {
      return COMPANY_PATTERNS[company as Company];
    }
    return null;
  }, [company, customRecommendations]);

  const selectedCompanyPattern = getCompanyPattern();

  // Fetch recommendations for custom company
  const fetchCustomRecommendations = async () => {
    if (!customCompany.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    setIsLoadingRecommendations(true);
    setCustomRecommendations(null);

    try {
      const response = await fetch("/api/coding/company-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: customCompany.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const data = await response.json();
      setCustomRecommendations(data.recommendations);
      toast.success(`Got interview pattern for ${customCompany}`);
    } catch (error) {
      toast.error("Failed to get recommendations. Using defaults.");
      // Set default recommendations
      setCustomRecommendations({
        name: customCompany,
        topTopics: ["arrays", "strings", "hash-tables", "trees", "dynamic-programming"],
        difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
        description: `Technical interview preparation for ${customCompany}`,
        interviewStyle: "Focus on problem-solving and code quality",
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Apply company pattern to settings
  const applyCompanyPattern = () => {
    const pattern = getCompanyPattern();
    if (pattern) {
      setEasyCount(pattern.difficultyDistribution.easy);
      setMediumCount(pattern.difficultyDistribution.medium);
      setHardCount(pattern.difficultyDistribution.hard);
      // Use mixed category to leverage the backend's ability to pick form top topics
      setCategory("mixed" as ProblemCategory);
      setGeneratedProblems([]);
      toast.success(`Applied ${pattern.name} interview pattern`);
    }
  };

  const handleGenerateProblems = async () => {
    if (totalQuestions === 0) {
      toast.error("Please select at least one question");
      return;
    }

    setIsGenerating(true);
    setGeneratedProblems([]);

    try {
      const response = await fetch("/api/coding/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          language,
          company: getSelectedCompany() || undefined,
          questionCounts: {
            easy: easyCount,
            medium: mediumCount,
            hard: hardCount,
          },
          mode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate problems");
      }

      const data = await response.json();
      setGeneratedProblems(data.problems);
      setSelectedProblemIndex(0);
      toast.success(`Generated ${data.totalGenerated} problem${data.totalGenerated !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate problems"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartChallenge = async (problemIndex: number) => {
    if (generatedProblems.length === 0) {
      toast.error("Please generate problems first");
      return;
    }

    setIsCreating(true);

    try {
      // If multiple problems are generated, create a Test Session
      // Or if the user explicitly wants to start the whole set
      // Currently the UI has "Start Challenge: Problem X".
      // I should add a "Start Test with All Problems" button.
      // But the user clicked "Generate Problems (3)".
      // The requirement says "start the test with 3 questions at a time".
      // So I will change the button to "Start Assessment" if there are multiple problems.

      const isTestSession = generatedProblems.length > 0; // Always use test session for consistency? 
      // Actually legacy single challenge is simpler for single practice.
      // Let's stick to: If user clicks "Start Challenge" on a specific tab, maybe they just want that one?
      // BUT, the request implies a flow change.
      // I will add a "Start Assessment (All X Problems)" button.

      // WAIT, I am replacing the function handleStartChallenge.
      // I should assume this function is called when the main CTA is clicked.
      // I will modify the render to show "Start Assessment" instead of per-problem start if multiple.

      if (generatedProblems.length > 1) {
        const response = await fetch("/api/coding/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problems: generatedProblems,
            category,
            language,
            company: getSelectedCompany() || undefined,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create test");
        }

        const data = await response.json();
        toast.success("Assessment created! Get ready...");
        router.push(`/coding/test/${data.test.id}`);
        return;
      }

      // Single challenge fallback
      const problem = generatedProblems[problemIndex];
      const response = await fetch("/api/coding/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: problem.difficulty,
          category,
          language,
          company: getSelectedCompany() || undefined,
          generatedProblem: problem,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create challenge");
      }

      const data = await response.json();
      toast.success("Challenge created! Get ready...");
      router.push(`/coding/${data.challenge.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create challenge"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  const getStatusBadge = (status: string, passStatus?: boolean) => {
    if (status === "completed") {
      return passStatus
        ? "bg-green-500/10 text-green-500"
        : "bg-red-500/10 text-red-500";
    }
    if (status === "in_progress") {
      return "bg-blue-500/10 text-blue-500";
    }
    return "bg-gray-500/10 text-gray-500";
  };

  const selectedProblem = generatedProblems[selectedProblemIndex];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Coding Challenges</h1>
        <p className="text-muted-foreground mt-1">
          Practice DSA problems with AI-powered evaluation
        </p>
      </div>

      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">New Challenge</TabsTrigger>
          <TabsTrigger value="history">
            History
            {history.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {history.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* New Challenge Tab */}
        <TabsContent value="new" className="space-y-6">
          {/* Step 1: Company Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                Select Target Company
              </CardTitle>
              <CardDescription>
                Choose a company to get tailored interview questions and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Select
                    value={company}
                    onValueChange={(v) => {
                      setCompany(v);
                      setGeneratedProblems([]);
                      setCustomRecommendations(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_preference">No preference</SelectItem>
                      {COMPANIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom company...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {company === "custom" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter company name (e.g., Cognizant)"
                        value={customCompany}
                        onChange={(e) => {
                          setCustomCompany(e.target.value);
                          setCustomRecommendations(null);
                          setGeneratedProblems([]);
                        }}
                      />
                      <Button
                        onClick={fetchCustomRecommendations}
                        disabled={isLoadingRecommendations || !customCompany.trim()}
                        variant="secondary"
                      >
                        {isLoadingRecommendations ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          "Get Recommendations"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Pattern Display */}
              {selectedCompanyPattern && (
                <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedCompanyPattern.name} Interview Pattern</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCompanyPattern.description}
                      </p>
                    </div>
                    <Button onClick={applyCompanyPattern} size="sm">
                      Apply Pattern
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Top Topics */}
                    <div>
                      <p className="text-sm font-medium mb-2">Most Asked Topics:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCompanyPattern.topTopics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => {
                              setCategory(topic as ProblemCategory);
                              setGeneratedProblems([]);
                            }}
                          >
                            {CATEGORY_LABELS[topic as ProblemCategory] || topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Distribution */}
                    <div>
                      <p className="text-sm font-medium mb-2">Typical Interview Format:</p>
                      <div className="flex items-center gap-3">
                        {selectedCompanyPattern.difficultyDistribution.easy > 0 && (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className={getDifficultyBadge("easy")}>
                              {selectedCompanyPattern.difficultyDistribution.easy} Easy
                            </Badge>
                          </div>
                        )}
                        {selectedCompanyPattern.difficultyDistribution.medium > 0 && (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className={getDifficultyBadge("medium")}>
                              {selectedCompanyPattern.difficultyDistribution.medium} Medium
                            </Badge>
                          </div>
                        )}
                        {selectedCompanyPattern.difficultyDistribution.hard > 0 && (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className={getDifficultyBadge("hard")}>
                              {selectedCompanyPattern.difficultyDistribution.hard} Hard
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground italic border-t pt-3">
                    {selectedCompanyPattern.interviewStyle}
                  </p>
                </div>
              )}

              {company === "custom" && !customRecommendations && !isLoadingRecommendations && customCompany && (
                <p className="text-sm text-muted-foreground">
                  Click "Get Recommendations" to fetch interview patterns for {customCompany}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Configure Challenge */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                Configure Challenge
              </CardTitle>
              <CardDescription>
                Set the number of questions, category, and programming language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  {/* Number of Questions */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Number of Questions</label>
                    <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground">
                      Easy: {TIME_LIMITS.easy} min | Medium: {TIME_LIMITS.medium} min | Hard: {TIME_LIMITS.hard} min
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-green-500 font-medium">Easy</label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          value={easyCount}
                          onChange={(e) => {
                            setEasyCount(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)));
                            setGeneratedProblems([]);
                          }}
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-yellow-500 font-medium">Medium</label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          value={mediumCount}
                          onChange={(e) => {
                            setMediumCount(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)));
                            setGeneratedProblems([]);
                          }}
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-red-500 font-medium">Hard</label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          value={hardCount}
                          onChange={(e) => {
                            setHardCount(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)));
                            setGeneratedProblems([]);
                          }}
                          className="text-center"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total: {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
                      {totalQuestions > 0 && (
                        <span className="ml-1">
                          (~{easyCount * TIME_LIMITS.easy + mediumCount * TIME_LIMITS.medium + hardCount * TIME_LIMITS.hard} min)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Problem Category</label>
                    <Select
                      value={category}
                      onValueChange={(v) => {
                        setCategory(v as ProblemCategory);
                        setGeneratedProblems([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROBLEM_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORY_LABELS[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Programming Language</label>
                    <Select
                      value={language}
                      onValueChange={(v) => {
                        setLanguage(v as SupportedLanguage);
                        setGeneratedProblems([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                          <SelectItem key={key} value={key}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Interview Mode */}

                </div>

              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleGenerateProblems}
                disabled={isGenerating || totalQuestions === 0}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Problems (it may take 2-3 minutes)...
                  </span>
                ) : (
                  `Generate ${totalQuestions} Problem${totalQuestions !== 1 ? 's' : ''}`
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: Generated Problems */}
          {generatedProblems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                  Generated Problems ({generatedProblems.length})
                </CardTitle>
                <CardDescription>
                  Review your problems and start a challenge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Problem selector tabs */}
                  {generatedProblems.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {generatedProblems.map((problem, index) => (
                        <Button
                          key={index}
                          variant={selectedProblemIndex === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedProblemIndex(index)}
                          className="gap-2"
                        >
                          <Badge
                            variant="outline"
                            className={getDifficultyBadge(problem.difficulty)}
                          >
                            {problem.difficulty}
                          </Badge>
                          Problem {index + 1}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Selected problem details */}
                  {selectedProblem && (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-3 max-h-[400px] overflow-y-auto">
                        <div className="flex items-center justify-between sticky top-0 bg-card pb-2">
                          <h3 className="font-semibold text-lg">{selectedProblem.title}</h3>
                          <Badge
                            variant="outline"
                            className={getDifficultyBadge(selectedProblem.difficulty)}
                          >
                            {selectedProblem.difficulty}
                          </Badge>
                        </div>

                        {/* Description */}
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description:</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedProblem.description}
                          </p>
                        </div>

                        {/* Constraints */}
                        {selectedProblem.constraints.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Constraints:</h4>
                            <ul className="text-xs text-muted-foreground list-disc list-inside">
                              {selectedProblem.constraints.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Examples */}
                        {selectedProblem.examples.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Examples:</h4>
                            <div className="space-y-2">
                              {selectedProblem.examples.map((example, i) => (
                                <div key={i} className="bg-muted/50 p-2 rounded text-xs font-mono">
                                  <p><span className="text-muted-foreground">Input:</span> {example.input}</p>
                                  <p><span className="text-muted-foreground">Output:</span> {example.output}</p>
                                  {example.explanation && (
                                    <p className="mt-1 font-sans text-muted-foreground">
                                      <span className="font-medium">Explanation:</span> {example.explanation}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Test cases info */}
                        <div className="flex gap-4 text-xs pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{selectedProblem.visibleTestCases.length} visible test cases</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            <span>{selectedProblem.hiddenTestCases.length} hidden test cases</span>
                          </div>
                        </div>

                        {/* Expected complexity */}
                        {selectedProblem.expectedComplexity && (
                          <div className="text-xs text-muted-foreground">
                            Expected: Time {selectedProblem.expectedComplexity.time}, Space {selectedProblem.expectedComplexity.space}
                          </div>
                        )}
                      </div>

                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => handleStartChallenge(selectedProblemIndex)}
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {generatedProblems.length > 1 ? "Starting Assessment..." : "Starting Challenge..."}
                          </span>
                        ) : (
                          generatedProblems.length > 1
                            ? `Start Assessment (${generatedProblems.length} Problems)`
                            : `Start Challenge: ${selectedProblem.title}`
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Challenge History</CardTitle>
              <CardDescription>
                Your past coding challenges and scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="w-6 h-6 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No challenges yet. Start your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/coding/${challenge.id}`)}
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium">{challenge.title}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge
                            variant="outline"
                            className={getDifficultyBadge(challenge.difficulty)}
                          >
                            {challenge.difficulty}
                          </Badge>
                          <span className="text-muted-foreground">
                            {CATEGORY_LABELS[challenge.category as ProblemCategory] ||
                              challenge.category}
                          </span>
                          <span className="text-muted-foreground">
                            {SUPPORTED_LANGUAGES[challenge.language as SupportedLanguage]
                              ?.name || challenge.language}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {challenge.score && (
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {Math.round(challenge.score.overallScore)}%
                            </p>
                            <Badge
                              variant="outline"
                              className={getStatusBadge(
                                challenge.status,
                                challenge.score.passStatus
                              )}
                            >
                              {challenge.score.passStatus ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                        )}
                        {challenge.status !== "completed" && (
                          <Badge
                            variant="outline"
                            className={getStatusBadge(challenge.status)}
                          >
                            {challenge.status === "in_progress"
                              ? "In Progress"
                              : "Pending"}
                          </Badge>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {new Date(challenge.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          {analytics ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold">
                        {analytics.summary.totalChallenges}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Challenges
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold">
                        {analytics.summary.passedChallenges}
                      </p>
                      <p className="text-sm text-muted-foreground">Passed</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pass Rate</span>
                      <span className="font-medium">
                        {analytics.summary.passRate}%
                      </span>
                    </div>
                    <Progress value={analytics.summary.passRate} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Score</span>
                      <span className="font-medium">
                        {analytics.summary.avgOverallScore}%
                      </span>
                    </div>
                    <Progress value={analytics.summary.avgOverallScore} />
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analytics.scores).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <Progress
                        value={value}
                        className={`h-2 ${value >= 70
                          ? "[&>div]:bg-green-500"
                          : value >= 50
                            ? "[&>div]:bg-yellow-500"
                            : "[&>div]:bg-red-500"
                          }`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(analytics.categoryStats).length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No category data yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(analytics.categoryStats).map(
                        ([cat, stats]) => (
                          <div
                            key={cat}
                            className="flex items-center justify-between p-2 rounded bg-muted/50"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {CATEGORY_LABELS[cat as ProblemCategory] || cat}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {stats.passed}/{stats.total} passed
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                {Math.round(stats.avgScore)}%
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  Complete some challenges to see your statistics
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
