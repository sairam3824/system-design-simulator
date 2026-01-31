module.exports=[63267,e=>{"use strict";e.s(["COMPANY_PATTERNS",0,{Google:{name:"Google",topTopics:["arrays","strings","trees","graphs","dynamic-programming"],difficultyDistribution:{easy:0,medium:2,hard:1},description:"Focus on algorithmic thinking and optimization",interviewStyle:"Emphasizes clean code, optimal solutions, and ability to handle follow-up questions"},Meta:{name:"Meta",topTopics:["arrays","strings","trees","graphs","hash-tables"],difficultyDistribution:{easy:0,medium:2,hard:1},description:"Fast-paced coding with emphasis on problem-solving speed",interviewStyle:"Values quick thinking, multiple solutions, and handling edge cases"},Amazon:{name:"Amazon",topTopics:["arrays","trees","graphs","dynamic-programming","hash-tables"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Leadership principles integrated with coding problems",interviewStyle:"Practical problems with real-world applications, emphasis on scalability"},Apple:{name:"Apple",topTopics:["arrays","strings","linked-lists","trees","sorting-searching"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Focus on fundamentals and system design thinking",interviewStyle:"Clean, maintainable code with attention to detail"},Microsoft:{name:"Microsoft",topTopics:["arrays","strings","trees","linked-lists","dynamic-programming"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Well-rounded assessment of CS fundamentals",interviewStyle:"Focus on problem decomposition and clear communication"},Netflix:{name:"Netflix",topTopics:["arrays","hash-tables","strings","trees","graphs"],difficultyDistribution:{easy:0,medium:2,hard:1},description:"High performance and distributed systems mindset",interviewStyle:"Focus on scalability, efficiency, and handling large data"},Uber:{name:"Uber",topTopics:["arrays","graphs","hash-tables","heaps","sorting-searching"],difficultyDistribution:{easy:0,medium:2,hard:1},description:"Real-time systems and geospatial problems",interviewStyle:"Practical problems related to ride-sharing, maps, and real-time data"},Airbnb:{name:"Airbnb",topTopics:["arrays","strings","hash-tables","trees","dynamic-programming"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Product-focused coding with real-world scenarios",interviewStyle:"Emphasis on code quality, testing, and product thinking"},Stripe:{name:"Stripe",topTopics:["strings","arrays","hash-tables","recursion","dynamic-programming"],difficultyDistribution:{easy:0,medium:2,hard:1},description:"Payment systems and API design focused",interviewStyle:"Clean code, error handling, and attention to edge cases in financial systems"},Twitter:{name:"Twitter",topTopics:["arrays","strings","hash-tables","heaps","graphs"],difficultyDistribution:{easy:0,medium:2,hard:1},description:"Social network and timeline algorithms",interviewStyle:"Focus on data structures for feeds, trending topics, and social graphs"},LinkedIn:{name:"LinkedIn",topTopics:["graphs","hash-tables","arrays","trees","strings"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Professional network and recommendation systems",interviewStyle:"Graph problems, connection algorithms, and search optimization"},Salesforce:{name:"Salesforce",topTopics:["arrays","strings","hash-tables","trees","sorting-searching"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Enterprise software and CRM focused",interviewStyle:"Practical problems with emphasis on clean, maintainable code"},Adobe:{name:"Adobe",topTopics:["arrays","strings","dynamic-programming","trees","recursion"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Creative software and media processing",interviewStyle:"Algorithm optimization and image/document processing scenarios"},Oracle:{name:"Oracle",topTopics:["arrays","trees","sorting-searching","hash-tables","strings"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Database and enterprise systems focus",interviewStyle:"SQL-related problems and classic data structure questions"},IBM:{name:"IBM",topTopics:["arrays","strings","sorting-searching","trees","hash-tables"],difficultyDistribution:{easy:2,medium:1,hard:0},description:"Enterprise solutions and AI/ML applications",interviewStyle:"Fundamental CS concepts with emphasis on problem-solving approach"},"Goldman Sachs":{name:"Goldman Sachs",topTopics:["arrays","strings","dynamic-programming","hash-tables","sorting-searching"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Financial systems and quantitative problems",interviewStyle:"Math-heavy problems, optimization, and financial calculations"},"JP Morgan":{name:"JP Morgan",topTopics:["arrays","strings","hash-tables","sorting-searching","trees"],difficultyDistribution:{easy:1,medium:2,hard:0},description:"Banking systems and transaction processing",interviewStyle:"Practical problems with emphasis on accuracy and edge cases"},Bloomberg:{name:"Bloomberg",topTopics:["arrays","strings","hash-tables","heaps","sorting-searching"],difficultyDistribution:{easy:0,medium:2,hard:1},description:"Financial data and real-time systems",interviewStyle:"Data processing, streaming, and time-series problems"}},"DIFFICULTY_LEVELS",0,["easy","medium","hard"],"PROBLEM_CATEGORIES",0,["arrays","strings","linked-lists","stacks-queues","trees","graphs","dynamic-programming","recursion","sorting-searching","hash-tables","heaps","bit-manipulation","mixed"],"SCORE_WEIGHTS",0,{correctness:.4,efficiency:.25,codeQuality:.2,edgeCases:.15},"SUPPORTED_LANGUAGES",0,{python:{name:"Python",extension:".py",monacoId:"python"},javascript:{name:"JavaScript",extension:".js",monacoId:"javascript"},java:{name:"Java",extension:".java",monacoId:"java"},cpp:{name:"C++",extension:".cpp",monacoId:"cpp"},c:{name:"C",extension:".c",monacoId:"c"},csharp:{name:"C#",extension:".cs",monacoId:"csharp"},go:{name:"Go",extension:".go",monacoId:"go"}},"TIME_LIMITS",0,{easy:25,medium:40,hard:55}])},22486,e=>{"use strict";let t=`You are an expert DSA problem designer for technical interviews at top tech companies.

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

Return ONLY the JSON object, no additional text.`,i=`You are an expert code reviewer and algorithm analyzer. Your task is to evaluate a candidate's code solution WITHOUT executing it.

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
4. If the code contains only the starter template: SCORE 0.`,s=`You are an expert test engineer. Generate additional test cases for the following coding problem.

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

Return ONLY the JSON array, no additional text.`;e.s(["CODE_EVALUATION_PROMPT",0,i,"PROBLEM_GENERATION_PROMPT",0,t,"TEST_CASE_GENERATION_PROMPT",0,s])},65569,e=>{"use strict";e.i(3218);var t=e.i(15239),i=e.i(22486);async function s(e){let s=i.PROBLEM_GENERATION_PROMPT.replace("{difficulty}",e.difficulty).replace("{category}",e.category).replace("{company}",e.company||"general tech company"),a="llama3"===e.model?"general":"coding",n=(await (0,t.complete)({messages:[{role:"user",content:s}],temperature:.8,maxTokens:2e3},a)).content;try{let e=n.match(/\{[\s\S]*\}/);if(!e)throw Error("No JSON object found in response");let t=JSON.parse(e[0]);if(!t.title||!t.description)throw Error("Missing required fields in generated problem");return{title:t.title,description:t.description,constraints:t.constraints||[],examples:t.examples||[],visibleTestCases:(t.visibleTestCases||[]).map(e=>({...e,isHidden:!1})),hiddenTestCases:(t.hiddenTestCases||[]).map(e=>({...e,isHidden:!0})),solutionApproaches:t.solutionApproaches||[],expectedComplexity:t.expectedComplexity||{time:"Unknown",space:"Unknown"}}}catch(e){throw console.error("Failed to parse problem generation response:",e),console.error("Raw response:",n),Error("Failed to generate problem. Please try again.")}}async function a(e,s,n=5){let r=i.TEST_CASE_GENERATION_PROMPT.replace("{problemDescription}",e).replace("{existingTestCases}",JSON.stringify(s,null,2)).replace("{count}",n.toString()),o=(await (0,t.complete)({messages:[{role:"user",content:r}],temperature:.7,maxTokens:1500},"coding")).content;try{let e=o.match(/\[[\s\S]*\]/);if(!e)throw Error("No JSON array found in response");return JSON.parse(e[0]).map(e=>({input:e.input,expectedOutput:e.expectedOutput,explanation:e.explanation,isHidden:!0}))}catch(e){return console.error("Failed to parse test case generation response:",e),[]}}e.s(["generateCodingProblem",()=>s,"generateHiddenTestCases",()=>a])},68292,e=>{"use strict";e.i(3218);var t=e.i(15239),i=e.i(22486),s=e.i(63267);async function a(e){let s=i.CODE_EVALUATION_PROMPT.replace("{problemDescription}",e.problemDescription).replace("{testCases}",JSON.stringify(e.testCases,null,2)).replace(/{language}/g,e.language).replace("{code}",e.code),a=(await (0,t.complete)({messages:[{role:"user",content:s}],temperature:.3,maxTokens:3e3},"coding")).content;try{let e=a.match(/\{[\s\S]*\}/);if(!e)throw Error("No JSON object found in evaluation response");let t=JSON.parse(e[0]);return{testResults:t.testResults||[],syntaxValid:t.syntaxValid??!0,syntaxErrors:t.syntaxErrors||[],logicAnalysis:t.logicAnalysis||"",correctness:Math.min(100,Math.max(0,t.correctness||0)),efficiency:Math.min(100,Math.max(0,t.efficiency||0)),codeQuality:Math.min(100,Math.max(0,t.codeQuality||0)),edgeCases:Math.min(100,Math.max(0,t.edgeCases||0)),feedback:t.feedback||"No feedback available.",suggestedApproach:t.suggestedApproach,complexityAnalysis:t.complexityAnalysis}}catch(e){return console.error("Failed to parse evaluation response:",e),console.error("Raw response:",a),{testResults:[],syntaxValid:!1,syntaxErrors:["Unable to evaluate code - please check syntax"],logicAnalysis:"Evaluation failed due to parsing error.",correctness:0,efficiency:0,codeQuality:0,edgeCases:0,feedback:"Unable to evaluate the code. Please ensure the code is syntactically correct and try again.",suggestedApproach:void 0,complexityAnalysis:void 0}}}function n(e,t){return{testResults:t.map((t,i)=>{let s=e.testResults.find(e=>e.testIndex===i);return{testCase:t,passed:s?.passed??!1,actualOutput:s?.predictedOutput,analysis:s?.analysis}}),isValid:e.syntaxValid,errorMessage:e.syntaxErrors.length>0?e.syntaxErrors.join("; "):void 0,syntaxErrors:e.syntaxErrors,logicAnalysis:e.logicAnalysis}}function r(e){let t=e.correctness/100,i=e.efficiency/100,a=e.codeQuality/100,n=e.edgeCases/100,r=t*s.SCORE_WEIGHTS.correctness+i*s.SCORE_WEIGHTS.efficiency+a*s.SCORE_WEIGHTS.codeQuality+n*s.SCORE_WEIGHTS.edgeCases;return{correctness:e.correctness,efficiency:e.efficiency,codeQuality:e.codeQuality,edgeCases:e.edgeCases,overallScore:Math.round(100*r),passStatus:r>=.7&&t>=.6,feedback:e.feedback,suggestedApproach:e.suggestedApproach,complexityAnalysis:e.complexityAnalysis?`Time: ${e.complexityAnalysis.time}, Space: ${e.complexityAnalysis.space}. ${e.complexityAnalysis.explanation}`:void 0}}function o(e,t){let i=[];if(!e.trim())return i.push("Code is empty"),{valid:!1,errors:i};let s={"(":")","[":"]","{":"}"},a=[];for(let t of e)if(t in s)a.push(s[t]);else if(Object.values(s).includes(t)&&a.pop()!==t){i.push("Unmatched brackets detected");break}if(a.length>0&&0===i.length&&i.push("Unclosed brackets detected"),"python"===t)e.includes("def ")&&!e.includes(":")&&i.push("Missing colon after function definition");else if("java"===t||"csharp"===t||"cpp"===t||"c"===t){let t=e.split("\n");for(let e=0;e<t.length;e++){let i=t[e].trim();!(i.length>0)||i.endsWith("{")||i.endsWith("}")||i.endsWith(";")||i.endsWith(",")||i.startsWith("//")||i.startsWith("/*")||i.startsWith("*")||i.startsWith("#")||i.includes("if")||i.includes("for")||i.includes("while")||i.includes("else")}}return{valid:0===i.length,errors:i}}e.s(["calculateScore",()=>r,"evaluateCode",()=>a,"quickSyntaxCheck",()=>o,"toEvaluationResult",()=>n])},38883,e=>{"use strict";function t(e,t,n){var r,o,l,c,d,u,p,m,h,g,f,y;let b,v,x,N,S,T,C;return({python:(r=t,o=n,b=i(r),({"linked-lists":`# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def ${b}(self, head: ListNode) -> ListNode:
        # Your code here
        pass
`,trees:`# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def ${b}(self, root: TreeNode) -> any:
        # Your code here
        pass
`,graphs:`from collections import defaultdict, deque
from typing import List

class Solution:
    def ${b}(self, n: int, edges: List[List[int]]) -> any:
        # Build adjacency list
        graph = defaultdict(list)
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)

        # Your code here
        pass
`})[o]||`from typing import List, Optional

class Solution:
    def ${b}(self, nums: List[int]) -> any:
        # Your code here
        pass
`),javascript:(l=t,c=n,v=s(l),({"linked-lists":`/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var ${v} = function(head) {
    // Your code here

};
`,trees:`/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */

/**
 * @param {TreeNode} root
 * @return {*}
 */
var ${v} = function(root) {
    // Your code here

};
`})[c]||`/**
 * @param {number[]} nums
 * @return {*}
 */
var ${v} = function(nums) {
    // Your code here

};
`),java:(d=t,u=n,a(d),x=s(d),({"linked-lists":`/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode ${x}(ListNode head) {
        // Your code here
        return null;
    }
}
`,trees:`/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public Object ${x}(TreeNode root) {
        // Your code here
        return null;
    }
}
`})[u]||`import java.util.*;

class Solution {
    public int[] ${x}(int[] nums) {
        // Your code here
        return new int[0];
    }
}
`),cpp:(p=t,m=n,N=s(p),({"linked-lists":`/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* ${N}(ListNode* head) {
        // Your code here
        return nullptr;
    }
};
`,trees:`/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    void ${N}(TreeNode* root) {
        // Your code here
    }
};
`})[m]||`#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> ${N}(vector<int>& nums) {
        // Your code here
        return {};
    }
};
`),c:(S=i(t),`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* ${S}(int* nums, int numsSize, int* returnSize) {
    // Your code here
    *returnSize = 0;
    return NULL;
}
`),csharp:(h=t,g=n,T=a(h),({"linked-lists":`/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     public int val;
 *     public ListNode next;
 *     public ListNode(int val=0, ListNode next=null) {
 *         this.val = val;
 *         this.next = next;
 *     }
 * }
 */
public class Solution {
    public ListNode ${T}(ListNode head) {
        // Your code here
        return null;
    }
}
`,trees:`/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     public int val;
 *     public TreeNode left;
 *     public TreeNode right;
 *     public TreeNode(int val=0, TreeNode left=null, TreeNode right=null) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
public class Solution {
    public object ${T}(TreeNode root) {
        // Your code here
        return null;
    }
}
`})[g]||`using System;
using System.Collections.Generic;

public class Solution {
    public int[] ${T}(int[] nums) {
        // Your code here
        return new int[0];
    }
}
`),go:(f=t,y=n,C=s(f),({"linked-lists":`/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func ${C}(head *ListNode) *ListNode {
    // Your code here
    return nil
}
`,trees:`/**
 * Definition for a binary tree node.
 * type TreeNode struct {
 *     Val int
 *     Left *TreeNode
 *     Right *TreeNode
 * }
 */
func ${C}(root *TreeNode) interface{} {
    // Your code here
    return nil
}
`})[y]||`func ${C}(nums []int) []int {
    // Your code here
    return nil
}
`)})[e]}function i(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"")}function s(e){return e.toLowerCase().replace(/[^a-z0-9]+(.)/g,(e,t)=>t.toUpperCase()).replace(/^./,e=>e.toLowerCase()).replace(/[^a-zA-Z0-9]/g,"")}function a(e){return e.toLowerCase().replace(/[^a-z0-9]+(.)/g,(e,t)=>t.toUpperCase()).replace(/^./,e=>e.toUpperCase()).replace(/[^a-zA-Z0-9]/g,"")}e.s(["getStarterTemplate",()=>t])},70011,e=>{"use strict";e.i(63267),e.i(65569),e.i(68292),e.i(38883),e.s([])}];

//# sourceMappingURL=Documents_Git_system-design_system-design-simulator_src_lib_3f87e7ee._.js.map