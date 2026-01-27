# System Design Simulator

An AI-powered interview preparation platform that helps software engineers practice and master system design interviews, coding challenges, and technical interviews through realistic simulations.

## 🚀 Features

### 🎯 System Design Interview Simulator
- **Real-time AI Interviewer**: Practice system design interviews with an AI interviewer powered by OpenAI
- **Interactive Whiteboard**: Design and diagram your solutions in real-time
- **Comprehensive Evaluation**: Get detailed feedback on your system design approach, scalability considerations, and best practices
- **Industry-Standard Scenarios**: Practice with real-world problems from top tech companies

### 💻 Coding Challenge Platform
- **Monaco Editor Integration**: Professional code editor with syntax highlighting and IntelliSense
- **Multi-Language Support**: Write solutions in your preferred programming language
- **Test Case Evaluation**: Automatic validation with visible and hidden test cases
- **Edge Case Testing**: Comprehensive test coverage to ensure robust solutions
- **Detailed Feedback**: Get insights on time complexity, space complexity, and code quality

### 📊 Progress Tracking & Analytics
- **Interview History**: Review all your past interviews and coding challenges
- **Performance Metrics**: Track your improvement over time with detailed analytics
- **Scoring System**: Get scored on various dimensions including problem-solving, communication, and technical depth
- **Personalized Recommendations**: Receive AI-powered suggestions for areas of improvement

### 👤 User Profile Management
- **Skills Tracking**: Maintain your technical skill set and proficiency levels
- **Target Companies**: Set goals for your dream companies (Google, Amazon, Meta, Netflix, etc.)
- **Resume Management**: Upload and manage your resume
- **Secure Authentication**: Built with NextAuth.js for secure user management
- **Password Management**: Update your credentials securely

### 🎨 Modern User Experience
- **Dark Mode Support**: Easy on the eyes with theme switching
- **Responsive Design**: Seamless experience across all devices
- **Real-time Updates**: Instant feedback and interactive UI components
- **Intuitive Navigation**: Clean, organized dashboard for easy access to all features

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: 
  - Radix UI primitives for accessibility
  - Custom components with class-variance-authority
  - Lucide React for icons
- **Code Editor**: Monaco Editor (VS Code's editor)
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **Theme**: next-themes for dark mode support

### Backend
- **Runtime**: Node.js with Next.js API routes
- **Database**: Turso (libSQL) with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Password Hashing**: bcryptjs
- **AI Integration**: 
  - **Llama 3 (8B)** via Ollama - System design interviews and general chat
  - **CodeLlama (7B)** via Ollama - Coding challenge evaluation and generation
  - **OpenAI API** - Resume analysis and scoring (optional)
- **File Upload**: Custom resume upload system

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript
- **Database Management**: Prisma CLI
- **Containerization**: Docker support (docker-compose.yml included)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v20 or higher)
- **npm** or **yarn** or **pnpm** or **bun**
- **Git**
- **Ollama** - Local LLM runtime for AI interviews
  - Install from: https://ollama.ai
  - Required models:
    - `llama3` (8B) - For system design interviews
    - `codellama:7b` - For coding challenges
- **OpenAI API key** (optional - for resume analysis and scoring)
- **Turso database** (or compatible libSQL database)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/system-design-simulator.git
cd system-design-simulator
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your-turso-database-url"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# Ollama (Local LLM for interviews)
OLLAMA_BASE_URL="http://localhost:11434" 
OLLAMA_MODEL="llama3"
OLLAMA_CODE_MODEL="codellama:7b"

# OpenAI (Optional - for resume analysis and scoring)
OPENAI_API_KEY="your-openai-api-key"

# Optional: Additional configuration
NODE_ENV="development"
```

### 4. Install Ollama Models

Make sure Ollama is running and pull the required models:

```bash
# Start Ollama service (if not already running)
ollama serve

# In a new terminal, pull the required models
ollama pull llama3
ollama pull codellama:7b

# Verify models are installed
ollama list
```

### 5. Database Setup

Initialize and migrate the database:

```bash
npx prisma generate
npx prisma db push
```

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Project Structure

```
system-design-simulator/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard and main pages
│   │   ├── api/               # API routes
│   │   ├── coding/            # Coding challenge pages
│   │   └── interview/         # Interview simulation pages
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions and configurations
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
├── prompts/                   # AI prompts for interview simulation
├── public/                    # Static assets
└── uploads/                   # User uploaded files (resumes, etc.)
```

## 🤖 AI Models & Architecture

The platform uses a **hybrid AI approach** with local open-source models and cloud-based services:

### Local LLMs via Ollama

We primarily use **Ollama** for running local language models, providing:
- ✅ **Fast response times** - No API latency
- ✅ **Privacy** - All interview data stays on your machine
- ✅ **Cost-effective** - No per-token charges
- ✅ **Offline capability** - Works without internet

#### Llama 3 (8B) - System Design Interviews
- **Purpose**: System design interview simulation and general chat
- **Model**: Meta's Llama 3 with 8 billion parameters
- **Use cases**:
  - Conducting realistic system design interviews
  - Asking follow-up questions based on responses
  - Evaluating architectural decisions
  - Providing constructive feedback
- **Why Llama 3**: Excellent reasoning capabilities and conversational abilities

#### CodeLlama (7B) - Coding Challenges
- **Purpose**: Code generation, evaluation, and analysis
- **Model**: Meta's CodeLlama with 7 billion parameters
- **Use cases**:
  - Generating coding problems with test cases
  - Evaluating code submissions
  - Analyzing time & space complexity
  - Providing code feedback and suggestions
- **Why CodeLlama**: Specifically trained on code, superior for programming tasks

### OpenAI (Optional)
- **Purpose**: Resume analysis and advanced scoring
- **Use cases**:
  - Parsing and analyzing uploaded resumes
  - Detailed performance scoring
  - Advanced metrics calculation
- **Why optional**: The core interview functionality works entirely with local models

### Model Selection Logic

The application automatically selects the appropriate model:
```typescript
// System design interviews → Llama 3
// Coding challenges → CodeLlama
// Resume analysis → OpenAI (if available)
```

## 📚 Key Features Explained

### AI-Powered Interview Simulation
The platform uses carefully crafted prompts (stored in `/prompts`) to simulate realistic interview scenarios. The AI interviewer:
- Asks follow-up questions based on your responses
- Evaluates your system design thinking
- Provides constructive feedback
- Adapts difficulty based on your performance

### Code Execution & Testing
- Supports multiple programming languages
- Executes code in a secure environment
- Runs comprehensive test suites including edge cases
- Provides detailed error messages and debugging hints

### Progress Analytics
Track your journey with:
- Interview completion rates
- Average scores across different dimensions
- Improvement trends over time
- Personalized learning paths

## 🔒 Security

- Passwords are hashed using bcryptjs
- Authentication handled via NextAuth.js v5
- Environment variables for sensitive data
- Secure API routes with middleware protection

## 🐳 Docker Support

Run the application using Docker:

```bash
docker-compose up
```

## 🧪 Development

### Running Linter

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [Meta Llama 3](https://llama.meta.com/) - Open-source 8B language model for system design interviews
- [CodeLlama](https://github.com/facebookresearch/codellama) - Specialized 7B model for code generation and analysis
- [OpenAI](https://openai.com/) - AI capabilities for resume analysis
- [Prisma](https://www.prisma.io/) - Database ORM
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Turso](https://turso.tech/) - Edge database

## 📞 Support

For support, questions, or feedback, please open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Support for more programming languages
- [ ] Additional Ollama model support (Mistral, Phi, DeepSeek)
- [ ] Behavioral interview simulation
- [ ] Mock interview scheduling with peers
- [ ] Video recording of interview sessions
- [ ] Cloud AI model integration (Anthropic Claude, Google Gemini) as fallback
- [ ] Mobile app development
- [ ] Community features (discussion forums, study groups)
- [ ] Company-specific interview prep tracks

---

**Made with ❤️ for interview preparation**
