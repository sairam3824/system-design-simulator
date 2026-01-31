"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodingChallenge } from "./coding-challenge";

interface CodingTestProps {
    testId: string;
    initialStatus: string;
    initialTimeRemaining: number | null;
    challenges: any[];
}

export function CodingTest({
    challenges
}: CodingTestProps) {
    const router = useRouter();
    const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Global Header */}
            <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg">Coding Assessment (View Only)</h1>
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
                    <div className="flex items-center gap-2 px-4 py-2 rounded-md font-mono font-bold text-lg bg-background border-border border text-muted-foreground">
                        <Clock className="h-5 w-5" />
                        00:00
                    </div>

                    <Button variant="destructive" disabled>
                        Finish Test
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/coding")}>
                        Exit View
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
                                    </div>
                                    <div className="truncate text-xs opacity-70">
                                        {c.title}
                                    </div>
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
