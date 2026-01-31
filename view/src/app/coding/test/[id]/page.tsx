
import { auth } from "@/lib/auth";
import { CodingTest } from "@/components/coding/coding-test";

const MOCK_CHALLENGES = [
    {
        id: "mock-test-1",
        title: "Implement LRU Cache",
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
        difficulty: "medium",
        category: "Design",
        language: "typescript",
        timeLimit: 45,
        status: "pending",
        starterCode: "class LRUCache {\n  constructor(capacity: number) {\n\n  }\n\n  get(key: number): number {\n\n  }\n\n  put(key: number, value: number): void {\n\n  }\n}",
        visibleTests: [],
    },
    {
        id: "mock-test-2",
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "easy",
        category: "Stack",
        language: "typescript",
        timeLimit: 20,
        status: "pending",
        starterCode: "function isValid(s: string): boolean {\n  \n}",
        visibleTests: [],
    }
];

export default async function CodingTestPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    return (
        <CodingTest
            testId="mock-test-session"
            initialStatus="in_progress"
            initialTimeRemaining={3600000}
            challenges={MOCK_CHALLENGES}
        />
    );
}
