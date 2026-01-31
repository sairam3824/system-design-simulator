import { auth } from "@/lib/auth";
import { InterviewChat } from "@/components/interview/interview-chat";
import { MOCK_INTERVIEWS } from "@/lib/mock-data";

// Mock messages for the interview
const MOCK_MESSAGES = [
  {
    id: "msg-1",
    role: "assistant" as const,
    content: "Welcome to the system design interview. Today, we'll be designing a system like Twitter. Let's start with the requirements. What functionality should we focus on?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "msg-2",
    role: "user" as const,
    content: "Sure. I'd like to clarify the functional requirements first. Users should be able to post tweets, follow other users, and view their home timeline. Is that correct?",
    timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
  },
  {
    id: "msg-3",
    role: "assistant" as const,
    content: "That's a great start. What about non-functional requirements? Consider the scale we are designing for.",
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
  {
    id: "msg-4",
    role: "user" as const,
    content: "Right. Assuming 200M DAU and 100M new tweets per day. We need high availability for viewing timelines and eventual consistency for followers.",
    timestamp: new Date(Date.now() - 1000 * 60 * 26).toISOString(),
  }
];

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  // Find mock interview or default to first one
  const interview = MOCK_INTERVIEWS.find(i => i.id === id) || {
    id: id,
    topic: "System Design Interview",
    difficulty: "Hard",
    status: "completed",
    startedAt: new Date().toISOString(),
    score: null,
  };

  return (
    <InterviewChat
      interview={{
        id: interview.id,
        topic: interview.topic,
        difficulty: "Hard", // Mock data might be missing this specific field in type, safe default
        status: interview.status,
        startedAt: new Date().toISOString(),
      }}
      initialMessages={MOCK_MESSAGES}
      completedPhases={["requirements", "high-level"]}
      score={interview.score}
    />
  );
}
