import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ollamaChatStream, OllamaMessage } from "@/lib/ollama";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return new Response("Message is required", { status: 400 });
    }

    // Verify ownership and get interview with messages
    const interview = await prisma.interview.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!interview) {
      return new Response("Interview not found", { status: 404 });
    }

    if (interview.status === "completed") {
      return new Response("Interview is already completed", { status: 400 });
    }

    // Save user message
    await prisma.message.create({
      data: {
        interviewId: id,
        role: "user",
        content: message,
      },
    });

    // Build conversation history for Ollama
    const messages: OllamaMessage[] = interview.messages.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    }));

    // Add the new user message
    messages.push({ role: "user", content: message });

    // Create streaming response using Ollama
    const ollamaStream = await ollamaChatStream({
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    // Create a ReadableStream for the response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let buffer = "";

    const readable = new ReadableStream({
      async start(controller) {
        const reader = ollamaStream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Save the complete assistant message
              if (fullResponse.trim()) {
                await prisma.message.create({
                  data: {
                    interviewId: id,
                    role: "assistant",
                    content: fullResponse,
                  },
                });
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
              controller.close();
              break;
            }

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete JSON lines from Ollama
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const json = JSON.parse(line);
                  if (json.message?.content) {
                    const content = json.message.content;
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch {
                  // Skip invalid JSON lines
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);

          // Save partial response if any
          if (fullResponse.trim()) {
            await prisma.message.create({
              data: {
                interviewId: id,
                role: "assistant",
                content: fullResponse,
              },
            });
          }

          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
