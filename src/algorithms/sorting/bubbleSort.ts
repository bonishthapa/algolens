import type { AlgorithmDefinition } from "@/types";

export const bubbleSortDef: AlgorithmDefinition = {
  metadata: {
    id: "bubble-sort",
    name: "Bubble Sort",
    category: "sorting",
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
    stable: true,
    inPlace: true,
    difficulty: "beginner",
    tags: ["sorting", "comparison", "in-place", "stable"],
    complexityExplanation: "The outer loop runs n times. The inner loop runs up to n times for each outer iteration. Thus O(n²). In the best case (already sorted), an optimized version can detect no swaps occurred and stop early — O(n).",
  },
  starterCode: `// Bubble Sort
// __mkarray__ creates a tracked array so the visualizer can animate each swap.
function bubbleSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements
      if (__compare__(arr[j], arr[j + 1], '>')) {
        // Swap
        __markswap__('arr', j, j + 1);
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
      }
    }

    // If no swap occurred, array is already sorted
    if (!swapped) break;
  }

  return arr;
}

const rawInput = Array.isArray(input) ? input : [64, 34, 25, 12, 22, 11, 90];
const arr = __mkarray__('arr', [...rawInput]);
console.log("Input:", JSON.stringify([...rawInput]));
bubbleSort(arr);
console.log("Sorted:", JSON.stringify([...arr]));`,
  inputSchema: {
    type: "array",
    fields: [{ id: "array", label: "Array", type: "array", defaultValue: [64, 34, 25, 12, 22, 11, 90] }],
  },
  defaultInput: [64, 34, 25, 12, 22, 11, 90],
  generateInput: (size) => ({ array: Array.from({ length: size }, () => Math.floor(Math.random() * 1000)) }),
  visualizerHints: { primaryArray: "arr", dataStructure: "array" },
};
