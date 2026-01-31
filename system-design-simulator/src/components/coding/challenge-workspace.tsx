
"use client";

import { CodeEditor } from "./code-editor";
import { ProblemPanel } from "./problem-panel";
import { TestResults } from "./test-results";
import { ChallengeScoreCard } from "./challenge-score-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SupportedLanguage, SUPPORTED_LANGUAGES, TestCase } from "@/lib/coding/constants";
import { Button } from "@/components/ui/button";
import { RotateCcw, Send, Square } from "lucide-react";

interface TestResult {
    input: string;
    expectedOutput: string;
    passed: boolean;
    actualOutput?: string;
    analysis?: string;
}

interface ChallengeWorkspaceProps {
    challenge: {
        title: string;
        description: string;
        difficulty: string;
        category: string;
        company?: string | null;
        visibleTests: TestCase[];
        timeLimit: number;
        score?: any;
        status: string;
    };
    code: string;
    onCodeChange: (code: string) => void;
    language: SupportedLanguage;
    onLanguageChange: (lang: SupportedLanguage) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;

    // State
    testResults: TestResult[] | null;
    errorMessage: string | null;
    syntaxErrors: string[];
    logicAnalysis: string | undefined;
    completionStats: any;

    // Actions
    isSubmitting: boolean;
    isCompleting: boolean;
    onReset: () => void;
    onRunTests: () => void;
    onSubmit: () => void;

    readOnly?: boolean;
    hideControls?: boolean; // If controls are moved elsewhere
}

export function ChallengeWorkspace({
    challenge,
    code,
    onCodeChange,
    language,
    onLanguageChange,
    activeTab,
    onTabChange,
    testResults,
    errorMessage,
    syntaxErrors,
    logicAnalysis,
    completionStats,
    isSubmitting,
    isCompleting,
    onReset,
    onRunTests,
    onSubmit,
    readOnly = false,
    hideControls = false,
}: ChallengeWorkspaceProps) {

    const isCompleted = challenge.status === "completed";

    return (
        <div className="flex-1 flex overflow-hidden h-full">
            {/* Left Panel - Problem/Results */}
            <div className="w-[45%] border-r border-border flex flex-col">
                <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="m-2">
                        <TabsTrigger value="problem">Problem</TabsTrigger>
                        <TabsTrigger value="results">
                            Results
                            {testResults && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    {testResults.filter((r) => r.passed).length}/
                                    {testResults.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        {isCompleted && challenge.score && (
                            <TabsTrigger value="score">Score</TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="problem" className="flex-1 flex flex-col overflow-hidden min-h-0 m-0 data-[state=inactive]:hidden text-left">
                        <ProblemPanel
                            title={challenge.title}
                            description={challenge.description}
                            difficulty={challenge.difficulty}
                            category={challenge.category}
                            company={challenge.company}
                            visibleTests={challenge.visibleTests}
                            timeLimit={challenge.timeLimit}
                        />
                    </TabsContent>

                    <TabsContent value="results" className="flex-1 flex flex-col overflow-hidden min-h-0 m-0 data-[state=inactive]:hidden text-left">
                        <TestResults
                            results={testResults}
                            isLoading={isSubmitting}
                            errorMessage={errorMessage}
                            syntaxErrors={syntaxErrors}
                            logicAnalysis={logicAnalysis}
                        />
                    </TabsContent>

                    {isCompleted && challenge.score && (
                        <TabsContent value="score" className="flex-1 flex flex-col overflow-hidden min-h-0 m-0 data-[state=inactive]:hidden text-left">
                            <ChallengeScoreCard
                                score={challenge.score}
                                testResults={completionStats || undefined}
                            />
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* Right Panel - Code Editor */}
            <div className="flex-1 flex flex-col">
                <div className="p-2 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        {/* Language Dropdown moved here if needed or passed via slots */}
                        <span className="text-sm font-medium">
                            {SUPPORTED_LANGUAGES[language]?.name || language}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {!hideControls && !readOnly && !isCompleted && (
                            <>
                                <Button variant="ghost" size="sm" onClick={onReset} disabled={isSubmitting}>
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Reset
                                </Button>
                                <Button variant="secondary" size="sm" onClick={onRunTests} disabled={isSubmitting}>
                                    <Send className="h-3.5 w-3.5 mr-1" />
                                    Run
                                </Button>
                                <Button size="sm" onClick={onSubmit} disabled={isCompleting}>
                                    <Square className="h-3.5 w-3.5 mr-1" />
                                    Submit
                                </Button>
                            </>
                        )}
                        <span className="text-xs text-muted-foreground ml-2">
                            Auto-save on
                        </span>
                    </div>
                </div>
                <div className="flex-1 relative">
                    <CodeEditor
                        language={language}
                        value={code}
                        onChange={onCodeChange}
                        readOnly={readOnly}
                    />
                </div>
            </div>
        </div>
    );
}
