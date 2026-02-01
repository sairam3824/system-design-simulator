# System Design Simulator

> An AI-powered platform for mastering system design interviews, coding challenges, and resume optimization -- all running locally on your machine.

**Live Demo:** [systemdesign.saiii.in](https://systemdesign.saiii.in)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_LLMs-white)](https://ollama.ai/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://www.prisma.io/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Microservices](#microservices)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [AI Models & Strategy](#ai-models--strategy)
- [Scoring & Evaluation](#scoring--evaluation)
- [Docker Support](#docker-support)
- [Development](#development)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

System Design Simulator is a full-stack interview preparation platform that combines local LLMs, NLP-based resume analysis, and a RAG-powered help assistant to give software engineers a realistic, private, and cost-free way to prepare for FAANG-level technical interviews.

**What sets it apart:**

- **Privacy-first** -- interviews run entirely on local LLMs via Ollama; your data never leaves your machine.
- **Hybrid AI** -- automatically falls back from Ollama to OpenAI when local models are unavailable.
- **FAANG-grade scoring** -- evaluates across the same 6 dimensions used by top tech companies.
- **Three integrated services** -- a Next.js app, a Python RAG help bot, and a Python resume analyzer work together as a cohesive platform.

---

## Architecture

```
                         +---------------------------+
                         |        Browser Client      |
                         |   (Next.js / React 19 UI)  |
                         +-------------+-------------+
                                       |
                         +-------------v-------------+
                         |     Next.js API Routes     |
                         |   (Auth, Interview, Code,  |
                         |   Analytics, Resume, etc.)  |
                         +--+----------+----------+--+
                            |          |          |
               +------------v--+  +----v----+  +--v--------------+
               |   Ollama       |  | SQLite  |  |  Python         |
               |   (Local LLMs) |  | (Prisma)|  |  Microservices  |
               |                |  |         |  |                 |
               | - Llama 3 (8B) |  | dev.db  |  | - Help Bot      |
               | - CodeLlama 7B |  |         |  |   (RAG/FAISS)   |
               +----------------+  +---------+  | - Resume Matcher |
                                                 |   (spaCy/NLP)   |
                                                 +-----------------+
```

---

## Features

### System Design Interview Simulator

Conduct full-length, interactive system design interviews with an AI interviewer named **Bobby**.

| Phase | Duration | Focus |
|-------|----------|-------|
| Requirements Clarification | 8 min | Scope, constraints, functional vs non-functional |
| High-Level Design | 12 min | Components, data flow, API design |
| Deep Dive | 12 min | Database schema, caching, specific components |
| Scalability & Trade-offs | 10 min | Bottlenecks, CAP theorem, horizontal scaling |
| Wrap-up | 3 min | Summary, questions, final thoughts |

- Difficulty levels: Easy, Medium, Hard
- Adaptive interviewer personality
- Follow-up context tracking across phases
- Real-time phase transitions with time management
- Post-interview scoring across 6 FAANG dimensions (1--4 scale)
- Interview replay for review

### Coding Challenge Platform

- **Monaco Editor** (VS Code's editor) with syntax highlighting and IntelliSense
- **7 languages**: Python, JavaScript, Java, C++, C, C#, Go
- **Dynamic problem generation** via CodeLlama or a pre-built problem bank
- **18 company-specific tracks**: Google, Meta, Amazon, Apple, Microsoft, Netflix, and more
- **Categories**: Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, Recursion, Sorting, Searching, and more
- Visible + hidden test cases with detailed error output
- Time limits by difficulty (Easy: 25 min, Medium: 40 min, Hard: 55 min)
- Timed coding tests with multiple problems

### Resume Analysis & ATS Scoring

Upload a PDF resume and get:

- **ATS score** (0--100) broken down across 5 categories:
  - Contact Information (20 pts)
  - Structure & Sections (20 pts)
  - Content & Length (20 pts)
  - Keywords & Action Verbs (20 pts)
  - Quantifiable Impact (20 pts)
- Profile extraction (name, email, phone, location)
- Technical and soft skills identification
- Missing skills recommendations
- Predicted job roles
- Professional summary critique (when OpenAI is available)

### Performance Analytics

- Dashboard with real-time performance metrics
- Score progression charts (Recharts)
- Topic-wise performance breakdown
- Dimension-level strength/weakness identification
- Trend analysis: improving, stable, or declining
- Personalized recommendations based on weak areas

### Leaderboard

- Global rankings by interview scores
- User comparison and competitive motivation

### RAG Help Assistant

- In-app help bot powered by Retrieval-Augmented Generation
- Searches 9 documentation topics (getting started, interviews, coding, resume, analytics, troubleshooting, FAQs, and more)
- FAISS vector store with sentence-transformer embeddings
- Rate-limited API (10 queries/min, 20 searches/min per IP)

### User & Profile Management

- Secure registration and login (NextAuth.js v5 + bcryptjs)
- Profile: bio, skills, target companies, target role, years of experience
- Password change functionality
- Dark mode support (next-themes)

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 16 | Framework (App Router) |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling |
| Radix UI | Accessible UI primitives |
| Monaco Editor | Code editor |
| Zustand | State management |
| React Hook Form + Zod | Form handling & validation |
| Recharts | Data visualization |
| Lucide React | Icons |
| Sonner | Toast notifications |
| next-themes | Dark mode |

### Backend

| Technology | Purpose |
|---|---|
| Next.js API Routes | REST API |
| Prisma 7 | ORM & database toolkit |
| SQLite (libSQL/Turso) | Database |
| NextAuth.js v5 | Authentication |
| bcryptjs | Password hashing |
| Upstash Redis | Optional caching layer |

### AI / ML

| Model | Runtime | Purpose |
|---|---|---|
| Llama 3 (8B) | Ollama | System design interviews, general chat |
| CodeLlama (7B) | Ollama | Code generation, evaluation, analysis |
| Mistral | Ollama | Help bot RAG responses |
| gpt-4o-mini | OpenAI API | Resume analysis fallback |
| all-MiniLM-L6-v2 | sentence-transformers | Document embeddings for help bot |
| en_core_web_sm | spaCy | Resume NLP processing |
| FAISS | faiss-cpu | Vector similarity search |
| scikit-learn | Python | Keyword extraction |
| LangChain | Python | RAG orchestration |

### DevOps

| Tool | Purpose |
|---|---|
| Docker & docker-compose | Containerization |
| ESLint | Linting |
| Prisma CLI | Database migrations |
| Git | Version control |

---

## Prerequisites

| Requirement | Version | Required |
|---|---|---|
| Node.js | v20+ | Yes |
| npm | latest | Yes |
| Python | 3.11+ | For microservices |
| Ollama | latest | Yes |
| Git | latest | Yes |
| OpenAI API key | -- | Optional |
| Docker | latest | Optional |

**Ollama models to pull:**

```bash
ollama pull llama3
ollama pull codellama:7b
ollama pull mistral     # for help bot
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/system-design-simulator.git
cd system-design-simulator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the project root:

```env
# Database (SQLite file path)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# Ollama (local LLMs)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"
OLLAMA_CODE_MODEL="codellama:7b"

# OpenAI (optional -- enables resume AI analysis)
OPENAI_API_KEY="sk-..."

# Help Bot (optional -- for RAG assistant)
HELP_BOT_URL="http://localhost:8001"

# Redis (optional -- for caching)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### 4. Start Ollama and pull models

```bash
# Start the Ollama service
ollama serve

# In another terminal, pull required models
ollama pull llama3
ollama pull codellama:7b

# Verify
ollama list
```

### 5. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 6. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### 7. (Optional) Start microservices

```bash
# Help Bot -- RAG assistant
cd help-bot
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001

# Resume Matcher -- ATS scoring
cd resume-matcher
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Microservices

### Help Bot (`/help-bot`)

A FastAPI service that provides contextual help using Retrieval-Augmented Generation.

| Endpoint | Method | Rate Limit | Description |
|---|---|---|---|
| `/query` | POST | 10/min per IP | Ask a question; gets RAG-powered answer |
| `/search` | POST | 20/min per IP | Semantic search across docs |
| `/rebuild-index` | POST | 1/hour per IP | Rebuild the FAISS vector index |
| `/health` | GET | -- | Service health check |

**Stack:** FastAPI, LangChain, FAISS, sentence-transformers (all-MiniLM-L6-v2), Mistral via Ollama

**Documentation corpus:** 9 markdown files covering getting started, interview structure, coding challenges, resume features, profile management, analytics, troubleshooting, and FAQs.

### Resume Matcher (`/resume-matcher`)

A FastAPI service that extracts and analyzes resume PDFs.

**Stack:** FastAPI, pdfminer.six, spaCy (en_core_web_sm), scikit-learn, OpenAI (optional)

**Capabilities:**
- PDF text extraction
- Profile information parsing (name, email, phone, location)
- Rule-based ATS scoring (always available)
- AI-enhanced analysis with skill extraction and role prediction (requires OpenAI)

**Docker:**

```bash
docker-compose up resume-matcher
```

---

## Project Structure

```
system-design-simulator/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Login & registration pages
│   │   ├── (dashboard)/            # Dashboard, analytics, leaderboard
│   │   ├── api/                    # 30+ API route handlers
│   │   │   ├── analytics/          # Performance, progression, topics, time
│   │   │   ├── auth/               # NextAuth + registration
│   │   │   ├── coding/             # Challenges, submissions, tests, problems
│   │   │   ├── help-bot/           # Proxy to help bot service
│   │   │   ├── interview/          # Chat, phase analysis, end, replay
│   │   │   ├── leaderboard/        # Global rankings
│   │   │   ├── ollama/             # LLM health status
│   │   │   ├── profile/            # Profile CRUD, password change
│   │   │   └── resume/             # Upload, list, analyze
│   │   ├── coding/                 # Coding challenge pages
│   │   ├── interview/              # Interview simulation pages
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Landing page
│   ├── components/                 # React components (~41 files)
│   │   ├── analytics/              # Charts, metrics, dashboards
│   │   ├── coding/                 # Editor, problem display, submissions
│   │   ├── help-bot/               # Help chat widget
│   │   ├── interview/              # Chat interface, phase tracker
│   │   ├── layout/                 # Navbar, sidebar, footer
│   │   ├── leaderboard/            # Rankings table
│   │   ├── profile/                # Profile form, avatar
│   │   ├── resume/                 # Upload, card, analysis display
│   │   └── ui/                     # Shared primitives (button, dialog, etc.)
│   ├── lib/                        # Utilities & configs (~29 files)
│   │   ├── analytics/              # Score calculations, trend analysis
│   │   ├── coding/                 # Problem generator, code evaluator
│   │   ├── prompts/                # Interview prompt engineering
│   │   ├── auth.ts                 # NextAuth configuration
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── ollama.ts               # Ollama API client
│   │   └── utils.ts                # Shared helpers
│   ├── types/                      # TypeScript type definitions
│   └── generated/prisma/           # Auto-generated Prisma client
├── prisma/
│   └── schema.prisma               # Database schema (11 models)
├── prompts/                        # 14 AI system prompts (markdown)
├── help-bot/                       # RAG help assistant (Python/FastAPI)
├── resume-matcher/                 # Resume analysis (Python/FastAPI)
├── uploads/                        # User-uploaded resume files
├── public/                         # Static assets
├── docker-compose.yml              # Docker config for microservices
├── package.json                    # Node.js dependencies
└── tsconfig.json                   # TypeScript configuration
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new account |
| * | `/api/auth/[...nextauth]` | NextAuth.js session routes |

### Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview` | Start a new interview |
| GET | `/api/interview` | List user's interviews |
| POST | `/api/interview/[id]/chat` | Send a message to the AI interviewer |
| POST | `/api/interview/[id]/analyze-phase` | Evaluate current phase performance |
| POST | `/api/interview/[id]/end` | End interview and calculate final score |
| GET | `/api/interview/[id]/replay` | Retrieve interview transcript |
| POST | `/api/interview/personalized` | Generate a personalized interview |

### Coding Challenges

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/coding/challenge` | Create a new challenge |
| GET | `/api/coding/challenge` | List challenges |
| GET | `/api/coding/challenge/[id]` | Get challenge details |
| POST | `/api/coding/challenge/[id]/submit` | Submit code for evaluation |
| POST | `/api/coding/challenge/[id]/complete` | Mark challenge as complete |
| POST | `/api/coding/generate-preview` | Preview a generated problem |
| GET | `/api/coding/problems` | List problem bank |
| GET | `/api/coding/company-recommendations` | Company-specific problems |
| POST | `/api/coding/test` | Create a timed test |
| GET | `/api/coding/test/[id]` | Get test details |
| GET | `/api/coding/analytics` | Coding performance stats |

### Resume

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload a PDF resume |
| GET | `/api/resume` | List uploaded resumes |
| GET | `/api/resume/[id]` | Get resume details |
| POST | `/api/resume/[id]/analyze` | Trigger ATS analysis |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| PUT | `/api/profile/password` | Change password |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/performance` | Overall performance metrics |
| GET | `/api/analytics/performance/progression` | Score trends over time |
| GET | `/api/analytics/topics` | Per-topic performance |
| GET | `/api/analytics/time` | Time-based analytics |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ollama/status` | Check Ollama availability |
| GET | `/api/leaderboard` | Global leaderboard |
| POST | `/api/help-bot` | Proxy to help bot RAG service |

---

## Database Schema

The application uses **SQLite** via Prisma with **11 models**:

```
User
 ├── Profile              (1:1)  Bio, skills, target companies, experience
 ├── Resume[]             (1:N)  Uploaded PDFs with ATS analysis
 ├── Interview[]          (1:N)  System design interview sessions
 │    ├── Message[]        (1:N)  Conversation history
 │    └── Score            (1:1)  6-dimension evaluation
 ├── UserAnalytics        (1:1)  Cached performance aggregates
 ├── CodingChallenge[]    (1:N)  Individual coding sessions
 │    ├── ChallengeSubmission[]  (1:N)  Code submissions
 │    └── ChallengeScore  (1:1)  4-dimension evaluation
 └── CodingTest[]         (1:N)  Timed multi-problem tests
      └── CodingChallenge[]     (1:N)  Challenges within a test

CodingProblem             (standalone)  Pre-built problem bank
```

---

## AI Models & Strategy

### Local-first with Ollama

All core interview and coding features run on **local LLMs** via Ollama, providing:

- **Zero cost** -- no per-token API charges
- **Full privacy** -- data never leaves your machine
- **Offline capable** -- works without internet after initial model download
- **Low latency** -- no network round-trips

### Model routing

| Use Case | Primary Model | Fallback |
|----------|---------------|----------|
| System design interviews | Llama 3 (8B) via Ollama | OpenAI gpt-4o-mini |
| Coding problem generation | CodeLlama (7B) via Ollama | OpenAI gpt-4o-mini |
| Code evaluation & analysis | CodeLlama (7B) via Ollama | OpenAI gpt-4o-mini |
| Resume ATS analysis | Rule-based (always) | + OpenAI for AI insights |
| Help bot (RAG) | Mistral via Ollama | -- |
| Document embeddings | all-MiniLM-L6-v2 | -- |

### Prompt engineering

14 curated system prompts (in `/prompts/`) define the AI interviewer's behavior, covering personality, phase structure, evaluation criteria, and difficulty-specific guidance.

---

## Scoring & Evaluation

### System Design Interviews

Scored across **6 industry-standard FAANG dimensions** on a 1--4 scale:

| Dimension | What it measures |
|-----------|-----------------|
| Requirements Clarification | Asking the right questions, defining scope |
| High-Level Design | Component architecture, data flow |
| Detailed Design | Database schema, API design, specific components |
| Scalability | Handling growth, bottleneck identification |
| Trade-offs | Evaluating alternatives, justifying decisions |
| Communication | Clarity, structure, collaboration |

**Pass threshold:** weighted average across all dimensions.

### Coding Challenges

Scored across **4 dimensions** with weighted contribution:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Correctness | 40% | Passing visible + hidden test cases |
| Efficiency | 25% | Time and space complexity |
| Code Quality | 20% | Readability, naming, structure |
| Edge Cases | 15% | Handling boundary conditions |

---

## Docker Support

The resume matcher service is containerized:

```bash
# Start the resume matcher
docker-compose up

# Or build and run manually
cd resume-matcher
docker build -t resume-matcher .
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-... resume-matcher
```

---

## Development

### Available scripts

```bash
npm run dev       # Start development server (hot reload)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Database commands

```bash
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema changes to database
npx prisma studio      # Open database GUI
```

### Adding new interview topics

1. Add the topic to the interview creation flow in `/src/app/api/interview/route.ts`
2. Optionally add topic-specific prompts in `/prompts/`

### Adding new coding problem categories

1. Create problems in `/src/app/api/coding/problems/route.ts`
2. Update category lists in `/src/lib/coding/problem-generator.ts`

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Roadmap

- [ ] Additional Ollama model support (Mistral, Phi, DeepSeek, Qwen)
- [ ] Behavioral interview simulation
- [ ] Mock interview scheduling with peers
- [ ] Video/audio recording of interview sessions
- [ ] Cloud AI fallback (Anthropic Claude, Google Gemini)
- [ ] Mobile-responsive improvements
- [ ] Community features (discussion forums, study groups)
- [ ] Company-specific interview prep tracks
- [ ] Export interview transcripts as PDF
- [ ] Collaborative whiteboard for system design diagrams

---

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) -- React framework
- [Ollama](https://ollama.ai/) -- Local LLM runtime
- [Meta Llama 3](https://llama.meta.com/) -- 8B language model for interviews
- [CodeLlama](https://github.com/facebookresearch/codellama) -- 7B model for code tasks
- [OpenAI](https://openai.com/) -- Resume analysis capabilities
- [Prisma](https://www.prisma.io/) -- Database ORM
- [Radix UI](https://www.radix-ui.com/) -- Accessible UI primitives
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) -- VS Code's code editor
- [LangChain](https://www.langchain.com/) -- RAG orchestration
- [FAISS](https://github.com/facebookresearch/faiss) -- Vector similarity search
- [spaCy](https://spacy.io/) -- NLP processing
- [Recharts](https://recharts.org/) -- Charting library
