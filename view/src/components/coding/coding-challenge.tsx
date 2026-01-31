"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChallengeWorkspace } from "./challenge-workspace";
import { TestCase } from "@/lib/coding/constants";
import { SupportedLanguage } from "@/lib/coding/constants";

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
  score?: any;
}

interface CodingChallengeProps {
  initialChallenge: ChallengeData;
  hideHeader?: boolean;
  isTestMode?: boolean;
}

export function CodingChallenge({ initialChallenge, hideHeader = false, isTestMode = false }: CodingChallengeProps) {
  const router = useRouter();
  const [challenge] = useState(initialChallenge);
  const [code, setCode] = useState(
    initialChallenge.finalCode || initialChallenge.starterCode || ""
  );
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    (initialChallenge.language as SupportedLanguage) || "typescript"
  );
  const [activeTab, setActiveTab] = useState("problem");

  useEffect(() => {
    if (!hideHeader && !isTestMode) {
      toast.info("Coding environment is in View-Only mode.");
    }
  }, []);

  return (
    <div className={`h-screen flex flex-col bg-background ${hideHeader ? 'h-full' : ''}`}>
      {/* Header */}
      {!hideHeader && (
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg truncate max-w-md">
              {challenge.title}
            </h1>
            <Badge variant="outline">{challenge.difficulty}</Badge>
            <Badge className="bg-gray-500 text-white">View Only</Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => router.push("/coding")}>
              Back to Problems
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative pointer-events-none opacity-80">
        {/* We disable pointer events to stop interaction, but user can still see. 
              Ideally we might want scroll to still work, so maybe not pointer-events-none on container,
              but passed down. For now, ChallengeWorkspace is likely complex, so visual disabled state is safer 
              than modifying all internals. 
              However, if scroll is needed, we should allow it.
           */}

        {/* A better approach: Render Workspace but intercept actions */}
        <ChallengeWorkspace
          challenge={challenge}
          code={code}
          onCodeChange={() => { }} // No-op
          language={selectedLanguage}
          onLanguageChange={() => { }} // No-op
          activeTab={activeTab}
          onTabChange={setActiveTab} // Allow tab changing?
          testResults={null}
          errorMessage={null}
          syntaxErrors={[]}
          logicAnalysis={undefined}
          completionStats={null}
          isSubmitting={false}
          isCompleting={false}
          onReset={() => { }}
          onRunTests={() => { }}
          onSubmit={() => { }}
          readOnly={true}
        />

        {/* Overlay to ensure purely view only but allow tab clicks if ChallengeWorkspace supports it? 
              Ref: ChallengeWorkspace likely has tabs. If I pass readOnly=true, hopefully it handles editor.
              But buttons might still be clickable.
          */}
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">

        </div>
      </div>
      <div className="absolute bottom-10 right-10 z-50 bg-background/90 border p-4 rounded shadow-lg pointer-events-none">
        <p className="font-semibold text-muted-foreground">Editor disabled in View-Only Mode</p>
      </div>
    </div>
  );
}
