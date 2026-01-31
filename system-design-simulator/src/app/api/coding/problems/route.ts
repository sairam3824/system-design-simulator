import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/coding/problems - List predefined problems
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:coding:problems", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const company = searchParams.get("company");

    // Build filter
    const where: Record<string, unknown> = {};
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (category) {
      where.category = category;
    }

    const problems = await prisma.codingProblem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        difficulty: true,
        category: true,
        companies: true,
        timeLimit: true,
        createdAt: true,
      },
    });

    // Filter by company if provided
    let filteredProblems = problems;
    if (company) {
      filteredProblems = problems.filter((p) => {
        const companies = JSON.parse(p.companies);
        return companies.includes(company);
      });
    }

    const formattedProblems = filteredProblems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      category: p.category,
      companies: JSON.parse(p.companies),
      timeLimit: p.timeLimit,
    }));

    return NextResponse.json({ problems: formattedProblems });
  } catch (error) {
    console.error("Problems fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
