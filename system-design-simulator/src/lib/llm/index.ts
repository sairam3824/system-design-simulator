/**
 * LLM Types and Interfaces
 *
 * Unified type definitions for LLM interactions.
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMCompletionOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  provider: "ollama" | "openai";
  fallbackUsed: boolean;
  model: string;
}

export interface LLMStreamResponse {
  stream: ReadableStream<Uint8Array>;
  provider: "ollama" | "openai";
  fallbackUsed: boolean;
  model: string;
}

export type ModelType = "general" | "coding";

// Re-export client functions
export { complete, streamComplete, checkLLMHealth } from "./client";
