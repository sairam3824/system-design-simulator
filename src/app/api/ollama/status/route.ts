/**
 * Ollama Status Check API
 *
 * GET /api/ollama/status
 * Returns the status of Ollama and available models
 */

import { NextResponse } from "next/server";
import { checkOllamaHealth, listModels } from "@/lib/ollama";

export async function GET() {
  try {
    const isHealthy = await checkOllamaHealth();

    if (!isHealthy) {
      return NextResponse.json({
        status: "offline",
        message: "Ollama is not running. Start it with: ollama serve",
        models: [],
      });
    }

    const models = await listModels();
    const hasLlama3 = models.some(
      (m) => m.includes("llama3") || m.includes("llama3:8b")
    );

    return NextResponse.json({
      status: "online",
      message: hasLlama3
        ? "Ollama is running with llama3"
        : "Ollama is running but llama3 not found. Run: ollama pull llama3",
      models,
      recommendedModel: "llama3",
      hasRecommendedModel: hasLlama3,
    });
  } catch (error) {
    console.error("Ollama status check error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check Ollama status",
        models: [],
      },
      { status: 500 }
    );
  }
}
