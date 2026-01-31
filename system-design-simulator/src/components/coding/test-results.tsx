"use client";

import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface TestResult {
  input: string;
  expectedOutput: string;
  passed: boolean;
  actualOutput?: string;
  analysis?: string;
}

interface TestResultsProps {
  results: TestResult[] | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  syntaxErrors?: string[];
  logicAnalysis?: string;
}

export function TestResults({
  results,
  isLoading = false,
  errorMessage,
  syntaxErrors,
  logicAnalysis,
}: TestResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Evaluating code... Hold on</span>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
          {errorMessage}
        </div>
        {syntaxErrors && syntaxErrors.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Syntax Issues:</p>
            <ul className="list-disc list-inside text-sm text-red-400">
              {syntaxErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-muted-foreground">
        <p className="text-sm">Submit your code to see test results</p>
      </div>
    );
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {allPassed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              {passedCount}/{totalCount} Tests Passed
            </span>
          </div>
          <Badge
            variant="outline"
            className={
              allPassed
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20"
            }
          >
            {allPassed ? "All Passed" : `${totalCount - passedCount} Failed`}
          </Badge>
        </div>

        {/* Logic Analysis */}
        {logicAnalysis && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Logic Analysis</p>
            <p className="text-muted-foreground">{logicAnalysis}</p>
          </div>
        )}

        {/* Individual Results */}
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`rounded-lg border p-3 text-sm ${result.passed
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-red-500/20 bg-red-500/5"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">Test Case {index + 1}</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    result.passed
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  }
                >
                  {result.passed ? "Passed" : "Failed"}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Input: </span>
                  <code className="bg-muted px-1.5 py-0.5 rounded">
                    {result.input}
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected: </span>
                  <code className="bg-muted px-1.5 py-0.5 rounded">
                    {result.expectedOutput}
                  </code>
                </div>
                {result.actualOutput && (
                  <div>
                    <span className="text-muted-foreground">Output: </span>
                    <code
                      className={`px-1.5 py-0.5 rounded ${result.passed
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                        }`}
                    >
                      {result.actualOutput}
                    </code>
                  </div>
                )}
                {result.analysis && (
                  <div className="text-muted-foreground mt-1 pt-1 border-t border-border">
                    {result.analysis}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
