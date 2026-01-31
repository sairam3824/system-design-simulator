/**
 * Ollama Provider
 *
 * Handles all Ollama-specific LLM interactions with timeout support.
 */

import type { LLMMessage, LLMCompletionOptions, LLMResponse, LLMStreamResponse } from "./index";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const OLLAMA_CODE_MODEL = process.env.OLLAMA_CODE_MODEL || "codellama:7b";
const OLLAMA_TIMEOUT = 30000; // 30 second timeout

export type OllamaModelType = "general" | "coding";

function getModelForType(type: OllamaModelType): string {
  return type === "coding" ? OLLAMA_CODE_MODEL : OLLAMA_MODEL;
}

/**
 * Check if Ollama is healthy
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Non-streaming completion with Ollama
 */
export async function ollamaComplete(
  options: LLMCompletionOptions,
  modelType: OllamaModelType = "general"
): Promise<LLMResponse> {
  const model = getModelForType(modelType);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 800,
          top_p: options.topP ?? 0.9,
          stop: options.stop,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.message?.content || "",
      provider: "ollama",
      fallbackUsed: false,
      model,
    };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Streaming completion with Ollama
 */
export async function ollamaStreamComplete(
  options: LLMCompletionOptions,
  modelType: OllamaModelType = "general"
): Promise<LLMStreamResponse> {
  const model = getModelForType(modelType);

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens ?? 800,
        top_p: options.topP ?? 0.9,
        stop: options.stop,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama streaming error: ${error}`);
  }

  if (!response.body) {
    throw new Error("No response body from Ollama");
  }

  // Transform Ollama stream to SSE format
  const stream = transformOllamaStream(response.body);

  return {
    stream,
    provider: "ollama",
    fallbackUsed: false,
    model,
  };
}

/**
 * Transform Ollama stream to SSE format
 */
function transformOllamaStream(
  ollamaStream: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = ollamaStream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete JSON lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const json = JSON.parse(line);
                if (json.message?.content) {
                  const sseData = `data: ${JSON.stringify({ content: json.message.content })}\n\n`;
                  controller.enqueue(encoder.encode(sseData));
                }
                if (json.done) {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
