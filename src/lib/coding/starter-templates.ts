// Language-specific starter code templates

import { SupportedLanguage, ProblemCategory } from "./constants";

/**
 * Get starter code template for a given language and problem type
 */
export function getStarterTemplate(
  language: SupportedLanguage,
  problemTitle: string,
  category: ProblemCategory
): string {
  const templates: Record<SupportedLanguage, string> = {
    python: getPythonTemplate(problemTitle, category),
    javascript: getJavaScriptTemplate(problemTitle, category),
    java: getJavaTemplate(problemTitle, category),
    cpp: getCppTemplate(problemTitle, category),
    c: getCTemplate(problemTitle, category),
    csharp: getCSharpTemplate(problemTitle, category),
    go: getGoTemplate(problemTitle, category),
  };

  return templates[language];
}

function getPythonTemplate(title: string, category: ProblemCategory): string {
  const functionName = toSnakeCase(title);

  const categoryTemplates: Partial<Record<ProblemCategory, string>> = {
    "linked-lists": `# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def ${functionName}(self, head: ListNode) -> ListNode:
        # Your code here
        pass
`,
    "trees": `# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def ${functionName}(self, root: TreeNode) -> any:
        # Your code here
        pass
`,
    "graphs": `from collections import defaultdict, deque
from typing import List

class Solution:
    def ${functionName}(self, n: int, edges: List[List[int]]) -> any:
        # Build adjacency list
        graph = defaultdict(list)
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)

        # Your code here
        pass
`,
  };

  return categoryTemplates[category] || `from typing import List, Optional

class Solution:
    def ${functionName}(self, nums: List[int]) -> any:
        # Your code here
        pass
`;
}

function getJavaScriptTemplate(title: string, category: ProblemCategory): string {
  const functionName = toCamelCase(title);

  const categoryTemplates: Partial<Record<ProblemCategory, string>> = {
    "linked-lists": `/**
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
var ${functionName} = function(head) {
    // Your code here

};
`,
    "trees": `/**
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
var ${functionName} = function(root) {
    // Your code here

};
`,
  };

  return categoryTemplates[category] || `/**
 * @param {number[]} nums
 * @return {*}
 */
var ${functionName} = function(nums) {
    // Your code here

};
`;
}

function getJavaTemplate(title: string, category: ProblemCategory): string {
  const className = toPascalCase(title);
  const methodName = toCamelCase(title);

  const categoryTemplates: Partial<Record<ProblemCategory, string>> = {
    "linked-lists": `/**
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
    public ListNode ${methodName}(ListNode head) {
        // Your code here
        return null;
    }
}
`,
    "trees": `/**
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
    public Object ${methodName}(TreeNode root) {
        // Your code here
        return null;
    }
}
`,
  };

  return categoryTemplates[category] || `import java.util.*;

class Solution {
    public int[] ${methodName}(int[] nums) {
        // Your code here
        return new int[0];
    }
}
`;
}

function getCppTemplate(title: string, category: ProblemCategory): string {
  const functionName = toCamelCase(title);

  const categoryTemplates: Partial<Record<ProblemCategory, string>> = {
    "linked-lists": `/**
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
    ListNode* ${functionName}(ListNode* head) {
        // Your code here
        return nullptr;
    }
};
`,
    "trees": `/**
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
    void ${functionName}(TreeNode* root) {
        // Your code here
    }
};
`,
  };

  return categoryTemplates[category] || `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> ${functionName}(vector<int>& nums) {
        // Your code here
        return {};
    }
};
`;
}

function getCTemplate(title: string, category: ProblemCategory): string {
  const functionName = toSnakeCase(title);

  return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* ${functionName}(int* nums, int numsSize, int* returnSize) {
    // Your code here
    *returnSize = 0;
    return NULL;
}
`;
}

function getCSharpTemplate(title: string, category: ProblemCategory): string {
  const methodName = toPascalCase(title);

  const categoryTemplates: Partial<Record<ProblemCategory, string>> = {
    "linked-lists": `/**
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
    public ListNode ${methodName}(ListNode head) {
        // Your code here
        return null;
    }
}
`,
    "trees": `/**
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
    public object ${methodName}(TreeNode root) {
        // Your code here
        return null;
    }
}
`,
  };

  return categoryTemplates[category] || `using System;
using System.Collections.Generic;

public class Solution {
    public int[] ${methodName}(int[] nums) {
        // Your code here
        return new int[0];
    }
}
`;
}

function getGoTemplate(title: string, category: ProblemCategory): string {
  const functionName = toCamelCase(title);

  const categoryTemplates: Partial<Record<ProblemCategory, string>> = {
    "linked-lists": `/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func ${functionName}(head *ListNode) *ListNode {
    // Your code here
    return nil
}
`,
    "trees": `/**
 * Definition for a binary tree node.
 * type TreeNode struct {
 *     Val int
 *     Left *TreeNode
 *     Right *TreeNode
 * }
 */
func ${functionName}(root *TreeNode) interface{} {
    // Your code here
    return nil
}
`,
  };

  return categoryTemplates[category] || `func ${functionName}(nums []int) []int {
    // Your code here
    return nil
}
`;
}

// Helper functions to convert title to various case styles
function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^./, (char) => char.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

function toPascalCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^./, (char) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * Generate all starter code templates for a problem
 */
export function getAllStarterTemplates(
  problemTitle: string,
  category: ProblemCategory
): Record<SupportedLanguage, string> {
  const languages: SupportedLanguage[] = [
    "python",
    "javascript",
    "java",
    "cpp",
    "c",
    "csharp",
    "go",
  ];

  const templates: Record<string, string> = {};
  for (const lang of languages) {
    templates[lang] = getStarterTemplate(lang, problemTitle, category);
  }

  return templates as Record<SupportedLanguage, string>;
}
