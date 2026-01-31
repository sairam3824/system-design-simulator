import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.SUBMIT, "api:profile:update", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { name, bio, yearsExperience, targetRole, skills, targetCompanies } =
      body;

    // Update user name
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Upsert profile
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        bio,
        yearsExperience,
        targetRole,
        skills: JSON.stringify(skills || []),
        targetCompanies: JSON.stringify(targetCompanies || []),
      },
      create: {
        userId: session.user.id,
        bio,
        yearsExperience,
        targetRole,
        skills: JSON.stringify(skills || []),
        targetCompanies: JSON.stringify(targetCompanies || []),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
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

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:profile:get", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      ...profile,
      skills: profile ? JSON.parse(profile.skills) : [],
      targetCompanies: profile ? JSON.parse(profile.targetCompanies) : [],
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
