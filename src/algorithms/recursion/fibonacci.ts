import type { AlgorithmDefinition } from "@/types";

export const fibonacciDef: AlgorithmDefinition = {
  metadata: {
    id: "fibonacci",
    name: "Fibonacci (Recursive)",
    category: "recursion",
    description: "Computes the nth Fibonacci number using naive recursion to illustrate recursive call trees.",
    timeComplexity: { best: "O(2ⁿ)", average: "O(2ⁿ)", worst: "O(2ⁿ)" },
    spaceComplexity: "O(n)",
    difficulty: "beginner",
    tags: ["recursion", "dynamic-programming", "tree-recursion"],
    complexityExplanation: "Each call to fib(n) makes two recursive calls: fib(n-1) and fib(n-2). This creates a binary recursion tree with approximately 2ⁿ nodes. Space complexity is O(n) for the call stack depth.",
  },
  starterCode: `// Fibonacci - Recursive
// WARNING: Exponential time complexity for large n!
// Great for visualizing recursion trees.

function fib(n) {
  __fn_enter__('fib', n);
  if (n <= 1) return __fn_exit__('fib', n);

  const left = fib(n - 1);
  const right = fib(n - 2);

  return __fn_exit__('fib', left + right);
}

const n = typeof input === 'number' ? input : 8;
console.log("Computing fib(" + n + ")...");
const result = fib(n);
console.log("fib(" + n + ") =", result);`,
  inputSchema: {
    type: "number",
    fields: [{ id: "n", label: "n (keep ≤ 15 for performance)", type: "number", defaultValue: 8 }],
  },
  defaultInput: 8,
  generateInput: (size) => ({ n: Math.min(Math.floor(Math.log2(size)) + 5, 15) }),
  visualizerHints: { showRecursionTree: true },
};
