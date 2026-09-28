import type { AlgorithmDefinition } from "@/types";

export const linearSearchDef: AlgorithmDefinition = {
  metadata: {
    id: "linear-search",
    name: "Linear Search",
    category: "searching",
    description: "Sequentially checks each element of the array until a match is found or all elements have been checked.",
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
    difficulty: "beginner",
    tags: ["searching", "sequential"],
    complexityExplanation: "Best case O(1): target is the first element. Average O(n): target is in the middle. Worst case O(n): target is last or not present — must check all n elements.",
  },
  starterCode: `// Linear Search
function linearSearch(arr, target) {
  __fn_enter__('linearSearch', arr.length, target);
  for (let i = 0; i < arr.length; i++) {
    __loop__('search', i, { i });
    if (__compare__(arr[i], target, '===')) {
      return __fn_exit__('linearSearch', i); // Found at index i
    }
  }
  return __fn_exit__('linearSearch', -1); // Not found
}

const inputArr = Array.isArray(input?.array) ? input.array : [2, 4, 7, 10, 15, 23, 31];
const target = input?.target !== undefined ? input.target : 15;
const arr = __mkarray__('arr', [...inputArr]);

console.log("Array:", JSON.stringify(inputArr));
console.log("Target:", target);

const result = linearSearch(arr, target);
if (result !== -1) {
  console.log("Found at index:", result);
} else {
  console.log("Not found");
}`,
  inputSchema: {
    type: "search",
    fields: [
      { id: "array", label: "Array", type: "array", defaultValue: [2, 4, 7, 10, 15, 23, 31] },
      { id: "target", label: "Target", type: "number", defaultValue: 15 },
    ],
  },
  defaultInput: { array: [2, 4, 7, 10, 15, 23, 31], target: 15 },
  generateInput: (size) => ({
    array: Array.from({ length: size }, (_, i) => i * 2 + 1),
    target: Math.floor(Math.random() * size) * 2 + 1,
  }),
  visualizerHints: { primaryArray: "arr", dataStructure: "array" },
};
