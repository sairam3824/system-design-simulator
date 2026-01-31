/**
 * Ollama Status Check API
 *
 * GET /api/ollama/status
 * Returns the status of Ollama and available models
 *
 * Models used:
 * - llama3 (8B): System design interviews
 * - codellama:7b: Coding challenges
 */

import { NextRequest, NextResponse } from "next/server";
import { checkOllamaHealth, listModels } from "@/lib/ollama";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:ollama:status");
  if (rateLimitResponse) return rateLimitResponse;
  try {
    const isHealthy = await checkOllamaHealth();

    if (!isHealthy) {
      return NextResponse.json({
        status: "offline",
        message: "Ollama is not running. Start it with: ollama serve",
        models: [],
        modelStatus: {
          llama3: false,
          codellama: false,
        },
      });
    }

    const models = await listModels();

    // Check for required models
    const hasLlama3 = models.some(
      (m) => m.includes("llama3") || m.includes("llama3:8b")
    );
    const hasCodeLlama = models.some(
      (m) => m.includes("codellama") || m.includes("code-llama")
    );

    // Build status message
    const missingModels: string[] = [];
    if (!hasLlama3) missingModels.push("llama3");
    if (!hasCodeLlama) missingModels.push("codellama:7b");

    let message = "Ollama is running";
    if (missingModels.length > 0) {
      message += `. Missing models: ${missingModels.join(", ")}. Install with: ${missingModels.map(m => `ollama pull ${m}`).join(" && ")}`;
    } else {
      message += " with all required models (llama3 for interviews, codellama for coding)";
    }

    return NextResponse.json({
      status: "online",
      message,
      models,
      modelStatus: {
        llama3: hasLlama3,
        codellama: hasCodeLlama,
      },
      // For backward compatibility
      recommendedModel: "llama3",
      hasRecommendedModel: hasLlama3,
      // For coding challenges
      codeModel: "codellama:7b",
      hasCodeModel: hasCodeLlama,
    });
  } catch (error) {
    console.error("Ollama status check error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check Ollama status",
        models: [],
        modelStatus: {
          llama3: false,
          codellama: false,
        },
      },
      { status: 500 }
    );
  }
}
