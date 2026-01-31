
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rateLimitResponse = await rateLimit(request, RATE_LIMITS.SUBMIT, "api:coding:test:update", session.user.id);
        if (rateLimitResponse) return rateLimitResponse;

        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        const testSession = await prisma.codingTest.findUnique({
            where: { id },
            include: { challenges: true }
        });

        if (!testSession) {
            return NextResponse.json({ error: "Test not found" }, { status: 404 });
        }

        if (testSession.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (action === "start") {
            if (testSession.status !== "pending") {
                return NextResponse.json(
                    { error: "Test already started" },
                    { status: 400 }
                );
            }

            const now = new Date();

            // Update Test status
            const updatedTest = await prisma.codingTest.update({
                where: { id },
                data: {
                    status: "in_progress",
                    startedAt: now,
                },
            });

            // Update all associated challenges to in_progress and set startedAt
            await prisma.codingChallenge.updateMany({
                where: { testId: id },
                data: {
                    status: "in_progress",
                    startedAt: now,
                }
            });

            return NextResponse.json({ test: updatedTest });
        }

        if (action === "complete") {
            // Mark test as completed
            const updatedTest = await prisma.codingTest.update({
                where: { id },
                data: {
                    status: "completed",
                    endedAt: new Date()
                }
            });

            // Mark all associated challenges as completed if they aren't already
            // This ensures they don't show as "In Progress" in history
            await prisma.codingChallenge.updateMany({
                where: {
                    testId: id,
                    status: "in_progress"
                },
                data: {
                    status: "completed"
                }
            });

            return NextResponse.json({ test: updatedTest });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Test update error:", error);
        return NextResponse.json(
            { error: "Failed to update test" },
            { status: 500 }
        );
    }
}
