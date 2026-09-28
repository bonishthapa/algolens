import type { AlgorithmDefinition } from "@/types";

export const mergeSortDef: AlgorithmDefinition = {
  metadata: {
    id: "merge-sort",
    name: "Merge Sort",
    category: "sorting",
    description: "A divide-and-conquer algorithm that divides the array in half, sorts each half, then merges them back together.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(n)",
    stable: true,
    inPlace: false,
    difficulty: "intermediate",
    tags: ["sorting", "divide-and-conquer", "recursive", "stable"],
    complexityExplanation: "The array is divided log(n) times (each halving). At each level, all n elements are processed for merging. So: log(n) levels × n work per level = O(n log n). This holds for all cases.",
  },
  starterCode: `// Merge Sort
function mergeSort(arr) {
  __fn_enter__('mergeSort', arr.length);
  if (arr.length <= 1) return __fn_exit__('mergeSort', arr);

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return __fn_exit__('mergeSort', merge(left, right));
}

function merge(left, right) {
  __fn_enter__('merge', left.length, right.length);
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (__compare__(left[i], right[j], '<=')) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);

  return __fn_exit__('merge', result);
}

const rawInput = Array.isArray(input) ? input : [38, 27, 43, 3, 9, 82, 10];
const arr = __mkarray__('arr', [...rawInput]);
console.log("Input:", JSON.stringify([...rawInput]));
const sorted = mergeSort([...arr]);
console.log("Sorted:", JSON.stringify(sorted));`,
  inputSchema: {
    type: "array",
    fields: [{ id: "array", label: "Array", type: "array", defaultValue: [38, 27, 43, 3, 9, 82, 10] }],
  },
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  generateInput: (size) => ({ array: Array.from({ length: size }, () => Math.floor(Math.random() * 1000)) }),
  visualizerHints: { primaryArray: "arr", dataStructure: "array", showRecursionTree: true },
};
