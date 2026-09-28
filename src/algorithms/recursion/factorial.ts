import type { AlgorithmDefinition } from "@/types";

export const factorialDef: AlgorithmDefinition = {
  metadata: {
    id: "factorial",
    name: "Factorial (Recursive)",
    category: "recursion",
    description: "Computes n! recursively. A simple introduction to recursion and call stacks.",
    timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(n)",
    difficulty: "beginner",
    tags: ["recursion", "math"],
    complexityExplanation: "Each recursive call reduces n by 1, so there are n calls total. The call stack uses O(n) space for n active frames.",
  },
  starterCode: `// Factorial - Recursive
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

const n = typeof input === 'number' ? input : 6;
console.log("Computing " + n + "!...");
const result = factorial(n);
console.log(n + "! =", result);`,
  inputSchema: {
    type: "number",
    fields: [{ id: "n", label: "n", type: "number", defaultValue: 6 }],
  },
  defaultInput: 6,
  generateInput: (size) => ({ n: Math.min(10, Math.floor(Math.log2(size)) + 5) }),
  visualizerHints: { showRecursionTree: true },
};
