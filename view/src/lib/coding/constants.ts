// Coding Challenge Constants

export const SUPPORTED_LANGUAGES = {
  python: { name: "Python", extension: ".py", monacoId: "python" },
  javascript: { name: "JavaScript", extension: ".js", monacoId: "javascript" },
  java: { name: "Java", extension: ".java", monacoId: "java" },
  cpp: { name: "C++", extension: ".cpp", monacoId: "cpp" },
  c: { name: "C", extension: ".c", monacoId: "c" },
  csharp: { name: "C#", extension: ".cs", monacoId: "csharp" },
  go: { name: "Go", extension: ".go", monacoId: "go" },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export const PROBLEM_CATEGORIES = [
  "arrays",
  "strings",
  "linked-lists",
  "stacks-queues",
  "trees",
  "graphs",
  "dynamic-programming",
  "recursion",
  "sorting-searching",
  "hash-tables",
  "heaps",
  "bit-manipulation",
  "mixed",
] as const;

export type ProblemCategory = typeof PROBLEM_CATEGORIES[number];

export const CATEGORY_LABELS: Record<ProblemCategory, string> = {
  "arrays": "Arrays",
  "strings": "Strings",
  "linked-lists": "Linked Lists",
  "stacks-queues": "Stacks & Queues",
  "trees": "Trees",
  "graphs": "Graphs",
  "dynamic-programming": "Dynamic Programming",
  "recursion": "Recursion",
  "sorting-searching": "Sorting & Searching",
  "hash-tables": "Hash Tables",
  "heaps": "Heaps",
  "bit-manipulation": "Bit Manipulation",
  "mixed": "Mixed / Company Pattern",
};

export const COMPANIES = [
  "Google",
  "Meta",
  "Amazon",
  "Apple",
  "Microsoft",
  "Netflix",
  "Uber",
  "Airbnb",
  "Stripe",
  "Twitter",
  "LinkedIn",
  "Salesforce",
  "Adobe",
  "Oracle",
  "IBM",
  "Goldman Sachs",
  "JP Morgan",
  "Bloomberg",
] as const;

export type Company = typeof COMPANIES[number];

// Company interview patterns - most asked topics and typical difficulty distribution
export interface CompanyInterviewPattern {
  name: string;
  topTopics: ProblemCategory[];
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  description: string;
  interviewStyle: string;
}

export const COMPANY_PATTERNS: Record<Company, CompanyInterviewPattern> = {
  "Google": {
    name: "Google",
    topTopics: ["arrays", "strings", "trees", "graphs", "dynamic-programming"],
    difficultyDistribution: { easy: 0, medium: 2, hard: 1 },
    description: "Focus on algorithmic thinking and optimization",
    interviewStyle: "Emphasizes clean code, optimal solutions, and ability to handle follow-up questions",
  },
  "Meta": {
    name: "Meta",
    topTopics: ["arrays", "strings", "trees", "graphs", "hash-tables"],
    difficultyDistribution: { easy: 0, medium: 2, hard: 1 },
    description: "Fast-paced coding with emphasis on problem-solving speed",
    interviewStyle: "Values quick thinking, multiple solutions, and handling edge cases",
  },
  "Amazon": {
    name: "Amazon",
    topTopics: ["arrays", "trees", "graphs", "dynamic-programming", "hash-tables"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Leadership principles integrated with coding problems",
    interviewStyle: "Practical problems with real-world applications, emphasis on scalability",
  },
  "Apple": {
    name: "Apple",
    topTopics: ["arrays", "strings", "linked-lists", "trees", "sorting-searching"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Focus on fundamentals and system design thinking",
    interviewStyle: "Clean, maintainable code with attention to detail",
  },
  "Microsoft": {
    name: "Microsoft",
    topTopics: ["arrays", "strings", "trees", "linked-lists", "dynamic-programming"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Well-rounded assessment of CS fundamentals",
    interviewStyle: "Focus on problem decomposition and clear communication",
  },
  "Netflix": {
    name: "Netflix",
    topTopics: ["arrays", "hash-tables", "strings", "trees", "graphs"],
    difficultyDistribution: { easy: 0, medium: 2, hard: 1 },
    description: "High performance and distributed systems mindset",
    interviewStyle: "Focus on scalability, efficiency, and handling large data",
  },
  "Uber": {
    name: "Uber",
    topTopics: ["arrays", "graphs", "hash-tables", "heaps", "sorting-searching"],
    difficultyDistribution: { easy: 0, medium: 2, hard: 1 },
    description: "Real-time systems and geospatial problems",
    interviewStyle: "Practical problems related to ride-sharing, maps, and real-time data",
  },
  "Airbnb": {
    name: "Airbnb",
    topTopics: ["arrays", "strings", "hash-tables", "trees", "dynamic-programming"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Product-focused coding with real-world scenarios",
    interviewStyle: "Emphasis on code quality, testing, and product thinking",
  },
  "Stripe": {
    name: "Stripe",
    topTopics: ["strings", "arrays", "hash-tables", "recursion", "dynamic-programming"],
    difficultyDistribution: { easy: 0, medium: 2, hard: 1 },
    description: "Payment systems and API design focused",
    interviewStyle: "Clean code, error handling, and attention to edge cases in financial systems",
  },
  "Twitter": {
    name: "Twitter",
    topTopics: ["arrays", "strings", "hash-tables", "heaps", "graphs"],
    difficultyDistribution: { easy: 0, medium: 2, hard: 1 },
    description: "Social network and timeline algorithms",
    interviewStyle: "Focus on data structures for feeds, trending topics, and social graphs",
  },
  "LinkedIn": {
    name: "LinkedIn",
    topTopics: ["graphs", "hash-tables", "arrays", "trees", "strings"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Professional network and recommendation systems",
    interviewStyle: "Graph problems, connection algorithms, and search optimization",
  },
  "Salesforce": {
    name: "Salesforce",
    topTopics: ["arrays", "strings", "hash-tables", "trees", "sorting-searching"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Enterprise software and CRM focused",
    interviewStyle: "Practical problems with emphasis on clean, maintainable code",
  },
  "Adobe": {
    name: "Adobe",
    topTopics: ["arrays", "strings", "dynamic-programming", "trees", "recursion"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Creative software and media processing",
    interviewStyle: "Algorithm optimization and image/document processing scenarios",
  },
  "Oracle": {
    name: "Oracle",
    topTopics: ["arrays", "trees", "sorting-searching", "hash-tables", "strings"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Database and enterprise systems focus",
    interviewStyle: "SQL-related problems and classic data structure questions",
  },
  "IBM": {
    name: "IBM",
    topTopics: ["arrays", "strings", "sorting-searching", "trees", "hash-tables"],
    difficultyDistribution: { easy: 2, medium: 1, hard: 0 },
    description: "Enterprise solutions and AI/ML applications",
    interviewStyle: "Fundamental CS concepts with emphasis on problem-solving approach",
  },
  "Goldman Sachs": {
    name: "Goldman Sachs",
    topTopics: ["arrays", "strings", "dynamic-programming", "hash-tables", "sorting-searching"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Financial systems and quantitative problems",
    interviewStyle: "Math-heavy problems, optimization, and financial calculations",
  },
  "JP Morgan": {
    name: "JP Morgan",
    topTopics: ["arrays", "strings", "hash-tables", "sorting-searching", "trees"],
    difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
    description: "Banking systems and transaction processing",
    interviewStyle: "Practical problems with emphasis on accuracy and edge cases",
  },
  "Bloomberg": {
    name: "Bloomberg",
    topTopics: ["arrays", "strings", "hash-tables", "heaps", "sorting-searching"],
    difficultyDistribution: { easy: 0, medium: 2, hard: 1 },
    description: "Financial data and real-time systems",
    interviewStyle: "Data processing, streaming, and time-series problems",
  },
};

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const TIME_LIMITS: Record<DifficultyLevel, number> = {
  easy: 25,
  medium: 40,
  hard: 55,
};

export const SCORE_WEIGHTS = {
  correctness: 0.40,
  efficiency: 0.25,
  codeQuality: 0.20,
  edgeCases: 0.15,
} as const;

export const CHALLENGE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export type ChallengeStatus = typeof CHALLENGE_STATUS[keyof typeof CHALLENGE_STATUS];

// Test case structure
export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

// Example structure
export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

// Score result structure
export interface ScoreResult {
  correctness: number;
  efficiency: number;
  codeQuality: number;
  edgeCases: number;
  overallScore: number;
  passStatus: boolean;
  feedback: string;
  suggestedApproach?: string;
  complexityAnalysis?: string;
}

// Evaluation result structure
export interface EvaluationResult {
  testResults: {
    testCase: TestCase;
    passed: boolean;
    actualOutput?: string;
    analysis?: string;
  }[];
  isValid: boolean;
  errorMessage?: string;
  syntaxErrors?: string[];
  logicAnalysis?: string;
}
