// Problem Generator using CodeLlama 7B
// CodeLlama is optimized for code generation and understanding

import { codeLlamaChat, ollamaChat, OllamaMessage } from "@/lib/ollama";
import {
  PROBLEM_GENERATION_PROMPT,
  TEST_CASE_GENERATION_PROMPT,
} from "@/lib/prompts/coding";
import { DifficultyLevel, ProblemCategory, TestCase } from "./constants";

export interface GeneratedProblem {
  title: string;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  visibleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  solutionApproaches: string[];
  expectedComplexity: {
    time: string;
    space: string;
  };
}

export interface ProblemGenerationInput {
  difficulty: DifficultyLevel;
  category: ProblemCategory;
  company?: string;
  model?: "codellama" | "llama3";
}

/**
 * Generate a coding problem using CodeLlama 7B
 * CodeLlama is specifically trained for code-related tasks
 */
export async function generateCodingProblem(
  input: ProblemGenerationInput
): Promise<GeneratedProblem> {
  const prompt = PROBLEM_GENERATION_PROMPT
    .replace("{difficulty}", input.difficulty)
    .replace("{category}", input.category)
    .replace("{company}", input.company || "general tech company");

  const messages: OllamaMessage[] = [
    {
      role: "user",
      content: prompt,
    },
  ];

  let response;

  if (input.model === "llama3") {
    // Use generic Llama 3 model
    response = await ollamaChat({
      messages,
      temperature: 0.8,
      max_tokens: 2000,
    });
  } else {
    // Default to CodeLlama (coding interview mode)
    response = await codeLlamaChat({
      messages,
      temperature: 0.8,
      max_tokens: 2000,
    });
  }


  const content = response.message.content;

  // Parse the JSON response
  try {
    // Find JSON in the response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.title || !parsed.description) {
      throw new Error("Missing required fields in generated problem");
    }

    return {
      title: parsed.title,
      description: parsed.description,
      constraints: parsed.constraints || [],
      examples: parsed.examples || [],
      visibleTestCases: (parsed.visibleTestCases || []).map((tc: TestCase) => ({
        ...tc,
        isHidden: false,
      })),
      hiddenTestCases: (parsed.hiddenTestCases || []).map((tc: TestCase) => ({
        ...tc,
        isHidden: true,
      })),
      solutionApproaches: parsed.solutionApproaches || [],
      expectedComplexity: parsed.expectedComplexity || { time: "Unknown", space: "Unknown" },
    };
  } catch (error) {
    console.error("Failed to parse problem generation response:", error);
    console.error("Raw response:", content);
    throw new Error("Failed to generate problem. Please try again.");
  }
}

/**
 * Generate additional hidden test cases for a problem
 */
export async function generateHiddenTestCases(
  problemDescription: string,
  existingTestCases: TestCase[],
  count: number = 5
): Promise<TestCase[]> {
  const prompt = TEST_CASE_GENERATION_PROMPT
    .replace("{problemDescription}", problemDescription)
    .replace("{existingTestCases}", JSON.stringify(existingTestCases, null, 2))
    .replace("{count}", count.toString());

  const messages: OllamaMessage[] = [
    {
      role: "user",
      content: prompt,
    },
  ];

  // Use CodeLlama for test case generation
  const response = await codeLlamaChat({
    messages,
    temperature: 0.7,
    max_tokens: 1500,
  });

  const content = response.message.content;

  try {
    // Find JSON array in the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return parsed.map((tc: TestCase) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      explanation: tc.explanation,
      isHidden: true,
    }));
  } catch (error) {
    console.error("Failed to parse test case generation response:", error);
    // Return empty array on failure
    return [];
  }
}

/**
 * Format problem description for display
 */
export function formatProblemDescription(problem: GeneratedProblem): string {
  let description = `# ${problem.title}\n\n`;
  description += `${problem.description}\n\n`;

  if (problem.constraints.length > 0) {
    description += `## Constraints\n\n`;
    problem.constraints.forEach(c => {
      description += `- ${c}\n`;
    });
    description += "\n";
  }

  if (problem.examples.length > 0) {
    description += `## Examples\n\n`;
    problem.examples.forEach((ex, i) => {
      description += `### Example ${i + 1}\n`;
      description += `**Input:** ${ex.input}\n`;
      description += `**Output:** ${ex.output}\n`;
      if (ex.explanation) {
        description += `**Explanation:** ${ex.explanation}\n`;
      }
      description += "\n";
    });
  }

  return description;
}
