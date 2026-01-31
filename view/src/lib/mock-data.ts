
export const MOCK_USER = {
    id: "user-1",
    name: "Sai Ram Maruri",
    email: "sairammaruri@gmail.com",
    avatar: "https://github.com/shadcn.png",
};

export const MOCK_PROFILE = {
    id: "profile-1",
    userId: "user-1",
    bio: "Senior Software Engineer with 5 years of experience in distributed systems.",
    experienceLevel: "Senior",
    skills: ["System Design", "React", "Node.js", "AWS", "Kubernetes"],
    targetCompanies: ["Google", "Meta", "Amazon", "Netflix"],
    yearsExperience: 5,
    targetRole: "Senior Engineer",
};

export const MOCK_INTERVIEWS = [
    {
        id: "interview-1",
        topic: "Design Twitter",
        status: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        score: {
            overallScore: 3.8,
            architectureScore: 4.0,
            scalabilityScore: 3.5,
            communicationScore: 4.0,
            tradeoffScore: 3.7,
            feedback: "Great job on the data model. Consider using redis for caching timeline.",
        },
    },
    {
        id: "interview-2",
        topic: "Design Uber",
        status: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        score: {
            overallScore: 3.2,
            architectureScore: 3.0,
            scalabilityScore: 3.5,
            communicationScore: 3.0,
            tradeoffScore: 3.3,
            feedback: "Good start, but missed some key geo-spatial indexing concepts.",
        },
    },
    {
        id: "interview-3",
        topic: "Design Netflix",
        status: "in_progress",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        score: null,
    },
];

export const MOCK_STATS = {
    totalInterviews: 12,
    completedInterviews: 8,
    avgScore: 3.5,
    recentInterviews: MOCK_INTERVIEWS,
};

export const MOCK_PERFORMANCE_METRICS = {
    overall: {
        totalInterviews: 12,
        completedInterviews: 8,
        avgScore: 3.5,
        passRate: 75,
        scoreTrend: "improving",
    },
    dimensions: {
        architecture: { avgScore: 3.8, trend: "improving", isWeak: false, isStrong: true, recentScores: [3.5, 4.0] },
        scalability: { avgScore: 3.6, trend: "stable", isWeak: false, isStrong: false, recentScores: [3.5, 3.6] },
        communication: { avgScore: 4.0, trend: "improving", isWeak: false, isStrong: true, recentScores: [3.8, 4.2] },
        tradeoffs: { avgScore: 3.2, trend: "stable", isWeak: true, isStrong: false, recentScores: [3.0, 3.4] },
    },
    recentScores: [
        { date: "2024-01-20", overallScore: 3.2, passStatus: true, topic: "Design Uber", interviewId: "interview-2" },
        { date: "2024-01-25", overallScore: 3.8, passStatus: true, topic: "Design Twitter", interviewId: "interview-1" },
    ],
    insights: [
        "Your architecture skills are top-notch.",
        "Communication has improved significantly in the last 3 interviews."
    ],
    recommendations: [
        "Focus on discussing tradeoffs more deeply.",
        "Practice capacity estimation for high-scale systems."
    ]
};

export const MOCK_RESUME = {
    fileName: "resume.pdf",
    parsedContent: {
        skills: ["React", "TypeScript", "Node.js", "System Design"],
        experience: [
            {
                company: "Tech Corp",
                role: "Senior Engineer",
                duration: "2020 - Present",
                description: "Led the migration to microservices architecture."
            }
        ],
        education: [
            {
                school: "University of Tech",
                degree: "B.S. Computer Science",
                year: "2018"
            }
        ]
    },
    analysis: {
        score: 85,
        strengths: ["Strong technical skills", "Good progression"],
        weaknesses: ["Add more metrics to achievements"],
        suggestions: ["Quantify impact in bullet points"]
    }
};
