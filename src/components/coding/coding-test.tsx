
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CodingChallenge } from "./coding-challenge";

interface CodingTestProps {
    testId: string;
    initialStatus: string;
    initialTimeRemaining: number | null;
    challenges: any[]; // Using any[] for simplicity matching CodingChallenge prop
}

export function CodingTest({
    testId,
    initialStatus,
    initialTimeRemaining,
    challenges
}: CodingTestProps) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(initialTimeRemaining);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-start test logic
    useEffect(() => {
        if (status === "pending") {
            startTest();
        }
    }, [status]);

    const startTest = async () => {
        try {
            const response = await fetch(`/api/coding/test/${testId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "start" }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to start test");
            }

            setStatus("in_progress");
            toast.success("Test Started! Good luck!");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to start test session");
        }
    };

    // Timer Logic
    useEffect(() => {
        if (status !== "in_progress" || timeRemaining === null) return;

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 1000) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    // Time up logic
                    toast.warning("Test time expired!");
                    finishTest();
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    const finishTest = async () => {
        try {
            await fetch(`/api/coding/test/${testId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "complete" }),
            });

            setStatus("completed");
            toast.info("Test Completed");

            // Redirect back to coding dashboard after a short delay
            setTimeout(() => {
                router.push("/coding");
            }, 1000);
        } catch (error) {
            console.error("Failed to finish test", error);
        }
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const isTimeCritical = timeRemaining !== null && timeRemaining < 5 * 60 * 1000;

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Global Header */}
            <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg">Coding Assessment</h1>
                    <div className="flex gap-2">
                        {challenges.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${idx === activeChallengeIndex
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {status === "in_progress" && timeRemaining !== null && (
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono font-bold text-lg border ${isTimeCritical
                                ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                                : "bg-background border-border"
                                }`}
                        >
                            <Clock className="h-5 w-5" />
                            {formatTime(timeRemaining)}
                        </div>
                    )}

                    <Button variant="destructive" onClick={finishTest} disabled={status === "completed"}>
                        Finish Test
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-border bg-muted/10 flex flex-col">
                    <div className="p-4 border-b border-border">
                        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                            Questions
                        </h2>
                        <div className="space-y-2">
                            {challenges.map((c, idx) => (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveChallengeIndex(idx)}
                                    className={`w-full text-left p-3 rounded-md text-sm transition-all border ${activeChallengeIndex === idx
                                        ? "bg-background border-primary shadow-sm ring-1 ring-primary/20"
                                        : "hover:bg-muted border-transparent text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">Problem {idx + 1}</span>
                                        {c.status === "completed" && (
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                        )}
                                    </div>
                                    <div className="truncate text-xs opacity-70">
                                        {c.title}
                                    </div>
                                    <Badge variant="outline" className={`mt-2 text-[10px] px-1.5 py-0 h-5 ${c.difficulty === "easy" ? "text-green-500 border-green-500/20" :
                                        c.difficulty === "medium" ? "text-yellow-500 border-yellow-500/20" :
                                            "text-red-500 border-red-500/20"
                                        }`}>
                                        {c.difficulty}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative">
                    {challenges.map((challenge, idx) => (
                        <div
                            key={challenge.id}
                            className={`absolute inset-0 bg-background ${activeChallengeIndex === idx ? 'z-10' : 'z-0 invisible'}`}
                        >
                            <CodingChallenge
                                initialChallenge={challenge}
                                hideHeader={true}
                                isTestMode={true}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
