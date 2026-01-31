import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.UPLOAD, "api:resume:create", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { fileName, content } = body;

    if (!fileName || !content) {
      return NextResponse.json(
        { error: "File name and content are required" },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName,
        content,
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:resume:list", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("Resume fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
