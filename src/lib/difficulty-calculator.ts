/**
 * Smart Difficulty Calculator
 *
 * Calculates the actual interview difficulty based on user profile,
 * skills, experience, target companies, and resume analysis.
 *
 * Weightages:
 * - Experience Level: 30%
 * - Skills Match: 25%
 * - Target Companies: 20%
 * - Resume Analysis: 15%
 * - Selected Difficulty: 10%
 */

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface UserProfileData {
  yearsExperience?: number | null;
  skills?: string[];
  targetCompanies?: string[];
  targetRole?: string | null;
  bio?: string | null;
}

export interface ResumeData {
  content?: string | null;
  atsScore?: number | null;
  keywords?: string[];
  predictedRoles?: string[];
  analysis?: {
    experienceLevel?: string;
    technicalDepth?: string;
    systemDesignExperience?: string;
  } | null;
}

export interface DifficultyInput {
  selectedDifficulty: DifficultyLevel;
  profile: UserProfileData | null;
  resume: ResumeData | null;
  topic: string;
}

export interface DifficultyResult {
  calculatedDifficulty: DifficultyLevel;
  confidenceScore: number;
  adjustmentReason: string;
  breakdown: {
    experienceScore: number;
    skillsScore: number;
    companiesScore: number;
    resumeScore: number;
    selectedScore: number;
    totalScore: number;
  };
  recommendations: string[];
}

// Weightages for each factor
const WEIGHTS = {
  experience: 0.30,
  skills: 0.25,
  companies: 0.20,
  resume: 0.15,
  selected: 0.10,
};

// FAANG and top-tier companies (require higher difficulty)
const TOP_TIER_COMPANIES = [
  "google", "meta", "facebook", "amazon", "apple", "microsoft", "netflix",
  "uber", "airbnb", "stripe", "coinbase", "linkedin", "twitter", "x",
  "openai", "anthropic", "databricks", "snowflake", "palantir", "nvidia",
  "tesla", "spacex", "bloomberg", "citadel", "two sigma", "jane street",
  "bytedance", "tiktok", "spotify", "dropbox", "slack", "salesforce"
];

// System design related skills
const SYSTEM_DESIGN_SKILLS = [
  "system design", "distributed systems", "microservices", "kubernetes", "docker",
  "aws", "gcp", "azure", "kafka", "redis", "elasticsearch", "mongodb",
  "postgresql", "mysql", "cassandra", "dynamodb", "graphql", "rest api",
  "load balancing", "caching", "sharding", "replication", "cap theorem",
  "event-driven", "message queues", "rabbitmq", "grpc", "websockets",
  "cdn", "api gateway", "service mesh", "istio", "terraform", "ci/cd",
  "scalability", "high availability", "fault tolerance", "database design"
];

/**
 * Calculate experience score (0-100)
 * 0-2 years: Beginner (20-40)
 * 3-5 years: Intermediate (40-60)
 * 6-10 years: Senior (60-80)
 * 10+ years: Expert (80-100)
 */
function calculateExperienceScore(yearsExperience?: number | null): number {
  if (!yearsExperience || yearsExperience <= 0) return 20;

  if (yearsExperience <= 2) {
    return 20 + (yearsExperience / 2) * 20; // 20-40
  } else if (yearsExperience <= 5) {
    return 40 + ((yearsExperience - 2) / 3) * 20; // 40-60
  } else if (yearsExperience <= 10) {
    return 60 + ((yearsExperience - 5) / 5) * 20; // 60-80
  } else {
    return Math.min(100, 80 + ((yearsExperience - 10) / 10) * 20); // 80-100
  }
}

/**
 * Calculate skills score based on system design relevant skills (0-100)
 */
function calculateSkillsScore(skills?: string[]): number {
  if (!skills || skills.length === 0) return 30;

  const normalizedSkills = skills.map(s => s.toLowerCase().trim());

  let matchCount = 0;
  let totalRelevance = 0;

  for (const skill of normalizedSkills) {
    for (const sdSkill of SYSTEM_DESIGN_SKILLS) {
      if (skill.includes(sdSkill) || sdSkill.includes(skill)) {
        matchCount++;
        // Some skills are more advanced
        if (["distributed systems", "cap theorem", "sharding", "service mesh", "event-driven"].some(s => skill.includes(s))) {
          totalRelevance += 15;
        } else if (["kubernetes", "kafka", "elasticsearch", "microservices"].some(s => skill.includes(s))) {
          totalRelevance += 12;
        } else {
          totalRelevance += 8;
        }
        break;
      }
    }
  }

  // Base score from match count
  const matchScore = Math.min(50, matchCount * 10);
  // Relevance bonus
  const relevanceScore = Math.min(50, totalRelevance);

  return Math.min(100, matchScore + relevanceScore);
}

/**
 * Calculate company tier score (0-100)
 * Top-tier companies expect higher difficulty
 */
function calculateCompaniesScore(targetCompanies?: string[]): number {
  if (!targetCompanies || targetCompanies.length === 0) return 50;

  const normalizedCompanies = targetCompanies.map(c => c.toLowerCase().trim());

  let topTierCount = 0;
  for (const company of normalizedCompanies) {
    if (TOP_TIER_COMPANIES.some(tc => company.includes(tc) || tc.includes(company))) {
      topTierCount++;
    }
  }

  const topTierRatio = topTierCount / targetCompanies.length;

  // If mostly top-tier companies, expect higher difficulty
  if (topTierRatio >= 0.7) return 85;
  if (topTierRatio >= 0.5) return 70;
  if (topTierRatio >= 0.3) return 55;
  if (topTierRatio > 0) return 45;

  return 40;
}

/**
 * Calculate resume score based on ATS analysis (0-100)
 */
function calculateResumeScore(resume?: ResumeData | null): number {
  if (!resume) return 50;

  let score = 50;

  // ATS score contribution
  if (resume.atsScore) {
    score = resume.atsScore * 0.5;
  }

  // Keywords analysis
  if (resume.keywords && resume.keywords.length > 0) {
    const normalizedKeywords = resume.keywords.map(k => k.toLowerCase());
    let relevantKeywords = 0;

    for (const keyword of normalizedKeywords) {
      if (SYSTEM_DESIGN_SKILLS.some(s => keyword.includes(s) || s.includes(keyword))) {
        relevantKeywords++;
      }
    }

    score += Math.min(30, relevantKeywords * 5);
  }

  // Experience level from analysis
  if (resume.analysis?.experienceLevel) {
    const level = resume.analysis.experienceLevel.toLowerCase();
    if (level.includes("senior") || level.includes("lead") || level.includes("principal")) {
      score += 20;
    } else if (level.includes("mid") || level.includes("intermediate")) {
      score += 10;
    }
  }

  return Math.min(100, score);
}

/**
 * Convert selected difficulty to score (0-100)
 */
function selectedDifficultyToScore(difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case "easy": return 33;
    case "medium": return 66;
    case "hard": return 100;
    default: return 50;
  }
}

/**
 * Convert total score to difficulty level
 */
function scoreToDifficulty(score: number): DifficultyLevel {
  if (score < 40) return "easy";
  if (score < 70) return "medium";
  return "hard";
}

/**
 * Generate adjustment reason based on the calculation
 */
function generateAdjustmentReason(
  selected: DifficultyLevel,
  calculated: DifficultyLevel,
  breakdown: DifficultyResult["breakdown"]
): string {
  if (selected === calculated) {
    return "Your selected difficulty matches your profile. No adjustment needed.";
  }

  const reasons: string[] = [];

  if (selected === "hard" && calculated !== "hard") {
    if (breakdown.experienceScore < 50) {
      reasons.push("your experience level suggests building more foundation first");
    }
    if (breakdown.skillsScore < 50) {
      reasons.push("developing more system design skills would help");
    }
    if (breakdown.resumeScore < 50) {
      reasons.push("your resume indicates room for technical growth");
    }
  } else if (selected === "easy" && calculated !== "easy") {
    if (breakdown.experienceScore > 60) {
      reasons.push("your experience qualifies you for more challenge");
    }
    if (breakdown.skillsScore > 60) {
      reasons.push("your skills indicate strong system design knowledge");
    }
    if (breakdown.companiesScore > 70) {
      reasons.push("your target companies have rigorous interviews");
    }
  }

  if (reasons.length === 0) {
    return `Adjusted from ${selected} to ${calculated} based on your overall profile analysis.`;
  }

  return `Adjusted from ${selected} to ${calculated} because ${reasons.join(" and ")}.`;
}

/**
 * Generate recommendations based on profile analysis
 */
function generateRecommendations(
  breakdown: DifficultyResult["breakdown"],
  profile: UserProfileData | null
): string[] {
  const recommendations: string[] = [];

  if (breakdown.experienceScore < 40) {
    recommendations.push("Focus on building practical experience with distributed systems");
  }

  if (breakdown.skillsScore < 50) {
    recommendations.push("Study core system design concepts: caching, sharding, load balancing");
    recommendations.push("Practice designing systems like URL shortener, rate limiter, chat app");
  }

  if (breakdown.companiesScore > 70 && breakdown.totalScore < 60) {
    recommendations.push("Your target companies have high bars - consider more preparation");
    recommendations.push("Review system design case studies from FAANG interviews");
  }

  if (breakdown.resumeScore < 50) {
    recommendations.push("Update your resume to highlight system design experience");
  }

  if (!profile?.skills || profile.skills.length < 3) {
    recommendations.push("Add more skills to your profile for better question personalization");
  }

  if (recommendations.length === 0) {
    recommendations.push("You're well-prepared! Focus on articulating your thoughts clearly");
  }

  return recommendations.slice(0, 4);
}

/**
 * Main function: Calculate smart difficulty
 */
export function calculateSmartDifficulty(input: DifficultyInput): DifficultyResult {
  const { selectedDifficulty, profile, resume } = input;

  // Calculate individual scores
  const experienceScore = calculateExperienceScore(profile?.yearsExperience);
  const skillsScore = calculateSkillsScore(profile?.skills);
  const companiesScore = calculateCompaniesScore(profile?.targetCompanies);
  const resumeScore = calculateResumeScore(resume);
  const selectedScore = selectedDifficultyToScore(selectedDifficulty);

  // Calculate weighted total
  const totalScore =
    experienceScore * WEIGHTS.experience +
    skillsScore * WEIGHTS.skills +
    companiesScore * WEIGHTS.companies +
    resumeScore * WEIGHTS.resume +
    selectedScore * WEIGHTS.selected;

  const breakdown = {
    experienceScore: Math.round(experienceScore),
    skillsScore: Math.round(skillsScore),
    companiesScore: Math.round(companiesScore),
    resumeScore: Math.round(resumeScore),
    selectedScore: Math.round(selectedScore),
    totalScore: Math.round(totalScore),
  };

  const calculatedDifficulty = scoreToDifficulty(totalScore);

  // Confidence score based on how much data we have
  let confidenceScore = 50;
  if (profile?.yearsExperience) confidenceScore += 15;
  if (profile?.skills && profile.skills.length > 0) confidenceScore += 15;
  if (profile?.targetCompanies && profile.targetCompanies.length > 0) confidenceScore += 10;
  if (resume?.atsScore) confidenceScore += 10;

  return {
    calculatedDifficulty,
    confidenceScore: Math.min(100, confidenceScore),
    adjustmentReason: generateAdjustmentReason(selectedDifficulty, calculatedDifficulty, breakdown),
    breakdown,
    recommendations: generateRecommendations(breakdown, profile),
  };
}

/**
 * Get difficulty description for prompts
 */
export function getDifficultyDescription(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case "easy":
      return "Entry-level: Focus on fundamental concepts, provide hints when stuck, allow more time for thinking, cover basic system design patterns.";
    case "medium":
      return "Mid-level: Balance guidance with challenge, expect knowledge of common patterns, probe on trade-offs, moderate depth on scalability.";
    case "hard":
      return "Senior-level: Minimal hints, expect precise technical answers, deep-dive on edge cases, challenge all design decisions, cover advanced patterns.";
    default:
      return "Standard difficulty level.";
  }
}
