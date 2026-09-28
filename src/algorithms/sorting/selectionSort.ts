import type { AlgorithmDefinition } from "@/types";

export const selectionSortDef: AlgorithmDefinition = {
  metadata: {
    id: "selection-sort",
    name: "Selection Sort",
    category: "sorting",
    description: "Divides the input into a sorted and unsorted region. Repeatedly selects the smallest element from the unsorted region and moves it to the sorted region.",
    timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
    stable: false,
    inPlace: true,
    difficulty: "beginner",
    tags: ["sorting", "comparison", "in-place"],
    complexityExplanation: "Regardless of input order, the algorithm always performs n(n-1)/2 comparisons — the outer loop runs n times, and the inner loop starts from i+1 each time. This is always O(n²).",
  },
  starterCode: `// Selection Sort
function selectionSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      if (__compare__(arr[j], arr[minIdx], '<')) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      __markswap__('arr', i, minIdx);
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
    }
  }

  return arr;
}

const rawInput = Array.isArray(input) ? input : [64, 25, 12, 22, 11];
const arr = __mkarray__('arr', [...rawInput]);
console.log("Input:", JSON.stringify([...rawInput]));
selectionSort(arr);
console.log("Sorted:", JSON.stringify([...arr]));`,
  inputSchema: {
    type: "array",
    fields: [{ id: "array", label: "Array", type: "array", defaultValue: [64, 25, 12, 22, 11] }],
  },
  defaultInput: [64, 25, 12, 22, 11],
  generateInput: (size) => ({ array: Array.from({ length: size }, () => Math.floor(Math.random() * 1000)) }),
  visualizerHints: { primaryArray: "arr", dataStructure: "array" },
};
