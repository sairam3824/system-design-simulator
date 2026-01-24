import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";

const RESUME_MATCHER_URL = process.env.RESUME_MATCHER_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Save file locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = join(process.cwd(), "uploads");
    const filePath = join(uploadDir, uniqueFileName);
    const relativeFilePath = `/uploads/${uniqueFileName}`;

    await writeFile(filePath, buffer);

    // Send PDF to resume-matcher service
    const matcherFormData = new FormData();
    matcherFormData.append("file", file);

    const matcherResponse = await fetch(`${RESUME_MATCHER_URL}/api/parser`, {
      method: "POST",
      body: matcherFormData,
    });

    if (!matcherResponse.ok) {
      const errorText = await matcherResponse.text();
      console.error("Resume matcher error:", errorText);
      throw new Error("Failed to parse resume");
    }

    const data = await matcherResponse.json();

    // Extract data from response
    const content = data.resume?.text || "";
    const atsScore = data.score?.totalScore || null;
    const atsBreakdown = data.score?.breakdown ? JSON.stringify(data.score.breakdown) : null;
    const atsFeedback = data.score?.feedback ? JSON.stringify(data.score.feedback) : null;
    const keywords = data.keywords ? JSON.stringify(data.keywords) : null;
    const softSkills = data.softSkills ? JSON.stringify(data.softSkills) : null;
    const predictedRoles = data.predictedRoles ? JSON.stringify(data.predictedRoles) : null;

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        filePath: relativeFilePath,
        content,
        atsScore,
        atsBreakdown,
        atsFeedback,
        keywords,
        softSkills,
        predictedRoles,
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF file. Make sure the resume-matcher service is running." },
      { status: 500 }
    );
  }
}
