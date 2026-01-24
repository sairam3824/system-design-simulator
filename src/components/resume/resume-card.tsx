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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface ResumeAnalysis {
  skills: string[];
  experience: string;
  strengths: string[];
  suggestedTopics: string[];
  summary: string;
}

interface ATSBreakdown {
  contactInfo: number;
  structure: number;
  experience: number;
  keywords: number;
  impact: number;
}

interface ResumeCardProps {
  resume: {
    id: string;
    fileName: string;
    content: string;
    analysis: ResumeAnalysis | null;
    atsScore: number | null;
    atsBreakdown: ATSBreakdown | null;
    atsFeedback: string[] | null;
    keywords: string[] | null;
    softSkills: string[] | null;
    predictedRoles: string[] | null;
    uploadedAt: Date;
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasAnalysis = resume.atsBreakdown || resume.atsFeedback || resume.keywords || resume.predictedRoles || resume.analysis;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/resume/${resume.id}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      toast.success("Resume analyzed successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to analyze resume. Make sure your OpenAI API key is configured.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resume/${resume.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resume");
      }

      toast.success("Resume deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-lg">{resume.fileName}</CardTitle>
          <CardDescription>
            Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
          </CardDescription>
        </div>

        {/* ATS Score Badge */}
        {resume.atsScore !== null && (
          <div className="flex flex-col items-center">
            <div className={`text-3xl font-bold ${getScoreColor(resume.atsScore)}`}>
              {resume.atsScore}
            </div>
            <div className="text-xs text-muted-foreground">ATS Score</div>
          </div>
        )}

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>{resume.fileName}</DialogTitle>
                <DialogDescription>Resume content</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh]">
                <pre className="whitespace-pre-wrap text-sm p-4 bg-muted rounded-lg">
                  {resume.content}
                </pre>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {!resume.analysis && (
            <Button
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </CardHeader>

      {/* Expand/Collapse Button */}
      {hasAnalysis && (
        <div className="px-6 pb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>{isExpanded ? "Hide Analysis" : "Show Analysis"}</span>
          </button>
        </div>
      )}

      {/* Collapsible Analysis Content */}
      {isExpanded && hasAnalysis && (
        <CardContent className="space-y-4 pt-2">
          {/* ATS Score Breakdown */}
          {resume.atsBreakdown && (
            <div className="space-y-3">
              <h4 className="font-medium">ATS Score Breakdown</h4>
              <div className="grid gap-2">
                {[
                  { label: "Contact Info", value: resume.atsBreakdown.contactInfo, max: 20 },
                  { label: "Structure", value: resume.atsBreakdown.structure, max: 20 },
                  { label: "Experience", value: resume.atsBreakdown.experience, max: 20 },
                  { label: "Keywords", value: resume.atsBreakdown.keywords, max: 20 },
                  { label: "Impact", value: resume.atsBreakdown.impact, max: 20 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.value}/{item.max}</span>
                    </div>
                    <Progress value={(item.value / item.max) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ATS Feedback */}
          {resume.atsFeedback && resume.atsFeedback.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Improvement Suggestions</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {resume.atsFeedback.map((feedback, i) => (
                  <li key={i}>{feedback}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords */}
          {resume.keywords && resume.keywords.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Extracted Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {resume.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Predicted Roles */}
          {resume.predictedRoles && resume.predictedRoles.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Best Suited Roles</h4>
              <div className="flex flex-wrap gap-2">
                {resume.predictedRoles.map((role) => (
                  <Badge key={role} variant="outline" className={getScoreBgColor(resume.atsScore || 0) + " text-white border-0"}>
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis (existing) */}
          {resume.analysis && (
            <>
              <div>
                <h4 className="font-medium mb-2">AI Summary</h4>
                <p className="text-sm text-muted-foreground">
                  {resume.analysis.summary}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Skills Identified</h4>
                <div className="flex flex-wrap gap-2">
                  {resume.analysis.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Strengths</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {resume.analysis.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Suggested Interview Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {resume.analysis.suggestedTopics.map((topic) => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
