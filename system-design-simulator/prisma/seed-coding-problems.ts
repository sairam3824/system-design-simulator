import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

const codingProblems = [
  // EASY Problems (30 minutes)
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.

**Examples:**

**Example 1:**
- Input: nums = [2,7,11,15], target = 9
- Output: [0,1]
- Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**
- Input: nums = [3,2,4], target = 6
- Output: [1,2]

**Example 3:**
- Input: nums = [3,3], target = 6
- Output: [0,1]`,
    difficulty: "easy",
    category: "arrays",
    companies: JSON.stringify(["Google", "Amazon", "Meta", "Microsoft", "Apple"]),
    constraints: JSON.stringify([
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists"
    ]),
    examples: JSON.stringify([
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" }
    ]),
    testCases: JSON.stringify([
      { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]", isHidden: false },
      { input: "[3,2,4]\n6", expectedOutput: "[1,2]", isHidden: false },
      { input: "[3,3]\n6", expectedOutput: "[0,1]", isHidden: false },
      { input: "[1,2,3,4,5]\n9", expectedOutput: "[3,4]", isHidden: true },
      { input: "[-1,-2,-3,-4,-5]\n-8", expectedOutput: "[2,4]", isHidden: true },
      { input: "[0,4,3,0]\n0", expectedOutput: "[0,3]", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "Brute Force: O(n²) time - Check all pairs",
      "Hash Map: O(n) time, O(n) space - Store complements"
    ]),
    starterCode: JSON.stringify({
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Your code here
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here

};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[0];
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`,
      go: `func twoSum(nums []int, target int) []int {
    // Your code here
    return nil
}`
    }),
    timeLimit: 30
  },
  {
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Constraints:**
- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'

**Examples:**

**Example 1:**
- Input: s = "()"
- Output: true

**Example 2:**
- Input: s = "()[]{}"
- Output: true

**Example 3:**
- Input: s = "(]"
- Output: false`,
    difficulty: "easy",
    category: "stacks-queues",
    companies: JSON.stringify(["Amazon", "Meta", "Bloomberg", "Google"]),
    constraints: JSON.stringify([
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'"
    ]),
    examples: JSON.stringify([
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" }
    ]),
    testCases: JSON.stringify([
      { input: "()", expectedOutput: "true", isHidden: false },
      { input: "()[]{}", expectedOutput: "true", isHidden: false },
      { input: "(]", expectedOutput: "false", isHidden: false },
      { input: "([)]", expectedOutput: "false", isHidden: true },
      { input: "{[]}", expectedOutput: "true", isHidden: true },
      { input: "", expectedOutput: "true", isHidden: true },
      { input: "((((()))))", expectedOutput: "true", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "Stack: O(n) time, O(n) space - Push opening brackets, pop for closing"
    ]),
    starterCode: JSON.stringify({
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Your code here
        pass`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Your code here

};`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
}`
    }),
    timeLimit: 30
  },
  {
    title: "Reverse Linked List",
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

**Constraints:**
- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000

**Examples:**

**Example 1:**
- Input: head = [1,2,3,4,5]
- Output: [5,4,3,2,1]

**Example 2:**
- Input: head = [1,2]
- Output: [2,1]

**Example 3:**
- Input: head = []
- Output: []

**Follow up:** A linked list can be reversed either iteratively or recursively. Could you implement both?`,
    difficulty: "easy",
    category: "linked-lists",
    companies: JSON.stringify(["Amazon", "Microsoft", "Apple", "Meta"]),
    constraints: JSON.stringify([
      "The number of nodes in the list is the range [0, 5000]",
      "-5000 <= Node.val <= 5000"
    ]),
    examples: JSON.stringify([
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" }
    ]),
    testCases: JSON.stringify([
      { input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]", isHidden: false },
      { input: "[1,2]", expectedOutput: "[2,1]", isHidden: false },
      { input: "[]", expectedOutput: "[]", isHidden: false },
      { input: "[1]", expectedOutput: "[1]", isHidden: true },
      { input: "[1,2,3]", expectedOutput: "[3,2,1]", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "Iterative: O(n) time, O(1) space - Three pointers",
      "Recursive: O(n) time, O(n) space - Call stack"
    ]),
    starterCode: JSON.stringify({
      python: `# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        # Your code here
        pass`,
      javascript: `/**
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
var reverseList = function(head) {
    // Your code here

};`
    }),
    timeLimit: 30
  },

  // MEDIUM Problems (45 minutes)
  {
    title: "Longest Substring Without Repeating Characters",
    description: `Given a string s, find the length of the longest substring without repeating characters.

**Constraints:**
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.

**Examples:**

**Example 1:**
- Input: s = "abcabcbb"
- Output: 3
- Explanation: The answer is "abc", with the length of 3.

**Example 2:**
- Input: s = "bbbbb"
- Output: 1
- Explanation: The answer is "b", with the length of 1.

**Example 3:**
- Input: s = "pwwkew"
- Output: 3
- Explanation: The answer is "wke", with the length of 3.
  Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.`,
    difficulty: "medium",
    category: "strings",
    companies: JSON.stringify(["Amazon", "Google", "Meta", "Microsoft", "Bloomberg"]),
    constraints: JSON.stringify([
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces"
    ]),
    examples: JSON.stringify([
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc"' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b"' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke"' }
    ]),
    testCases: JSON.stringify([
      { input: "abcabcbb", expectedOutput: "3", isHidden: false },
      { input: "bbbbb", expectedOutput: "1", isHidden: false },
      { input: "pwwkew", expectedOutput: "3", isHidden: false },
      { input: "", expectedOutput: "0", isHidden: true },
      { input: " ", expectedOutput: "1", isHidden: true },
      { input: "dvdf", expectedOutput: "3", isHidden: true },
      { input: "abba", expectedOutput: "2", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "Sliding Window with HashSet: O(n) time, O(min(m,n)) space",
      "Sliding Window with HashMap: O(n) time - Jump to position"
    ]),
    starterCode: JSON.stringify({
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Your code here
        pass`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    // Your code here

};`
    }),
    timeLimit: 45
  },
  {
    title: "3Sum",
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.

**Constraints:**
- 3 <= nums.length <= 3000
- -10^5 <= nums[i] <= 10^5

**Examples:**

**Example 1:**
- Input: nums = [-1,0,1,2,-1,-4]
- Output: [[-1,-1,2],[-1,0,1]]
- Explanation:
  nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
  nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
  nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.
  The distinct triplets are [-1,0,1] and [-1,-1,2].

**Example 2:**
- Input: nums = [0,1,1]
- Output: []
- Explanation: The only possible triplet does not sum up to 0.

**Example 3:**
- Input: nums = [0,0,0]
- Output: [[0,0,0]]
- Explanation: The only possible triplet sums up to 0.`,
    difficulty: "medium",
    category: "arrays",
    companies: JSON.stringify(["Meta", "Amazon", "Microsoft", "Google", "Apple"]),
    constraints: JSON.stringify([
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5"
    ]),
    examples: JSON.stringify([
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
      { input: "nums = [0,1,1]", output: "[]" },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]" }
    ]),
    testCases: JSON.stringify([
      { input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]", isHidden: false },
      { input: "[0,1,1]", expectedOutput: "[]", isHidden: false },
      { input: "[0,0,0]", expectedOutput: "[[0,0,0]]", isHidden: false },
      { input: "[0,0,0,0]", expectedOutput: "[[0,0,0]]", isHidden: true },
      { input: "[-2,0,1,1,2]", expectedOutput: "[[-2,0,2],[-2,1,1]]", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "Sort + Two Pointers: O(n²) time, O(1) space"
    ]),
    starterCode: JSON.stringify({
      python: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        # Your code here
        pass`
    }),
    timeLimit: 45
  },
  {
    title: "Binary Tree Level Order Traversal",
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

**Constraints:**
- The number of nodes in the tree is in the range [0, 2000].
- -1000 <= Node.val <= 1000

**Examples:**

**Example 1:**
- Input: root = [3,9,20,null,null,15,7]
- Output: [[3],[9,20],[15,7]]

**Example 2:**
- Input: root = [1]
- Output: [[1]]

**Example 3:**
- Input: root = []
- Output: []`,
    difficulty: "medium",
    category: "trees",
    companies: JSON.stringify(["Meta", "Amazon", "Microsoft", "Bloomberg"]),
    constraints: JSON.stringify([
      "The number of nodes in the tree is in the range [0, 2000]",
      "-1000 <= Node.val <= 1000"
    ]),
    examples: JSON.stringify([
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "root = [1]", output: "[[1]]" },
      { input: "root = []", output: "[]" }
    ]),
    testCases: JSON.stringify([
      { input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]", isHidden: false },
      { input: "[1]", expectedOutput: "[[1]]", isHidden: false },
      { input: "[]", expectedOutput: "[]", isHidden: false },
      { input: "[1,2,3,4,5]", expectedOutput: "[[1],[2,3],[4,5]]", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "BFS with Queue: O(n) time, O(n) space",
      "DFS with level tracking: O(n) time, O(n) space"
    ]),
    starterCode: JSON.stringify({
      python: `# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def levelOrder(self, root: TreeNode) -> list[list[int]]:
        # Your code here
        pass`
    }),
    timeLimit: 45
  },
  {
    title: "Coin Change",
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.

**Constraints:**
- 1 <= coins.length <= 12
- 1 <= coins[i] <= 2^31 - 1
- 0 <= amount <= 10^4

**Examples:**

**Example 1:**
- Input: coins = [1,2,5], amount = 11
- Output: 3
- Explanation: 11 = 5 + 5 + 1

**Example 2:**
- Input: coins = [2], amount = 3
- Output: -1

**Example 3:**
- Input: coins = [1], amount = 0
- Output: 0`,
    difficulty: "medium",
    category: "dynamic-programming",
    companies: JSON.stringify(["Amazon", "Google", "Microsoft", "Apple", "Bloomberg"]),
    constraints: JSON.stringify([
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4"
    ]),
    examples: JSON.stringify([
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" }
    ]),
    testCases: JSON.stringify([
      { input: "[1,2,5]\n11", expectedOutput: "3", isHidden: false },
      { input: "[2]\n3", expectedOutput: "-1", isHidden: false },
      { input: "[1]\n0", expectedOutput: "0", isHidden: false },
      { input: "[1]\n1", expectedOutput: "1", isHidden: true },
      { input: "[1,2,5]\n100", expectedOutput: "20", isHidden: true },
      { input: "[186,419,83,408]\n6249", expectedOutput: "20", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "Bottom-up DP: O(amount * coins) time, O(amount) space",
      "Top-down with memoization: O(amount * coins) time, O(amount) space"
    ]),
    starterCode: JSON.stringify({
      python: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        # Your code here
        pass`
    }),
    timeLimit: 45
  },
  {
    title: "Number of Islands",
    description: `Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

**Constraints:**
- m == grid.length
- n == grid[i].length
- 1 <= m, n <= 300
- grid[i][j] is '0' or '1'.

**Examples:**

**Example 1:**
- Input: grid = [
    ["1","1","1","1","0"],
    ["1","1","0","1","0"],
    ["1","1","0","0","0"],
    ["0","0","0","0","0"]
  ]
- Output: 1

**Example 2:**
- Input: grid = [
    ["1","1","0","0","0"],
    ["1","1","0","0","0"],
    ["0","0","1","0","0"],
    ["0","0","0","1","1"]
  ]
- Output: 3`,
    difficulty: "medium",
    category: "graphs",
    companies: JSON.stringify(["Amazon", "Google", "Meta", "Microsoft", "Bloomberg"]),
    constraints: JSON.stringify([
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'"
    ]),
    examples: JSON.stringify([
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1" },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3" }
    ]),
    testCases: JSON.stringify([
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: "1", isHidden: false },
      { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: "3", isHidden: false },
      { input: '[["1"]]', expectedOutput: "1", isHidden: true },
      { input: '[["0"]]', expectedOutput: "0", isHidden: true },
      { input: '[["1","0","1"],["0","1","0"],["1","0","1"]]', expectedOutput: "5", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "DFS: O(m*n) time, O(m*n) space in worst case",
      "BFS: O(m*n) time, O(min(m,n)) space",
      "Union Find: O(m*n) time with path compression"
    ]),
    starterCode: JSON.stringify({
      python: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        # Your code here
        pass`
    }),
    timeLimit: 45
  },

  // HARD Problems (60 minutes)
  {
    title: "Merge K Sorted Lists",
    description: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

**Constraints:**
- k == lists.length
- 0 <= k <= 10^4
- 0 <= lists[i].length <= 500
- -10^4 <= lists[i][j] <= 10^4
- lists[i] is sorted in ascending order.
- The sum of lists[i].length will not exceed 10^4.

**Examples:**

**Example 1:**
- Input: lists = [[1,4,5],[1,3,4],[2,6]]
- Output: [1,1,2,3,4,4,5,6]
- Explanation: The linked-lists are:
  [1->4->5, 1->3->4, 2->6]
  merging them into one sorted list:
  1->1->2->3->4->4->5->6

**Example 2:**
- Input: lists = []
- Output: []

**Example 3:**
- Input: lists = [[]]
- Output: []`,
    difficulty: "hard",
    category: "linked-lists",
    companies: JSON.stringify(["Amazon", "Meta", "Google", "Microsoft", "Apple"]),
    constraints: JSON.stringify([
      "k == lists.length",
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "-10^4 <= lists[i][j] <= 10^4",
      "lists[i] is sorted in ascending order",
      "The sum of lists[i].length will not exceed 10^4"
    ]),
    examples: JSON.stringify([
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
      { input: "lists = []", output: "[]" },
      { input: "lists = [[]]", output: "[]" }
    ]),
    testCases: JSON.stringify([
      { input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]", isHidden: false },
      { input: "[]", expectedOutput: "[]", isHidden: false },
      { input: "[[]]", expectedOutput: "[]", isHidden: false },
      { input: "[[1],[2],[3]]", expectedOutput: "[1,2,3]", isHidden: true },
      { input: "[[-1,0,1],[-2,2]]", expectedOutput: "[-2,-1,0,1,2]", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "Min Heap: O(N log k) time, O(k) space",
      "Divide and Conquer: O(N log k) time, O(1) space",
      "Merge lists one by one: O(kN) time, O(1) space"
    ]),
    starterCode: JSON.stringify({
      python: `# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeKLists(self, lists: list[ListNode]) -> ListNode:
        # Your code here
        pass`
    }),
    timeLimit: 60
  },
  {
    title: "Trapping Rain Water",
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

**Constraints:**
- n == height.length
- 1 <= n <= 2 * 10^4
- 0 <= height[i] <= 10^5

**Examples:**

**Example 1:**
- Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
- Output: 6
- Explanation: The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.

**Example 2:**
- Input: height = [4,2,0,3,2,5]
- Output: 9`,
    difficulty: "hard",
    category: "arrays",
    companies: JSON.stringify(["Amazon", "Google", "Meta", "Goldman Sachs", "Microsoft"]),
    constraints: JSON.stringify([
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5"
    ]),
    examples: JSON.stringify([
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
      { input: "height = [4,2,0,3,2,5]", output: "9" }
    ]),
    testCases: JSON.stringify([
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6", isHidden: false },
      { input: "[4,2,0,3,2,5]", expectedOutput: "9", isHidden: false },
      { input: "[1,2,3,4,5]", expectedOutput: "0", isHidden: true },
      { input: "[5,4,3,2,1]", expectedOutput: "0", isHidden: true },
      { input: "[2,0,2]", expectedOutput: "2", isHidden: true },
      { input: "[3,0,0,2,0,4]", expectedOutput: "10", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "Two Pointers: O(n) time, O(1) space",
      "Dynamic Programming: O(n) time, O(n) space",
      "Stack: O(n) time, O(n) space"
    ]),
    starterCode: JSON.stringify({
      python: `class Solution:
    def trap(self, height: list[int]) -> int:
        # Your code here
        pass`
    }),
    timeLimit: 60
  },
  {
    title: "Word Ladder",
    description: `A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that:

- Every adjacent pair of words differs by a single letter.
- Every si for 1 <= i <= k is in wordList. Note that beginWord does not need to be in wordList.
- sk == endWord

Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.

**Constraints:**
- 1 <= beginWord.length <= 10
- endWord.length == beginWord.length
- 1 <= wordList.length <= 5000
- wordList[i].length == beginWord.length
- beginWord, endWord, and wordList[i] consist of lowercase English letters.
- beginWord != endWord
- All the words in wordList are unique.

**Examples:**

**Example 1:**
- Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
- Output: 5
- Explanation: One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.

**Example 2:**
- Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]
- Output: 0
- Explanation: The endWord "cog" is not in wordList, therefore there is no valid transformation sequence.`,
    difficulty: "hard",
    category: "graphs",
    companies: JSON.stringify(["Amazon", "Meta", "Google", "Microsoft", "Uber"]),
    constraints: JSON.stringify([
      "1 <= beginWord.length <= 10",
      "endWord.length == beginWord.length",
      "1 <= wordList.length <= 5000",
      "wordList[i].length == beginWord.length",
      "beginWord, endWord, and wordList[i] consist of lowercase English letters",
      "beginWord != endWord",
      "All the words in wordList are unique"
    ]),
    examples: JSON.stringify([
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5" },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: "0" }
    ]),
    testCases: JSON.stringify([
      { input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: "5", isHidden: false },
      { input: 'hit\ncog\n["hot","dot","dog","lot","log"]', expectedOutput: "0", isHidden: false },
      { input: 'a\nc\n["a","b","c"]', expectedOutput: "2", isHidden: true },
      { input: 'hot\ndog\n["hot","dog"]', expectedOutput: "0", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "BFS: O(M² * N) time where M is word length, N is wordList size",
      "Bidirectional BFS: O(M² * N) time but faster in practice"
    ]),
    starterCode: JSON.stringify({
      python: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        # Your code here
        pass`
    }),
    timeLimit: 60
  },
  {
    title: "Longest Increasing Path in a Matrix",
    description: `Given an m x n integers matrix, return the length of the longest increasing path in matrix.

From each cell, you can either move in four directions: left, right, up, or down. You may not move diagonally or move outside the boundary.

**Constraints:**
- m == matrix.length
- n == matrix[i].length
- 1 <= m, n <= 200
- 0 <= matrix[i][j] <= 2^31 - 1

**Examples:**

**Example 1:**
- Input: matrix = [[9,9,4],[6,6,8],[2,1,1]]
- Output: 4
- Explanation: The longest increasing path is [1, 2, 6, 9].

**Example 2:**
- Input: matrix = [[3,4,5],[3,2,6],[2,2,1]]
- Output: 4
- Explanation: The longest increasing path is [3, 4, 5, 6]. Moving diagonally is not allowed.

**Example 3:**
- Input: matrix = [[1]]
- Output: 1`,
    difficulty: "hard",
    category: "dynamic-programming",
    companies: JSON.stringify(["Google", "Amazon", "Meta", "Apple"]),
    constraints: JSON.stringify([
      "m == matrix.length",
      "n == matrix[i].length",
      "1 <= m, n <= 200",
      "0 <= matrix[i][j] <= 2^31 - 1"
    ]),
    examples: JSON.stringify([
      { input: "matrix = [[9,9,4],[6,6,8],[2,1,1]]", output: "4", explanation: "The longest increasing path is [1, 2, 6, 9]" },
      { input: "matrix = [[3,4,5],[3,2,6],[2,2,1]]", output: "4", explanation: "The longest increasing path is [3, 4, 5, 6]" },
      { input: "matrix = [[1]]", output: "1" }
    ]),
    testCases: JSON.stringify([
      { input: "[[9,9,4],[6,6,8],[2,1,1]]", expectedOutput: "4", isHidden: false },
      { input: "[[3,4,5],[3,2,6],[2,2,1]]", expectedOutput: "4", isHidden: false },
      { input: "[[1]]", expectedOutput: "1", isHidden: false },
      { input: "[[1,2]]", expectedOutput: "2", isHidden: true },
      { input: "[[1,2,3],[6,5,4],[7,8,9]]", expectedOutput: "9", isHidden: true }
    ]),
    solutionApproaches: JSON.stringify([
      "DFS + Memoization: O(mn) time, O(mn) space",
      "Topological Sort: O(mn) time, O(mn) space"
    ]),
    starterCode: JSON.stringify({
      python: `class Solution:
    def longestIncreasingPath(self, matrix: list[list[int]]) -> int:
        # Your code here
        pass`
    }),
    timeLimit: 60
  }
];

async function main() {
  console.log("Seeding coding problems...");

  for (const problem of codingProblems) {
    const existing = await prisma.codingProblem.findFirst({
      where: { title: problem.title }
    });

    if (existing) {
      console.log(`Skipping "${problem.title}" - already exists`);
      continue;
    }

    await prisma.codingProblem.create({
      data: problem
    });
    console.log(`Created problem: ${problem.title}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
