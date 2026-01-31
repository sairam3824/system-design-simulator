/**
 * OpenAI Provider
 *
 * Handles all OpenAI-specific LLM interactions as fallback.
 */

import OpenAI from "openai";
import type { LLMCompletionOptions, LLMResponse, LLMStreamResponse } from "./index";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Non-streaming completion with OpenAI
 */
export async function openaiComplete(
  options: LLMCompletionOptions
): Promise<LLMResponse> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 800,
    top_p: options.topP ?? 0.9,
    stop: options.stop,
  });

  return {
    content: response.choices[0]?.message?.content || "",
    provider: "openai",
    fallbackUsed: true,
    model: OPENAI_MODEL,
  };
}

/**
 * Streaming completion with OpenAI
 */
export async function openaiStreamComplete(
  options: LLMCompletionOptions
): Promise<LLMStreamResponse> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 800,
    top_p: options.topP ?? 0.9,
    stop: options.stop,
    stream: true,
  });

  // Transform OpenAI stream to our SSE format
  const stream = transformOpenAIStream(response);

  return {
    stream,
    provider: "openai",
    fallbackUsed: true,
    model: OPENAI_MODEL,
  };
}

/**
 * Transform OpenAI stream to SSE format matching our expected format
 */
function transformOpenAIStream(
  openaiStream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of openaiStream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const sseData = `data: ${JSON.stringify({ content })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }

          // Check if this is the final chunk
          if (chunk.choices[0]?.finish_reason) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
