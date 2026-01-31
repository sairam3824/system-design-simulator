# System Design Interviews

## Interview Structure

Each system design interview follows a structured format similar to real FAANG interviews:

### Phase 1: Requirements Clarification (8 minutes)
- Understand the scope and scale of the system
- Ask about Daily Active Users (DAU), Queries Per Second (QPS)
- Clarify functional requirements (what the system should do)
- Clarify non-functional requirements (latency, availability, consistency)
- Identify priorities and constraints

### Phase 2: High-Level Design (12 minutes)
- Draw the overall system architecture
- Identify main components and their responsibilities
- Design API endpoints
- Discuss data flow between components
- Choose appropriate databases (SQL vs NoSQL)

### Phase 3: Deep Dive (12 minutes)
- Detail specific component implementations
- Design data models and schemas
- Discuss algorithms and protocols
- Address failure scenarios
- Handle edge cases

### Phase 4: Scalability (10 minutes)
- Scale the system 10x-100x
- Implement caching strategies
- Design sharding approaches
- Add load balancing
- Optimize for performance

### Phase 5: Wrap-Up (3 minutes)
- Summarize the design
- Address any remaining concerns
- Answer candidate questions

## Difficulty Levels

### Easy
- Simpler systems with fewer components
- More guidance from the interviewer
- Focus on basic concepts
- Suitable for beginners

### Medium
- Standard complexity similar to typical interviews
- Balanced guidance
- Requires understanding of common patterns
- Good for intermediate practice

### Hard
- Complex systems with multiple components
- Minimal guidance from interviewer
- Advanced scalability requirements
- Prepares for senior-level interviews

## Scoring Dimensions

Your performance is evaluated across 6 dimensions:

1. **Requirements Clarification (1-4)**
   - Asking the right questions
   - Understanding scale and constraints
   - Identifying key requirements

2. **High-Level Design (1-4)**
   - System architecture quality
   - Component identification
   - API design

3. **Detailed Design (1-4)**
   - Data model design
   - Algorithm choices
   - Implementation details

4. **Scalability (1-4)**
   - Scaling strategies
   - Performance optimization
   - Handling growth

5. **Trade-offs (1-4)**
   - Understanding CAP theorem
   - Cost vs performance decisions
   - Consistency vs availability

6. **Communication (1-4)**
   - Clear explanations
   - Structured thinking
   - Professional interaction

## Pass/Fail Criteria

- **Pass**: Overall score >= 2.5 out of 4.0
- Each dimension contributes equally to the final score
- Getting 3.0+ indicates strong performance
- Getting 4.0 indicates exceptional performance

## Tips for Success

1. **Always clarify requirements first** - Don't jump into design
2. **Think out loud** - The interviewer wants to see your thought process
3. **Draw diagrams** - Visual representation helps communication
4. **Consider trade-offs** - There's no perfect solution
5. **Be honest about unknowns** - It's okay to not know everything
6. **Practice regularly** - Consistency is key to improvement
