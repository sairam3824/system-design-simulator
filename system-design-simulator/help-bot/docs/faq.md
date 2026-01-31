# Frequently Asked Questions (FAQ)

## General Questions

### What is the System Design Simulator?
The System Design Simulator is an AI-powered platform that helps software engineers practice system design interviews. It provides a realistic interview experience with an AI interviewer that evaluates your responses across multiple dimensions.

### Is this free to use?
The basic features are available for free when running locally. You need either Ollama (free, local) or an OpenAI API key (paid) for the AI features.

### How realistic are the interviews?
The interviews are modeled after real FAANG-style system design interviews. The AI interviewer follows the same structure, asks similar questions, and evaluates using industry-standard criteria.

### Can this replace real interview practice?
While it's excellent for solo practice, we recommend also practicing with real people. The simulator is best used alongside mock interviews with peers or mentors.

## Interview Questions

### How long is each interview?
A full interview is 45 minutes, divided into 5 phases:
- Requirements Clarification: 8 minutes
- High-Level Design: 12 minutes
- Deep Dive: 12 minutes
- Scalability: 10 minutes
- Wrap-Up: 3 minutes

### Can I pause an interview?
Currently, interviews cannot be paused. The timer continues running. Plan for uninterrupted 45-minute sessions.

### What topics are available?
Popular topics include:
- Design Twitter, Instagram, Facebook
- Design Uber, Google Maps
- Design Netflix, YouTube
- Design WhatsApp, Slack
- Design Amazon, Dropbox
- And many more

### How are questions generated?
Questions are dynamically generated based on:
- Your selected topic
- Difficulty level
- Your profile and experience
- Past performance
- Resume analysis

### Can I redo an interview on the same topic?
Yes! You can practice the same topic multiple times. Questions will vary, and you can track improvement over time.

## Scoring Questions

### How is scoring done?
The AI evaluates your responses across 6 dimensions:
1. Requirements Clarification
2. High-Level Design
3. Detailed Design
4. Scalability
5. Trade-offs
6. Communication

Each dimension is scored 1-4, and the overall score is the average.

### What's a passing score?
A score of 2.5 or higher out of 4.0 is considered passing. This corresponds to meeting expectations in a real interview.

### How accurate is the AI scoring?
The AI scoring is designed to match human interviewer standards. It's calibrated against real interview feedback patterns. While not perfect, it provides consistent and useful feedback.

### Can I see detailed feedback?
Yes! After each interview, you receive detailed feedback on each dimension, including specific suggestions for improvement.

## Technical Questions

### What LLM models are supported?
- **Ollama** (local): llama3, codellama, mistral, and others
- **OpenAI** (cloud): gpt-4o-mini as fallback

### Do I need Ollama installed?
You need either Ollama installed locally OR an OpenAI API key. Ollama is free but requires more system resources. OpenAI is faster but costs money.

### How do I install Ollama?
1. Visit ollama.ai
2. Download for your OS
3. Install and run `ollama serve`
4. Pull a model: `ollama pull llama3`

### What if Ollama is slow?
- Ensure you have enough RAM (8GB+ recommended)
- Close other applications
- Try a smaller model
- Consider using OpenAI as fallback

### Is my data stored securely?
Yes. All data is stored locally in SQLite by default. Your interviews, scores, and personal information are kept private on your machine.

## Account Questions

### Do I need an account?
Yes, you need to create an account to track your progress, save interviews, and access the leaderboard.

### Can I use social login?
Currently, only email/password authentication is supported. Social login may be added in future updates.

### How do I reset my password?
Go to the login page and click "Forgot Password" (if available), or contact support.

### Can I delete my account?
Yes. Go to Profile > Account > Delete Account. This permanently removes all your data.

## Feature Questions

### What's the leaderboard?
The leaderboard ranks all users by their average interview scores. You can filter by time period, topic, and difficulty to see how you compare.

### How do analytics work?
Analytics track your performance over time, showing:
- Score progression charts
- Skills radar chart
- Topic performance
- Insights and recommendations

### What's resume analysis for?
Uploading your resume helps:
- Get ATS compatibility score
- Personalize interview questions
- Recommend relevant topics
- Adjust difficulty appropriately

### Is there a mobile app?
Currently, the simulator is web-only. It works on mobile browsers but is optimized for desktop use.

## Practice Tips

### How often should I practice?
We recommend 2-3 interviews per week for consistent improvement. Quality practice is more important than quantity.

### Should I start with easy or hard?
Start with easy or medium difficulty to build confidence and understand the format. Increase difficulty as your scores improve.

### How do I improve my weak areas?
1. Check your analytics for weak dimensions
2. Read the recommendations
3. Focus practice on those areas
4. Review after each interview
5. Track progress over time

### What resources complement this tool?
- System design books (DDIA, Grokking)
- YouTube channels (System Design Interview)
- Practice with peers
- Real mock interviews
