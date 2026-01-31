// Code Evaluator using LLM (Ollama with OpenAI fallback)
// Uses coding model type for code understanding and analysis

import { complete, type LLMMessage } from "@/lib/llm";
import { CODE_EVALUATION_PROMPT } from "@/lib/prompts/coding";
import {
  TestCase,
  EvaluationResult,
  ScoreResult,
  SCORE_WEIGHTS,
  SupportedLanguage,
} from "./constants";

export interface EvaluationInput {
  code: string;
  language: SupportedLanguage;
  problemDescription: string;
  testCases: TestCase[];
}

export interface TestResult {
  testIndex: number;
  input: string;
  expectedOutput: string;
  predictedOutput: string;
  passed: boolean;
  analysis: string;
}

export interface RawEvaluationResult {
  testResults: TestResult[];
  syntaxValid: boolean;
  syntaxErrors: string[];
  logicAnalysis: string;
  correctness: number;
  efficiency: number;
  codeQuality: number;
  edgeCases: number;
  feedback: string;
  suggestedApproach?: string;
  complexityAnalysis?: {
    time: string;
    space: string;
    explanation: string;
  };
}

/**
 * Evaluate code using LLM (Ollama with OpenAI fallback)
 * Uses coding model type for accurate code understanding and analysis
 */
export async function evaluateCode(
  input: EvaluationInput
): Promise<RawEvaluationResult> {
  const prompt = CODE_EVALUATION_PROMPT
    .replace("{problemDescription}", input.problemDescription)
    .replace("{testCases}", JSON.stringify(input.testCases, null, 2))
    .replace(/{language}/g, input.language)
    .replace("{code}", input.code);

  const messages: LLMMessage[] = [
    {
      role: "user",
      content: prompt,
    },
  ];

  // Use coding model type for accurate code analysis and evaluation
  const response = await complete(
    {
      messages,
      temperature: 0.3, // Lower temperature for more consistent evaluation
      maxTokens: 3000,
    },
    "coding"
  );

  const content = response.content;

  try {
    // Find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in evaluation response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      testResults: parsed.testResults || [],
      syntaxValid: parsed.syntaxValid ?? true,
      syntaxErrors: parsed.syntaxErrors || [],
      logicAnalysis: parsed.logicAnalysis || "",
      correctness: Math.min(100, Math.max(0, parsed.correctness || 0)),
      efficiency: Math.min(100, Math.max(0, parsed.efficiency || 0)),
      codeQuality: Math.min(100, Math.max(0, parsed.codeQuality || 0)),
      edgeCases: Math.min(100, Math.max(0, parsed.edgeCases || 0)),
      feedback: parsed.feedback || "No feedback available.",
      suggestedApproach: parsed.suggestedApproach,
      complexityAnalysis: parsed.complexityAnalysis,
    };
  } catch (error) {
    console.error("Failed to parse evaluation response:", error);
    console.error("Raw response:", content);

    // Return a default evaluation on parse failure
    return {
      testResults: [],
      syntaxValid: false,
      syntaxErrors: ["Unable to evaluate code - please check syntax"],
      logicAnalysis: "Evaluation failed due to parsing error.",
      correctness: 0,
      efficiency: 0,
      codeQuality: 0,
      edgeCases: 0,
      feedback: "Unable to evaluate the code. Please ensure the code is syntactically correct and try again.",
      suggestedApproach: undefined,
      complexityAnalysis: undefined,
    };
  }
}

/**
 * Convert raw evaluation to EvaluationResult format
 */
export function toEvaluationResult(
  raw: RawEvaluationResult,
  testCases: TestCase[]
): EvaluationResult {
  return {
    testResults: testCases.map((tc, index) => {
      const result = raw.testResults.find(r => r.testIndex === index);
      return {
        testCase: tc,
        passed: result?.passed ?? false,
        actualOutput: result?.predictedOutput,
        analysis: result?.analysis,
      };
    }),
    isValid: raw.syntaxValid,
    errorMessage: raw.syntaxErrors.length > 0 ? raw.syntaxErrors.join("; ") : undefined,
    syntaxErrors: raw.syntaxErrors,
    logicAnalysis: raw.logicAnalysis,
  };
}

/**
 * Calculate final score from evaluation
 */
export function calculateScore(evaluation: RawEvaluationResult): ScoreResult {
  // Normalize scores from 0-100 to 0-1
  const correctnessNorm = evaluation.correctness / 100;
  const efficiencyNorm = evaluation.efficiency / 100;
  const codeQualityNorm = evaluation.codeQuality / 100;
  const edgeCasesNorm = evaluation.edgeCases / 100;

  // Calculate weighted overall score
  const overallScore =
    correctnessNorm * SCORE_WEIGHTS.correctness +
    efficiencyNorm * SCORE_WEIGHTS.efficiency +
    codeQualityNorm * SCORE_WEIGHTS.codeQuality +
    edgeCasesNorm * SCORE_WEIGHTS.edgeCases;

  // Pass if overall score >= 70% and correctness >= 60%
  const passStatus = overallScore >= 0.70 && correctnessNorm >= 0.60;

  return {
    correctness: evaluation.correctness,
    efficiency: evaluation.efficiency,
    codeQuality: evaluation.codeQuality,
    edgeCases: evaluation.edgeCases,
    overallScore: Math.round(overallScore * 100),
    passStatus,
    feedback: evaluation.feedback,
    suggestedApproach: evaluation.suggestedApproach,
    complexityAnalysis: evaluation.complexityAnalysis
      ? `Time: ${evaluation.complexityAnalysis.time}, Space: ${evaluation.complexityAnalysis.space}. ${evaluation.complexityAnalysis.explanation}`
      : undefined,
  };
}

/**
 * Quick syntax check (basic validation before full evaluation)
 */
export function quickSyntaxCheck(code: string, language: SupportedLanguage): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!code.trim()) {
    errors.push("Code is empty");
    return { valid: false, errors };
  }

  // Basic bracket matching
  const brackets: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  const stack: string[] = [];

  for (const char of code) {
    if (char in brackets) {
      stack.push(brackets[char]);
    } else if (Object.values(brackets).includes(char)) {
      if (stack.pop() !== char) {
        errors.push("Unmatched brackets detected");
        break;
      }
    }
  }

  if (stack.length > 0 && errors.length === 0) {
    errors.push("Unclosed brackets detected");
  }

  // Language-specific checks
  if (language === "python") {
    // Check for common Python syntax issues
    if (code.includes("def ") && !code.includes(":")) {
      errors.push("Missing colon after function definition");
    }
  } else if (language === "java" || language === "csharp" || language === "cpp" || language === "c") {
    // Check for missing semicolons (rough heuristic)
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line.length > 0 &&
        !line.endsWith("{") &&
        !line.endsWith("}") &&
        !line.endsWith(";") &&
        !line.endsWith(",") &&
        !line.startsWith("//") &&
        !line.startsWith("/*") &&
        !line.startsWith("*") &&
        !line.startsWith("#") &&
        !line.includes("if") &&
        !line.includes("for") &&
        !line.includes("while") &&
        !line.includes("else")
      ) {
        // This is a rough check, actual syntax validation is done by the AI
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
