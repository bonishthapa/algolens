export * from "./sorting/bubbleSort";
export * from "./sorting/selectionSort";
export * from "./sorting/insertionSort";
export * from "./sorting/mergeSort";
export * from "./sorting/quickSort";
export * from "./searching/linearSearch";
export * from "./searching/binarySearch";
export * from "./recursion/fibonacci";
export * from "./recursion/factorial";

import type { AlgorithmDefinition } from "@/types";
import { bubbleSortDef } from "./sorting/bubbleSort";
import { selectionSortDef } from "./sorting/selectionSort";
import { insertionSortDef } from "./sorting/insertionSort";
import { mergeSortDef } from "./sorting/mergeSort";
import { quickSortDef } from "./sorting/quickSort";
import { linearSearchDef } from "./searching/linearSearch";
import { binarySearchDef } from "./searching/binarySearch";
import { fibonacciDef } from "./recursion/fibonacci";
import { factorialDef } from "./recursion/factorial";

export const ALL_ALGORITHMS: AlgorithmDefinition[] = [
  bubbleSortDef as AlgorithmDefinition,
  selectionSortDef as AlgorithmDefinition,
  insertionSortDef as AlgorithmDefinition,
  mergeSortDef as AlgorithmDefinition,
  quickSortDef as AlgorithmDefinition,
  linearSearchDef as AlgorithmDefinition,
  binarySearchDef as AlgorithmDefinition,
  fibonacciDef as AlgorithmDefinition,
  factorialDef as AlgorithmDefinition,
];

export const ALGORITHM_MAP = new Map<string, AlgorithmDefinition>(
  ALL_ALGORITHMS.map(a => [a.metadata.id, a])
);

export function getAlgorithm(id: string): AlgorithmDefinition | undefined {
  return ALGORITHM_MAP.get(id);
}

export const ALGORITHM_CATEGORIES = [
  { id: "sorting", name: "Sorting", algorithms: ALL_ALGORITHMS.filter(a => a.metadata.category === "sorting") },
  { id: "searching", name: "Searching", algorithms: ALL_ALGORITHMS.filter(a => a.metadata.category === "searching") },
  { id: "recursion", name: "Recursion", algorithms: ALL_ALGORITHMS.filter(a => a.metadata.category === "recursion") },
];
