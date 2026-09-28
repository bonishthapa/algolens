import type { AlgorithmDefinition } from "@/types";

export const insertionSortDef: AlgorithmDefinition = {
  metadata: {
    id: "insertion-sort",
    name: "Insertion Sort",
    category: "sorting",
    description: "Builds the sorted array one element at a time by inserting each element into its correct position.",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
    stable: true,
    inPlace: true,
    difficulty: "beginner",
    tags: ["sorting", "comparison", "in-place", "stable", "adaptive"],
    complexityExplanation: "Best case O(n): when array is already sorted, each element only needs one comparison. Worst case O(n²): reverse-sorted array requires shifting all previous elements for each insertion.",
  },
  starterCode: `// Insertion Sort
function insertionSort(arr) {
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;

    while (j >= 0 && __compare__(arr[j], key, '>')) {
      arr[j + 1] = arr[j];
      j--;
    }

    arr[j + 1] = key;
  }

  return arr;
}

const rawInput = Array.isArray(input) ? input : [12, 11, 13, 5, 6];
const arr = __mkarray__('arr', [...rawInput]);
console.log("Input:", JSON.stringify([...rawInput]));
insertionSort(arr);
console.log("Sorted:", JSON.stringify([...arr]));`,
  inputSchema: {
    type: "array",
    fields: [{ id: "array", label: "Array", type: "array", defaultValue: [12, 11, 13, 5, 6] }],
  },
  defaultInput: [12, 11, 13, 5, 6],
  generateInput: (size) => ({ array: Array.from({ length: size }, () => Math.floor(Math.random() * 1000)) }),
  visualizerHints: { primaryArray: "arr", dataStructure: "array" },
};
