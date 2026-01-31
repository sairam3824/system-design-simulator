
import { auth } from "@/lib/auth";
import { CodingChallenge } from "@/components/coding/coding-challenge";

const MOCK_CHALLENGE = {
  id: "mock-1",
  title: "Two Sum",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  difficulty: "easy",
  category: "Array",
  company: "Google",
  language: "typescript",
  timeLimit: 30,
  status: "pending",
  starterCode: "function twoSum(nums: number[], target: number): number[] {\n  \n}",
  visibleTests: [],
};

export default async function CodingChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  return (
    <CodingChallenge
      initialChallenge={{
        ...MOCK_CHALLENGE,
        id: id
      }}
    />
  );
}
