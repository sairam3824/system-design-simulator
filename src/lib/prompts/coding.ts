// LLM Prompts for Coding Challenges

export const PROBLEM_GENERATION_PROMPT = `You are an expert DSA problem designer for technical interviews at top tech companies.

Generate a coding problem based on the following specifications:
- Difficulty: {difficulty}
- Category: {category}
- Company Style: {company} (if provided, match their interview style)

Your response MUST be a valid JSON object with this exact structure:
{
  "title": "Problem Title",
  "description": "Detailed problem description explaining what needs to be solved. Include the goal, any important definitions, and what the function should return.",
  "constraints": [
    "1 <= n <= 10^5",
    "Array contains integers from -10^9 to 10^9",
    "etc."
  ],
  "examples": [
    {
      "input": "nums = [1, 2, 3], target = 4",
      "output": "[0, 2]",
      "explanation": "Because nums[0] + nums[2] = 1 + 3 = 4"
    }
  ],
  "visibleTestCases": [
    {
      "input": "[1, 2, 3]\\n4",
      "expectedOutput": "[0, 2]",
      "explanation": "Basic case"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "[1, 1, 1]\\n2",
      "expectedOutput": "[0, 1]",
      "explanation": "Duplicate values"
    }
  ],
  "solutionApproaches": [
    "Brute Force: O(n^2) time, O(1) space - Check all pairs",
    "Hash Map: O(n) time, O(n) space - Store complements"
  ],
  "expectedComplexity": {
    "time": "O(n)",
    "space": "O(n)"
  }
}

Requirements:
1. Create a realistic interview problem appropriate for the difficulty level
2. Include 2-3 visible test cases that demonstrate the problem
3. Include 3-5 hidden test cases covering edge cases (empty input, single element, large values, etc.)
4. Provide clear constraints
5. The problem should be solvable in 30-60 minutes depending on difficulty
6. For easy: fundamental data structure operations
7. For medium: combination of techniques, optimization needed
8. For hard: complex algorithms, multiple steps, non-obvious solutions

Return ONLY the JSON object, no additional text.`;

export const CODE_EVALUATION_PROMPT = `You are an expert code reviewer and algorithm analyzer. Your task is to evaluate a candidate's code solution WITHOUT executing it.

Problem:
{problemDescription}

Test Cases:
{testCases}

Candidate's Code ({language}):
\`\`\`{language}
{code}
\`\`\`

Analyze the code and provide your evaluation as a JSON object:
{
  "testResults": [
    {
      "testIndex": 0,
      "input": "test input",
      "expectedOutput": "expected",
      "predictedOutput": "what the code would output",
      "passed": true/false,
      "analysis": "Brief explanation of why it passes or fails"
    }
  ],
  "syntaxValid": true/false,
  "syntaxErrors": ["list any syntax errors found"],
  "logicAnalysis": "Detailed analysis of the algorithm's logic and correctness",
  "correctness": 0-100,
  "efficiency": 0-100,
  "codeQuality": 0-100,
  "edgeCases": 0-100,
  "feedback": "Detailed constructive feedback about the solution",
  "suggestedApproach": "If the solution is suboptimal, describe a better approach",
  "complexityAnalysis": {
    "time": "O(n^2)",
    "space": "O(1)",
    "explanation": "Loop within a loop for each element..."
  }
}

Scoring Guidelines:

CORRECTNESS (0-100):
- 100: All test cases pass with correct logic
- 80-99: Minor issues, most cases pass
- 50-79: Some test cases fail, partial logic
- 20-49: Significant logic errors
- 0-19: Fundamentally incorrect approach

EFFICIENCY (0-100):
- 100: Optimal time and space complexity
- 80-99: Near-optimal, minor improvements possible
- 50-79: Acceptable but not optimal
- 20-49: Inefficient solution
- 0-19: Very poor complexity (exponential when polynomial exists)

CODE QUALITY (0-100):
- Clean, readable code with good variable names
- Proper indentation and structure
- No code duplication
- Appropriate use of language features
- Comments where needed (but not excessive)

EDGE CASES (0-100):
- Handles empty/null inputs
- Handles single elements
- Handles boundary values
- Handles duplicate values
- Handles negative numbers (if applicable)

Return ONLY the JSON object, no additional text.

CRITICAL EVALUATION RULES:
1. If the code is just a function definition with 'pass', 'return', 'return null', or an empty body: SCORE 0 for Correctness, Efficiency, and Edge Cases.
2. If the code is a placeholder (e.g. "// TODO", "# Write code here"): SCORE 0.
3. You must verify if the code actually implements an algorithm to solve the problem. If it hardcodes return values for test cases without a general logic, SCORE 0.
4. If the code contains only the starter template: SCORE 0.`;

export const TEST_CASE_GENERATION_PROMPT = `You are an expert test engineer. Generate additional test cases for the following coding problem.

Problem:
{problemDescription}

Existing Test Cases:
{existingTestCases}

Generate {count} additional test cases that cover edge cases and scenarios not yet tested.

Your response MUST be a valid JSON array:
[
  {
    "input": "test input formatted for the problem",
    "expectedOutput": "expected output",
    "explanation": "What this test case is checking",
    "isHidden": true
  }
]

Focus on:
1. Empty inputs
2. Single element inputs
3. Maximum constraint values
4. Minimum constraint values
5. Negative numbers (if applicable)
6. Duplicate values
7. All same values
8. Sorted input (ascending and descending)
9. Random order
10. Boundary conditions

Return ONLY the JSON array, no additional text.`;

export const STARTER_CODE_GENERATION_PROMPT = `Generate starter code templates for the following problem in {language}:

Problem: {title}
Description: {description}

The starter code should:
1. Include the main function signature with appropriate parameters and return type
2. Include helpful comments about input/output format
3. Be ready for the candidate to implement the solution
4. Use idiomatic {language} conventions

Return ONLY the code, no explanations.`;
