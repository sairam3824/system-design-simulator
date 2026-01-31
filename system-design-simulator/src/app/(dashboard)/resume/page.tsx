import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { ResumeCard } from "@/components/resume/resume-card";

export default async function ResumePage() {
  const session = await auth();
  const userId = session?.user?.id;

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Resume Management</h1>
        <p className="text-muted-foreground mt-1">
          Upload and analyze your resume for personalized interview preparation
        </p>
      </div>

      <ResumeUpload />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Resumes</h2>
        {resumes.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No resumes uploaded yet. Upload your first resume above!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={{
                  ...resume,
                  analysis: resume.analysis ? JSON.parse(resume.analysis) : null,
                  atsBreakdown: resume.atsBreakdown ? JSON.parse(resume.atsBreakdown) : null,
                  atsFeedback: resume.atsFeedback ? JSON.parse(resume.atsFeedback) : null,
                  keywords: resume.keywords ? JSON.parse(resume.keywords) : null,
                  softSkills: resume.softSkills ? JSON.parse(resume.softSkills) : null,
                  predictedRoles: resume.predictedRoles ? JSON.parse(resume.predictedRoles) : null,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
