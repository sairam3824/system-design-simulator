"use client";

import { useSession } from "@/components/mock-session-provider";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { ResumeCard } from "@/components/resume/resume-card";
import { MOCK_RESUME } from "@/lib/mock-data";

export default function ResumePage() {
  const { data: session } = useSession();

  // Create a mock resume object compatible with ResumeCard
  const mockResume = {
    id: "mock-resume-1",
    fileName: MOCK_RESUME.fileName,
    content: "Mock resume content...",
    analysis: {
      summary: "This is a strong resume for a Senior Software Engineer.",
      skills: MOCK_RESUME.parsedContent.skills,
      strengths: MOCK_RESUME.analysis.strengths,
      suggestedTopics: ["System Design", "Distributed Systems"],
      experience: "5 years"
    },
    atsScore: MOCK_RESUME.analysis.score,
    atsBreakdown: {
      contactInfo: 18,
      structure: 19,
      experience: 16,
      keywords: 15,
      impact: 17
    },
    atsFeedback: MOCK_RESUME.analysis.suggestions,
    keywords: MOCK_RESUME.parsedContent.skills,
    softSkills: ["Leadership", "Communication"],
    predictedRoles: ["Senior Backend Engineer", "System Architect"],
    uploadedAt: new Date()
  };

  const resumes = [mockResume];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Resume Management</h1>
        <p className="text-muted-foreground mt-1">
          Upload and analyze your resume (View Only)
        </p>
      </div>

      <div className="relative group">
        <div className="pointer-events-none opacity-60">
          <ResumeUpload />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
            <p className="font-semibold text-muted-foreground">Resume upload disabled in view-only mode</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Resumes</h2>
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
