/**
 * Help Bot API
 *
 * Proxies requests to the Python RAG service.
 * Handles rate limiting errors gracefully.
 *
 * POST /api/help-bot
 * Body: { question: string }
 */

import { NextRequest, NextResponse } from "next/server";

const HELP_BOT_URL = process.env.HELP_BOT_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Forward to Python RAG service
    const response = await fetch(`${HELP_BOT_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward client IP for rate limiting
        "X-Forwarded-For": request.headers.get("x-forwarded-for") ||
                          request.headers.get("x-real-ip") ||
                          "127.0.0.1",
      },
      body: JSON.stringify({ question }),
    });

    // Handle rate limit exceeded
    if (response.status === 429) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please wait a moment before asking another question.",
          retryAfter: response.headers.get("Retry-After") || "60",
        },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const error = await response.text();
      console.error("Help bot service error:", error);
      return NextResponse.json(
        { error: "Help bot service unavailable" },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Help bot API error:", error);

    // Check if it's a connection error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Help bot service is not running",
          hint: "Start the help-bot service: cd help-bot && python main.py",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Health check for help bot service
 */
export async function GET() {
  try {
    const response = await fetch(`${HELP_BOT_URL}/health`, {
      method: "GET",
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "unavailable" },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        status: "unavailable",
        hint: "Start the help-bot service: cd help-bot && python main.py",
      },
      { status: 503 }
    );
  }
}
