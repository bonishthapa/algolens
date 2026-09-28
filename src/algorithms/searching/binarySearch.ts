import type { AlgorithmDefinition } from "@/types";

export const binarySearchDef: AlgorithmDefinition = {
  metadata: {
    id: "binary-search",
    name: "Binary Search",
    category: "searching",
    description: "Efficiently finds a target in a sorted array by repeatedly halving the search range.",
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
    spaceComplexity: "O(1)",
    difficulty: "beginner",
    tags: ["searching", "divide-and-conquer", "sorted"],
    complexityExplanation: "Each comparison eliminates half the remaining elements. Starting from n, after k steps we have n/2^k elements. When n/2^k = 1, k = log₂(n). So O(log n) steps. Best case O(1): target is the middle element.",
  },
  starterCode: `// Binary Search (requires sorted array)
function binarySearch(arr, target) {
  __fn_enter__('binarySearch', arr.length, target);
  let left = 0;
  let right = arr.length - 1;

  while (__compare__(left, right, '<=')) {
    const mid = Math.floor((left + right) / 2);

    if (__compare__(arr[mid], target, '===')) {
      return __fn_exit__('binarySearch', mid); // Found!
    } else if (__compare__(arr[mid], target, '<')) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }

  return __fn_exit__('binarySearch', -1); // Not found
}

const inputArr = Array.isArray(input?.array) ? input.array : [1, 3, 5, 7, 9, 11, 13, 15];
const target = input?.target !== undefined ? input.target : 7;
const arr = __mkarray__('arr', [...inputArr]);

console.log("Array:", JSON.stringify(inputArr));
console.log("Target:", target);

const result = binarySearch(arr, target);
if (result !== -1) {
  console.log("Found at index:", result);
} else {
  console.log("Not found");
}`,
  inputSchema: {
    type: "search",
    fields: [
      { id: "array", label: "Sorted Array", type: "array", defaultValue: [1, 3, 5, 7, 9, 11, 13, 15] },
      { id: "target", label: "Target", type: "number", defaultValue: 7 },
    ],
  },
  defaultInput: { array: [1, 3, 5, 7, 9, 11, 13, 15], target: 7 },
  generateInput: (size) => {
    const arr = Array.from({ length: size }, (_, i) => i * 2 + 1);
    return { array: arr, target: arr[Math.floor(Math.random() * arr.length)] };
  },
  visualizerHints: { primaryArray: "arr", dataStructure: "array" },
};
