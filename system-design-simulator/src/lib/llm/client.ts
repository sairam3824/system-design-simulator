/**
 * Unified LLM Client
 *
 * Provides a unified interface for LLM operations with automatic
 * fallback from Ollama to OpenAI when Ollama is unavailable.
 */

import type {
  LLMCompletionOptions,
  LLMResponse,
  LLMStreamResponse,
  ModelType,
} from "./index";
import {
  checkOllamaHealth,
  ollamaComplete,
  ollamaStreamComplete,
  type OllamaModelType,
} from "./ollama-provider";
import {
  isOpenAIConfigured,
  openaiComplete,
  openaiStreamComplete,
} from "./openai-provider";
import { getOrFetch } from "@/lib/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

/**
 * Check LLM health with caching
 */
export async function checkLLMHealth(): Promise<{
  ollamaAvailable: boolean;
  openaiConfigured: boolean;
}> {
  // Always check fresh status (no caching) to handle "resetting" scenarios
  const ollamaAvailable = await checkOllamaHealth();

  return {
    ollamaAvailable,
    openaiConfigured: isOpenAIConfigured(),
  };
}

/**
 * Non-streaming completion with automatic fallback
 */
export async function complete(
  options: LLMCompletionOptions,
  modelType: ModelType = "general"
): Promise<LLMResponse> {
  // Check Ollama health (cached)
  const health = await checkLLMHealth();

  // Try Ollama first if available
  if (health.ollamaAvailable) {
    try {
      console.log("[LLM] Attempting Ollama completion...");
      const response = await ollamaComplete(
        options,
        modelType as OllamaModelType
      );
      console.log("[LLM] Ollama completion successful");
      return response;
    } catch (error) {
      console.warn("[LLM] Ollama failed, checking fallback:", error);
    }
  }

  // Fallback to OpenAI
  if (health.openaiConfigured) {
    console.log("[LLM] Falling back to OpenAI...");
    const response = await openaiComplete(options);
    console.log("[LLM] OpenAI completion successful");
    return response;
  }

  throw new Error(
    "No LLM provider available. Ollama is not running and OpenAI is not configured."
  );
}

/**
 * Streaming completion with automatic fallback
 */
export async function streamComplete(
  options: LLMCompletionOptions,
  modelType: ModelType = "general"
): Promise<LLMStreamResponse> {
  // Check Ollama health (cached)
  const health = await checkLLMHealth();

  // Try Ollama first if available
  if (health.ollamaAvailable) {
    try {
      console.log("[LLM] Attempting Ollama streaming...");
      const response = await ollamaStreamComplete(
        options,
        modelType as OllamaModelType
      );
      console.log("[LLM] Ollama streaming started");
      return response;
    } catch (error) {
      console.warn("[LLM] Ollama streaming failed, checking fallback:", error);
    }
  }

  // Fallback to OpenAI
  if (health.openaiConfigured) {
    console.log("[LLM] Falling back to OpenAI streaming...");
    const response = await openaiStreamComplete(options);
    console.log("[LLM] OpenAI streaming started");
    return response;
  }

  throw new Error(
    "No LLM provider available. Ollama is not running and OpenAI is not configured."
  );
}
