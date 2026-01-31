"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TestCase } from "@/lib/coding/constants";

interface ProblemPanelProps {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  company?: string | null;
  visibleTests: TestCase[];
  timeLimit: number;
}

export function ProblemPanel({
  title,
  description,
  difficulty,
  category,
  company,
  visibleTests,
  timeLimit,
}: ProblemPanelProps) {
  const difficultyColor = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    hard: "bg-red-500/10 text-red-500 border-red-500/20",
  }[difficulty] || "bg-gray-500/10 text-gray-500";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4 pb-24">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className={difficultyColor}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                {category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </Badge>
              {company && (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  {company}
                </Badge>
              )}
              <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                {timeLimit} min
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {formatDescription(description)}
            </div>
          </div>

          <Separator />

          {/* Test Cases */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Test Cases</h2>
            <div className="space-y-3">
              {visibleTests.map((test, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card p-3 text-sm"
                >
                  <div className="font-medium text-muted-foreground mb-2">
                    Test Case {index + 1}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">Input: </span>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                        {test.input}
                      </code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected: </span>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                        {test.expectedOutput}
                      </code>
                    </div>
                    {test.explanation && (
                      <div className="text-muted-foreground text-xs mt-1">
                        {test.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Additional hidden test cases will be used for final evaluation.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Helper to format markdown-like description
function formatDescription(description: string): React.ReactNode {
  // Simple markdown-like formatting
  const lines = description.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      // Bold header
      elements.push(
        <div key={i} className="font-semibold mt-3 mb-1">
          {line.slice(2, -2)}
        </div>
      );
    } else if (line.startsWith("- ")) {
      // List item
      elements.push(
        <div key={i} className="ml-4 flex items-start gap-2">
          <span className="text-muted-foreground">•</span>
          <span>{formatInlineCode(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<div key={i}>{formatInlineCode(line)}</div>);
    }
  });

  return elements;
}

// Format inline code blocks
function formatInlineCode(text: string): React.ReactNode {
  const parts = text.split(/`([^`]+)`/);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="bg-muted px-1 py-0.5 rounded text-xs">
        {part}
      </code>
    ) : (
      part
    )
  );
}
