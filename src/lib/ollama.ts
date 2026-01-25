/**
 * Ollama Client for Local LLM Inference
 *
 * Uses Ollama running locally for faster interview interactions.
 *
 * Models:
 * - llama3 (8B): Default for system design interviews
 * - codellama:7b: Specialized for coding challenges
 *
 * Make sure Ollama is running: ollama serve
 * Pull the models:
 *   ollama pull llama3
 *   ollama pull codellama:7b
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3:8b";
const OLLAMA_CODE_MODEL = process.env.OLLAMA_CODE_MODEL || "codellama:7b";

// Model types for different use cases
export type ModelType = "general" | "coding";

// Get the appropriate model based on use case
export function getModelForType(type: ModelType): string {
  switch (type) {
    case "coding":
      return OLLAMA_CODE_MODEL;
    case "general":
    default:
      return OLLAMA_MODEL;
  }
}

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaCompletionOptions {
  model?: string;
  messages: OllamaMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string[];
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Check if Ollama is running and available
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List available models
 */
export async function listModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

/**
 * Non-streaming chat completion
 */
export async function ollamaChat(
  options: OllamaCompletionOptions
): Promise<OllamaResponse> {
  const { model = OLLAMA_MODEL, messages, temperature = 0.7 } = options;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature,
        num_predict: options.max_tokens || 800,
        top_p: options.top_p || 0.9,
        stop: options.stop,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama error: ${error}`);
  }

  return response.json();
}

/**
 * Streaming chat completion - returns a ReadableStream
 */
export async function ollamaChatStream(
  options: OllamaCompletionOptions
): Promise<ReadableStream<Uint8Array>> {
  const { model = OLLAMA_MODEL, messages, temperature = 0.7 } = options;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        temperature,
        num_predict: options.max_tokens || 800,
        top_p: options.top_p || 0.9,
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

  return response.body;
}

/**
 * Transform Ollama stream to SSE format for client consumption
 */
export function createOllamaSSEStream(
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
                  // Send as SSE format
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

/**
 * Simple wrapper for interview chat - handles both streaming and non-streaming
 */
export const ollama = {
  chat: {
    completions: {
      create: async (options: {
        model?: string;
        messages: OllamaMessage[];
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
      }) => {
        if (options.stream) {
          const stream = await ollamaChatStream({
            model: options.model || OLLAMA_MODEL,
            messages: options.messages,
            temperature: options.temperature,
            max_tokens: options.max_tokens,
            stream: true,
          });
          return { body: createOllamaSSEStream(stream) };
        } else {
          const response = await ollamaChat({
            model: options.model || OLLAMA_MODEL,
            messages: options.messages,
            temperature: options.temperature,
            max_tokens: options.max_tokens,
            stream: false,
          });
          return {
            choices: [
              {
                message: {
                  role: response.message.role,
                  content: response.message.content,
                },
              },
            ],
          };
        }
      },
    },
  },
};

/**
 * CodeLlama-specific chat for coding challenges
 * Uses codellama:7b model optimized for code generation and analysis
 */
export async function codeLlamaChat(
  options: Omit<OllamaCompletionOptions, "model">
): Promise<OllamaResponse> {
  return ollamaChat({
    ...options,
    model: OLLAMA_CODE_MODEL,
  });
}

/**
 * Check if CodeLlama model is available
 */
export async function checkCodeLlamaAvailable(): Promise<boolean> {
  try {
    const models = await listModels();
    return models.some(
      (m) => m.includes("codellama") || m.includes("code-llama")
    );
  } catch {
    return false;
  }
}

export default ollama;
