-- AlterTable
ALTER TABLE "Interview" ADD COLUMN "phaseDurations" TEXT;
ALTER TABLE "Interview" ADD COLUMN "phaseTransitions" TEXT;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN "atsBreakdown" TEXT;
ALTER TABLE "Resume" ADD COLUMN "atsFeedback" TEXT;
ALTER TABLE "Resume" ADD COLUMN "atsScore" INTEGER;
ALTER TABLE "Resume" ADD COLUMN "filePath" TEXT;
ALTER TABLE "Resume" ADD COLUMN "keywords" TEXT;
ALTER TABLE "Resume" ADD COLUMN "predictedRoles" TEXT;
ALTER TABLE "Resume" ADD COLUMN "softSkills" TEXT;

-- CreateTable
CREATE TABLE "UserAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalInterviews" INTEGER NOT NULL DEFAULT 0,
    "completedInterviews" INTEGER NOT NULL DEFAULT 0,
    "avgOverallScore" REAL,
    "passRate" REAL,
    "weakDimensions" TEXT NOT NULL DEFAULT '[]',
    "strongDimensions" TEXT NOT NULL DEFAULT '[]',
    "topicStats" TEXT NOT NULL DEFAULT '{}',
    "scoreTrend" TEXT NOT NULL DEFAULT 'stable',
    "lastCalculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CodingProblem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "companies" TEXT NOT NULL DEFAULT '[]',
    "constraints" TEXT NOT NULL DEFAULT '[]',
    "examples" TEXT NOT NULL DEFAULT '[]',
    "testCases" TEXT NOT NULL DEFAULT '[]',
    "solutionApproaches" TEXT NOT NULL DEFAULT '[]',
    "starterCode" TEXT NOT NULL DEFAULT '{}',
    "timeLimit" INTEGER NOT NULL DEFAULT 45,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CodingChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "problemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "company" TEXT,
    "language" TEXT NOT NULL,
    "visibleTests" TEXT NOT NULL DEFAULT '[]',
    "hiddenTests" TEXT NOT NULL DEFAULT '[]',
    "timeLimit" INTEGER NOT NULL DEFAULT 45,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "starterCode" TEXT,
    "finalCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CodingChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CodingChallenge_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "CodingProblem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChallengeSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluation" TEXT,
    "testResults" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    CONSTRAINT "ChallengeSubmission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "CodingChallenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChallengeScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "correctness" REAL NOT NULL,
    "efficiency" REAL NOT NULL,
    "codeQuality" REAL NOT NULL,
    "edgeCases" REAL NOT NULL,
    "overallScore" REAL NOT NULL,
    "passStatus" BOOLEAN NOT NULL,
    "feedback" TEXT NOT NULL,
    "suggestedApproach" TEXT,
    "complexityAnalysis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChallengeScore_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "CodingChallenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAnalytics_userId_key" ON "UserAnalytics"("userId");

-- CreateIndex
CREATE INDEX "CodingProblem_difficulty_category_idx" ON "CodingProblem"("difficulty", "category");

-- CreateIndex
CREATE INDEX "CodingChallenge_userId_status_idx" ON "CodingChallenge"("userId", "status");

-- CreateIndex
CREATE INDEX "ChallengeSubmission_challengeId_idx" ON "ChallengeSubmission"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeScore_challengeId_key" ON "ChallengeScore"("challengeId");

-- CreateIndex
CREATE INDEX "Interview_userId_status_endedAt_idx" ON "Interview"("userId", "status", "endedAt");
