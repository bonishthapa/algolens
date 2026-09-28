import type { AlgorithmDefinition } from "@/types";

export const quickSortDef: AlgorithmDefinition = {
  metadata: {
    id: "quick-sort",
    name: "Quick Sort",
    category: "sorting",
    description: "A divide-and-conquer algorithm that selects a pivot element and partitions the array around it.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
    spaceComplexity: "O(log n)",
    stable: false,
    inPlace: true,
    difficulty: "intermediate",
    tags: ["sorting", "divide-and-conquer", "recursive", "in-place"],
    complexityExplanation: "Average case O(n log n): good pivot choices split the array roughly in half each time, giving log(n) levels with n work each. Worst case O(n²): choosing the smallest/largest as pivot (e.g., sorted array with naive pivot) gives n levels.",
  },
  starterCode: `// Quick Sort
function quickSort(arr, low, high) {
  if (low === undefined) low = 0;
  if (high === undefined) high = arr.length - 1;
  __fn_enter__('quickSort', low, high);
  if (low < high) {
    const pivotIdx = partition(arr, low, high);
    quickSort(arr, low, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, high);
  }
  return __fn_exit__('quickSort', arr);
}

function partition(arr, low, high) {
  __fn_enter__('partition', low, high);
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (__compare__(arr[j], pivot, '<=')) {
      i++;
      __markswap__('arr', i, j);
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }

  __markswap__('arr', i + 1, high);
  let temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;

  return __fn_exit__('partition', i + 1);
}

const rawInput = Array.isArray(input) ? input : [10, 80, 30, 90, 40, 50, 70];
const arr = __mkarray__('arr', [...rawInput]);
console.log("Input:", JSON.stringify([...rawInput]));
quickSort(arr, 0, arr.length - 1);
console.log("Sorted:", JSON.stringify([...arr]));`,
  inputSchema: {
    type: "array",
    fields: [{ id: "array", label: "Array", type: "array", defaultValue: [10, 80, 30, 90, 40, 50, 70] }],
  },
  defaultInput: [10, 80, 30, 90, 40, 50, 70],
  generateInput: (size) => ({ array: Array.from({ length: size }, () => Math.floor(Math.random() * 1000)) }),
  visualizerHints: { primaryArray: "arr", dataStructure: "array", showRecursionTree: true },
};
