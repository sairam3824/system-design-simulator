module.exports=[97424,e=>e.a(async(t,a)=>{try{var i=e.i(78968),s=t([i]);[i]=s.then?(await s)():s;let u={requirementsClarification:"Requirements Clarification",highLevelDesign:"High-Level Design",detailedDesign:"Detailed Design",scalability:"Scalability",tradeoffs:"Trade-offs",communication:"Communication"},h=Object.keys(u);function n(e){if(e.length<3)return"stable";let t=e.length,a=0,i=0,s=0,n=0;for(let o=0;o<t;o++)a+=o,i+=e[o],s+=o*e[o],n+=o*o;let o=(t*s-a*i)/(t*n-a*a);return o>.1?"improving":o<-.1?"declining":"stable"}async function o(e,t,a=20){return(await i.prisma.interview.findMany({where:{userId:e,status:"completed"},orderBy:{endedAt:"asc"},take:a,include:{score:!0}})).filter(e=>e.score).map(e=>({date:e.endedAt?.toISOString()||e.createdAt.toISOString(),overallScore:t?e.score[t]:e.score.overallScore,passStatus:e.score.passStatus,topic:e.topic,interviewId:e.id}))}async function r(e,t=10){let a=await i.prisma.interview.findMany({where:{userId:e,status:"completed"},orderBy:{endedAt:"desc"},take:t,include:{score:!0}}),s={};for(let e of(h.forEach(e=>{s[e]=[]}),a))e.score&&h.forEach(t=>{let a=e.score[t];void 0!==a&&s[t].push(a)});let o=[];for(let[e,t]of Object.entries(s)){if(0===t.length)continue;let a=t.reduce((e,t)=>e+t,0)/t.length;a<2.5&&o.push({dimension:u[e]||e,avgScore:Number(a.toFixed(2)),occurrences:t.filter(e=>e<2.5).length,lastScore:t[0],trend:n(t.reverse())})}return o.sort((e,t)=>e.avgScore-t.avgScore)}async function c(e,t=20){let[a,s]=await Promise.all([i.prisma.interview.count({where:{userId:e}}),i.prisma.interview.findMany({where:{userId:e,status:"completed"},orderBy:{endedAt:"desc"},take:t,include:{score:!0}})]),o=s.length,r=s.filter(e=>e.score),l=0,d=0,p=[];for(let e of r)l+=e.score.overallScore,e.score.passStatus&&d++,p.push(e.score.overallScore);r.length>0&&(l/=r.length);let m=r.length>0?d/r.length*100:0,g={};for(let e of h){let t=[];for(let a of r){let i=a.score[e];void 0!==i&&t.push(i)}if(t.length>0){let a=t.reduce((e,t)=>e+t,0)/t.length;g[e]={avgScore:Number(a.toFixed(2)),trend:n(t.reverse()),isWeak:a<2.5,isStrong:a>=3,recentScores:t.slice(-5)}}else g[e]={avgScore:0,trend:"stable",isWeak:!1,isStrong:!1,recentScores:[]}}let f=r.map(e=>({date:e.endedAt?.toISOString()||e.createdAt.toISOString(),overallScore:e.score.overallScore,passStatus:e.score.passStatus,topic:e.topic,interviewId:e.id})),v={overall:{totalInterviews:a,completedInterviews:o,avgScore:Number(l.toFixed(2)),passRate:Number(m.toFixed(1)),scoreTrend:n(p.reverse())},dimensions:g,recentScores:f,insights:[],recommendations:[]};return v.insights=function(e){let t=[];if(0===e.overall.completedInterviews)return t.push("Complete your first interview to start tracking progress!"),t;e.overall.avgScore>=3?t.push("Your overall performance is strong. You're ready for senior-level interviews."):e.overall.avgScore>=2.5?t.push("You're performing at a passing level. Focus on your weak areas to improve."):t.push("Your scores indicate room for improvement. Consider more practice sessions."),e.overall.passRate>=80?t.push(`Excellent pass rate of ${e.overall.passRate.toFixed(0)}%!`):e.overall.passRate>=50?t.push(`Your pass rate is ${e.overall.passRate.toFixed(0)}%. Aim for consistency.`):e.overall.completedInterviews>=3&&t.push(`Pass rate of ${e.overall.passRate.toFixed(0)}% needs attention. Review fundamentals.`),"improving"===e.overall.scoreTrend?t.push("Your scores are trending upward. Keep up the great work!"):"declining"===e.overall.scoreTrend&&t.push("Your recent scores have declined. Consider reviewing basics.");let a=Object.entries(e.dimensions).filter(([,e])=>e.isWeak).map(([e])=>u[e]||e);a.length>0&&t.push(`Focus areas: ${a.join(", ")}`);let i=Object.entries(e.dimensions).filter(([,e])=>e.isStrong).map(([e])=>u[e]||e);return i.length>0&&t.push(`Strong areas: ${i.join(", ")}`),t}(v),v.recommendations=function(e){let t=[];if(0===e.overall.completedInterviews)return t.push("Start with an easy difficulty interview to build confidence."),t;for(let[a,i]of Object.entries(e.dimensions).filter(([,e])=>e.isWeak).sort((e,t)=>e[1].avgScore-t[1].avgScore).slice(0,2)){let e=u[a]||a;switch(a){case"requirementsClarification":t.push("Practice asking clarifying questions about scale, users, and constraints.");break;case"highLevelDesign":t.push("Study common system design patterns and practice drawing architecture diagrams.");break;case"detailedDesign":t.push("Review data modeling, API design, and dive deeper into component internals.");break;case"scalability":t.push("Study caching, sharding, load balancing, and horizontal scaling strategies.");break;case"tradeoffs":t.push("Practice discussing CAP theorem, consistency vs availability, and cost tradeoffs.");break;case"communication":t.push("Practice explaining your thought process clearly and structuring your responses.");break;default:t.push(`Focus on improving ${e} (current avg: ${i.avgScore.toFixed(1)}).`)}}return e.overall.completedInterviews<5&&t.push("Complete at least 5 interviews to establish reliable patterns."),e.overall.avgScore>=3&&e.overall.passRate>=70?t.push("Consider increasing difficulty to challenge yourself further."):e.overall.avgScore<2&&t.push("Try easier interviews to build foundational knowledge."),t}(v),v}async function l(e){let t=await c(e,50),a=Object.entries(t.dimensions).filter(([,e])=>e.isWeak).map(([e])=>e),s=Object.entries(t.dimensions).filter(([,e])=>e.isStrong).map(([e])=>e),n=await i.prisma.interview.findMany({where:{userId:e,status:"completed"},include:{score:!0}}),o={};for(let e of n)e.score&&(o[e.topic]||(o[e.topic]={count:0,totalScore:0,passCount:0}),o[e.topic].count++,o[e.topic].totalScore+=e.score.overallScore,e.score.passStatus&&o[e.topic].passCount++);let r={};for(let[e,t]of Object.entries(o))r[e]={count:t.count,avgScore:Number((t.totalScore/t.count).toFixed(2)),passRate:Number((t.passCount/t.count*100).toFixed(1))};await i.prisma.userAnalytics.upsert({where:{userId:e},create:{userId:e,totalInterviews:t.overall.totalInterviews,completedInterviews:t.overall.completedInterviews,avgOverallScore:t.overall.avgScore,passRate:t.overall.passRate,weakDimensions:JSON.stringify(a),strongDimensions:JSON.stringify(s),topicStats:JSON.stringify(r),scoreTrend:t.overall.scoreTrend,lastCalculatedAt:new Date},update:{totalInterviews:t.overall.totalInterviews,completedInterviews:t.overall.completedInterviews,avgOverallScore:t.overall.avgScore,passRate:t.overall.passRate,weakDimensions:JSON.stringify(a),strongDimensions:JSON.stringify(s),topicStats:JSON.stringify(r),scoreTrend:t.overall.scoreTrend,lastCalculatedAt:new Date}})}function d(e){return e<2?"struggling":e<2.5?"developing":e<3?"proficient":"excelling"}e.s(["calculatePerformanceMetrics",()=>c,"calculateTrend",()=>n,"getPerformanceCategory",()=>d,"getScoreProgression",()=>o,"identifyWeakAreas",()=>r,"updateUserAnalyticsCache",()=>l]),a()}catch(e){a(e)}},!1),8783,e=>e.a(async(t,a)=>{try{var i=e.i(78968),s=e.i(97424),n=t([i,s]);[i,s]=n.then?(await n)():n;let l={requirementsClarification:["scale estimation (DAU, QPS)","functional vs non-functional requirements","latency and availability requirements","data consistency requirements","feature prioritization"],highLevelDesign:["API design and endpoints","component architecture","database selection","data flow between components","service boundaries"],detailedDesign:["data models and schemas","algorithm choices","caching strategies","protocol selection","failure handling"],scalability:["horizontal vs vertical scaling","database sharding","load balancing strategies","caching layers","CDN usage"],tradeoffs:["CAP theorem implications","consistency vs availability","cost vs performance","latency vs throughput","complexity vs maintainability"],communication:["structured thinking","clear explanations","diagram usage","time management","handling clarifications"]},d={requirementsClarification:"Requirements Clarification",highLevelDesign:"High-Level Design",detailedDesign:"Detailed Design",scalability:"Scalability",tradeoffs:"Trade-offs",communication:"Communication"};async function o(e,t=10){let a=await (0,s.identifyWeakAreas)(e,t),i=[];for(let e of a){let t=Object.entries(d).find(([,t])=>t===e.dimension)?.[0];if(!t)continue;let a=(l[t]||[]).slice(0,2);i.push({dimension:e.dimension,dimensionKey:t,topic:"",concept:a.join(", "),lastScore:e.lastScore,occurrences:e.occurrences,trend:e.trend})}return i}async function r(e,t){let a=await (0,s.calculatePerformanceMetrics)(e,15),n=await o(e,10),r=await i.prisma.interview.findMany({where:{userId:e,status:"completed"},include:{score:!0},orderBy:{endedAt:"desc"},take:20}),c={};for(let e of r)e.score&&(c[e.topic]||(c[e.topic]={total:0,passed:0}),c[e.topic].total++,e.score.passStatus&&c[e.topic].passed++);let d=Object.entries(c).filter(([,e])=>e.total>=2&&e.passed/e.total<.5).map(([e])=>e),u=[];for(let e of n.slice(0,3)){let t=l[e.dimensionKey]||[];u.push(...t.slice(0,2))}let h="standard";return a.overall.avgScore<2?h="easier":a.overall.avgScore>=3&&a.overall.passRate>=70&&(h="harder"),{weakPoints:n,topicsToReinforce:d,conceptsToProbe:[...new Set(u)],adaptedDifficulty:h,hasHistory:a.overall.completedInterviews>0,totalPastInterviews:a.overall.completedInterviews}}function c(e){if(!e.hasHistory||0===e.weakPoints.length)return"";let t=`
## Candidate's Past Performance Context

This candidate has completed ${e.totalPastInterviews} previous interview${1===e.totalPastInterviews?"":"s"}.

### Weak Areas to Focus On
`;for(let a of e.weakPoints.slice(0,3))t+=`- **${a.dimension}** (avg score: ${a.lastScore}/4, trend: ${a.trend})
  - Concepts to probe: ${a.concept}
`;return e.conceptsToProbe.length>0&&(t+=`
### Specific Concepts to Cover
During the interview, make sure to ask about:
${e.conceptsToProbe.map(e=>`- ${e}`).join("\n")}
`),e.topicsToReinforce.length>0&&(t+=`
### Related Topics With Low Performance
The candidate has struggled with these related topics: ${e.topicsToReinforce.join(", ")}
Consider asking questions that reinforce fundamentals from these areas.
`),t+=`
### Adaptation Instructions
- Difficulty adaptation: ${e.adaptedDifficulty}
${"easier"===e.adaptedDifficulty?"- Provide more hints and guidance for this candidate":""}
${"harder"===e.adaptedDifficulty?"- Challenge this candidate with edge cases and deeper probing":""}
- When the candidate answers questions related to their weak areas, probe deeper
- Acknowledge improvement if they perform better on previously weak dimensions
`}e.s(["buildFollowUpContext",()=>r,"generateFollowUpPromptAddition",()=>c]),a()}catch(e){a(e)}},!1),46771,e=>e.a(async(t,a)=>{try{var i=e.i(8783),s=t([i]);[i]=s.then?(await s)():s;let n=`You are Bobby, a friendly and experienced FAANG system design interviewer with 10+ years of experience at companies like Google, Meta, Amazon, Netflix, and Uber. Your role is to conduct a realistic 45-minute system design interview.

## Your Personality as Bobby
- Be warm, encouraging, and professional
- Use a conversational tone while maintaining technical rigor
- Occasionally use phrases like "Great point!", "That's interesting...", "I like that approach"
- Introduce yourself as Bobby at the start of the interview

## Interview Structure (45 minutes total)

### Phase 1: Requirements Clarification (Minutes 45:00 - 37:00) [8 min]
- Ask about scale (DAU, requests/sec, data size)
- Clarify functional vs non-functional requirements
- Understand use cases and priorities
- Key questions:
  * "What's the expected scale? DAU, requests per second?"
  * "What are the most critical features we need to support?"
  * "What are our latency requirements?"
  * "Do we need strong consistency or is eventual consistency okay?"

### Phase 2: High-Level Design (Minutes 37:00 - 25:00) [12 min]
- Guide them to draw core components
- Discuss API design
- Cover data flow between components
- Key questions:
  * "Can you walk me through the high-level architecture?"
  * "What databases would you use and why?"
  * "How would data flow from client to storage?"

### Phase 3: Deep Dive (Minutes 25:00 - 13:00) [12 min]
- Pick 2-3 critical components to explore in detail
- Ask about data models, algorithms, protocols
- Discuss failure scenarios and edge cases
- Key questions:
  * "Let's dive deeper into [component]. How would you implement it?"
  * "What happens if [failure scenario]?"
  * "How would you handle [edge case]?"

### Phase 4: Scalability & Trade-offs (Minutes 13:00 - 3:00) [10 min]
- How does it handle 10x, 100x scale?
- CAP theorem implications
- Cost vs performance tradeoffs
- Key questions:
  * "How would this design change if we had 100x the users?"
  * "What are the bottlenecks in this design?"
  * "What trade-offs are you making here?"

### Phase 5: Wrap-up (Minutes 3:00 - 0:00) [3 min]
- Address any remaining concerns
- Allow candidate to ask questions
- Summarize the design

## Bobby's Interview Style

1. **Be conversational and supportive** - Guide the candidate through each phase while being encouraging
2. **Ask probing questions** - Push candidates to think deeper with genuine curiosity
3. **Focus on tradeoffs** - There's no single right answer; evaluate reasoning
4. **Manage time** - Gently transition between phases to cover all areas
5. **Adapt to responses** - If they struggle, provide hints; if they excel, go deeper
6. **Stay positive** - Even when challenging decisions, do so constructively

## Phase Transition Signals

When you determine it's time to move to the next phase, include this marker in your response:
[PHASE_TRANSITION: <next_phase_id>]

For example: [PHASE_TRANSITION: high-level]

Only use these phase IDs: requirements, high-level, deep-dive, scalability, wrapup

## Important Rules

- DO NOT give away answers - guide them with questions
- DO NOT be overly positive - be professional and objective
- DO challenge their decisions - "Why not use X instead?"
- DO acknowledge good points - "That's a good consideration"
- DO redirect if they go off track - "Let's focus on the core flow first"
- DO manage time - transition phases appropriately
- KEEP responses concise - 2-4 sentences, then ask 1-2 questions

## CRITICAL: Phase Boundary Enforcement

**YOU MUST STRICTLY STAY WITHIN THE CURRENT PHASE. DO NOT JUMP AHEAD OR GO BACKWARDS.**

- **In Requirements Phase (45:00-37:00)**: ONLY ask about scale, functional/non-functional requirements, priorities. DO NOT ask about architecture, databases, or implementation details yet.
- **In High-Level Design Phase (37:00-25:00)**: ONLY ask about overall architecture, main components, API design, and data flow. DO NOT dive into implementation details, algorithms, or schemas yet.
- **In Deep Dive Phase (25:00-13:00)**: NOW you can ask about data models, algorithms, protocols, and implementation details. DO NOT ask about scalability or caching yet.
- **In Scalability Phase (13:00-3:00)**: NOW you can ask about scaling strategies, caching, sharding, load balancing, and performance optimization.
- **In Wrap-up Phase (3:00-0:00)**: Summarize, answer candidate questions, discuss any remaining concerns.

**If the candidate jumps ahead** (e.g., talks about caching in requirements phase), acknowledge briefly but redirect: "That's an interesting point about caching, but let's first clarify the requirements. We'll discuss optimization strategies later."

**If the candidate is stuck**, provide hints ONLY related to the current phase. Don't hint at future phases.

## Response Format

Keep responses focused. React to their answer, provide brief feedback, then ask the next question. If transitioning phases, acknowledge the transition naturally.`,o=`You are analyzing a specific phase of a system design interview. Evaluate the candidate's performance in this phase only.

## CRITICAL EVALUATION RULES

**IMPORTANT: You MUST evaluate based ONLY on what the USER (candidate) actually said. Do NOT give credit for things the ASSISTANT (interviewer) mentioned.**

1. **If the candidate provided NO responses or only said "hello", "ok", "yes" - score MUST be 1**
2. **If the candidate gave vague/incomplete answers - score should be 1-2**
3. **Only give scores of 3-4 if candidate demonstrated clear technical knowledge**

## Phase Being Evaluated: {{PHASE_NAME}}

## Scoring Scale (1-4)
- 4 (Excellent): Candidate provided detailed, expert-level technical responses
- 3 (Good): Candidate showed solid understanding through their explanations
- 2 (Needs Work): Candidate gave partial/vague answers
- 1 (Poor): Candidate did not provide meaningful technical responses

## Evaluation Criteria for {{PHASE_NAME}}:
{{PHASE_CRITERIA}}

**If the candidate did not address these criteria in their responses, the score is 1.**

## Response Format
Return ONLY valid JSON:
{
  "phase": "{{PHASE_ID}}",
  "score": <1-4>,
  "summary": "<2-3 sentence evaluation - be honest if candidate didn't respond>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area 1>", "<area 2>"],
  "keyObservations": ["<observation 1>", "<observation 2>"]
}`,r=`You are evaluating a complete 45-minute system design interview. Based on the entire conversation, give a final comprehensive evaluation.

## CRITICAL EVALUATION RULES

**IMPORTANT: You MUST evaluate based ONLY on what the USER (candidate) actually said. Do NOT give credit for things the ASSISTANT (interviewer) mentioned.**

1. **If the candidate provided NO substantive responses or only said things like "hello", "ok", "yes" without any technical content, ALL dimension scores MUST be 1.**
2. **If the candidate gave only brief/incomplete answers, scores should be 1-2.**
3. **Only give scores of 3-4 if the candidate demonstrated clear technical knowledge through their own explanations.**
4. **Count the actual technical responses from the USER. Short acknowledgments don't count as responses.**

## Scoring Scale
- 4 (Strong Hire): Exceeds expectations, demonstrates expertise with detailed technical explanations
- 3 (Hire): Meets expectations, solid understanding shown through their responses
- 2 (Lean No Hire): Below expectations, only partial/vague answers provided
- 1 (No Hire): Does not meet basic requirements - no meaningful technical responses given

## Dimensions to Evaluate

1. **Requirements Clarification (10%)**
   - Did the CANDIDATE ask about scale, users, data size?
   - Did the CANDIDATE clarify functional vs non-functional requirements?
   - If the candidate didn't ask clarifying questions, score is 1.

2. **High-Level Design (20%)**
   - Did the CANDIDATE describe an architecture?
   - Did the CANDIDATE explain components and their responsibilities?
   - If the candidate didn't propose any design, score is 1.

3. **Detailed Design (15%)**
   - Did the CANDIDATE explain component internals?
   - Did the CANDIDATE discuss data models and algorithms?
   - If the candidate didn't go into any details, score is 1.

4. **Scalability (20%)**
   - Did the CANDIDATE discuss scaling strategies?
   - Did the CANDIDATE propose caching, sharding, load balancing?
   - If the candidate didn't address scalability, score is 1.

5. **Tradeoffs (25%)**
   - Did the CANDIDATE reason about tradeoffs?
   - Did the CANDIDATE compare alternatives?
   - If the candidate didn't discuss any tradeoffs, score is 1.

6. **Communication (10%)**
   - Did the CANDIDATE communicate clearly?
   - If the candidate barely spoke, score is 1.

## Response Format

Return a JSON object with:
{
  "candidateResponseCount": <number of substantive technical responses from the user>,
  "requirementsClarification": <1-4>,
  "highLevelDesign": <1-4>,
  "detailedDesign": <1-4>,
  "scalability": <1-4>,
  "tradeoffs": <1-4>,
  "communication": <1-4>,
  "overallScore": <weighted average>,
  "passStatus": <true ONLY if average >= 2.5 AND no dimension below 2 AND tradeoffs >= 3 AND candidateResponseCount >= 5>,
  "feedback": {
    "requirementsClarification": "<specific feedback based on what candidate said>",
    "highLevelDesign": "<specific feedback based on what candidate said>",
    "detailedDesign": "<specific feedback based on what candidate said>",
    "scalability": "<specific feedback based on what candidate said>",
    "tradeoffs": "<specific feedback based on what candidate said>",
    "communication": "<specific feedback based on what candidate said>",
    "overallFeedback": "<2-3 sentence summary - be honest if candidate didn't participate>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>"]
  }
}

Return ONLY valid JSON.`;e.s(["INTERVIEW_PHASES",0,[{id:"requirements",name:"Requirements Clarification",duration:8,startTime:45,endTime:37,description:"Understand the problem scope, scale, and constraints",keyPoints:["Clarify functional requirements","Understand scale (users, QPS, data size)","Identify non-functional requirements (latency, availability)","Prioritize features"]},{id:"high-level",name:"High-Level Design",duration:12,startTime:37,endTime:25,description:"Design the overall system architecture",keyPoints:["Draw core components","Define APIs","Explain data flow","Choose databases and storage"]},{id:"deep-dive",name:"Deep Dive",duration:12,startTime:25,endTime:13,description:"Explore critical components in detail",keyPoints:["Data models and schemas","Algorithms and protocols","Failure handling","Edge cases"]},{id:"scalability",name:"Scalability & Trade-offs",duration:10,startTime:13,endTime:3,description:"Discuss scaling and architectural decisions",keyPoints:["Handle 10x-100x growth","Caching strategies","CAP theorem implications","Cost vs performance"]},{id:"wrapup",name:"Wrap-up",duration:3,startTime:3,endTime:0,description:"Final questions and summary",keyPoints:["Address remaining concerns","Candidate questions","Summary of design"]}],"SCORING_PROMPT",0,r,"getInterviewPrompt",0,(e,t)=>`${n}

## Current Interview

**Topic:** ${e}
**Difficulty:** ${t}
**Approach:** ${({easy:"Be more guiding and provide more hints. Focus on basic concepts. Allow more time for explanations.",medium:"Balance between guidance and challenge. Standard FAANG interview depth.",hard:"Be more challenging. Ask about edge cases, failure modes, and push for optimal solutions. Expect quick, precise answers."})[t]}

Begin the interview now. Introduce yourself as Bobby, briefly introduce the problem, and start with requirements clarification. Ask what clarifying questions they have about the system.`,"getPersonalizedInterviewPrompt",0,(e,t,a,s)=>{let o={easy:"Be more guiding and provide more hints. Focus on basic concepts. Allow more time for explanations.",medium:"Balance between guidance and challenge. Standard FAANG interview depth.",hard:"Be more challenging. Ask about edge cases, failure modes, and push for optimal solutions. Expect quick, precise answers."},r=s?(0,i.generateFollowUpPromptAddition)(s):"";return`${n}

${a.promptModifications}
${r}
## Current Interview

**Topic:** ${e}
**Difficulty:** ${t}
**Approach:** ${o[t]||o.medium}

Begin the interview now. Introduce yourself as Bobby, briefly introduce the problem, and start with requirements clarification. Ask what clarifying questions they have about the system.`},"getPhaseAnalysisPrompt",0,(e,t)=>{let a={requirements:`
- Did they ask about scale (users, QPS, data volume)?
- Did they clarify functional requirements?
- Did they identify non-functional requirements (latency, availability, consistency)?
- Did they prioritize features appropriately?
- Did they ask about constraints and edge cases?`,"high-level":`
- Is the architecture sound and complete?
- Are components well-defined with clear responsibilities?
- Is the API design reasonable?
- Did they choose appropriate databases/storage?
- Is the data flow logical and efficient?`,"deep-dive":`
- Can they explain component internals?
- Do they understand data models and schemas?
- Did they address failure scenarios?
- Did they consider edge cases?
- Do they know relevant algorithms/protocols?`,scalability:`
- Do they understand horizontal vs vertical scaling?
- Did they propose caching strategies?
- Did they discuss sharding/partitioning?
- Did they address load balancing?
- Can they reason about 10x-100x growth?`,wrapup:`
- Did they summarize the design clearly?
- Did they acknowledge trade-offs made?
- Were they open to feedback?
- Did they ask thoughtful questions?`};return o.replace(/{{PHASE_NAME}}/g,t).replace(/{{PHASE_ID}}/g,e).replace(/{{PHASE_CRITERIA}}/g,a[e]||"")}]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=Documents_Git_system-design_system-design-simulator_src_lib_a79c29e7._.js.map