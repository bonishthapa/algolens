import { describe, it, expect } from "vitest";
import { JavaScriptEngine } from "@/engine/javascript/JavaScriptEngine";
import { bubbleSortDef } from "@/algorithms/sorting/bubbleSort";
import { selectionSortDef } from "@/algorithms/sorting/selectionSort";
import { insertionSortDef } from "@/algorithms/sorting/insertionSort";
import { mergeSortDef } from "@/algorithms/sorting/mergeSort";
import { quickSortDef } from "@/algorithms/sorting/quickSort";
import { linearSearchDef } from "@/algorithms/searching/linearSearch";
import { binarySearchDef } from "@/algorithms/searching/binarySearch";
import { fibonacciDef } from "@/algorithms/recursion/fibonacci";
import { factorialDef } from "@/algorithms/recursion/factorial";

async function runAlgorithmAndGetOutput(
  code: string,
  input: unknown
): Promise<{ output: string[]; error?: string; metrics: { comparisons: number; swaps: number } }> {
  const engine = new JavaScriptEngine();
  await engine.load(code, input);
  const events = await engine.run();

  const output = events
    .filter(e => e.type === "output")
    .map(e => e.type === "output" ? e.value : "");

  const errorEvent = events.find(e => e.type === "program_error");
  const metrics = engine.getState().metrics;

  return {
    output,
    error: errorEvent?.type === "program_error" ? errorEvent.message : undefined,
    metrics: { comparisons: metrics.comparisons, swaps: metrics.swaps },
  };
}

describe("Bubble Sort", () => {
  it("sorts a random array", async () => {
    const result = await runAlgorithmAndGetOutput(
      bubbleSortDef.starterCode,
      [5, 2, 8, 1, 9, 3]
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("1"))).toBe(true);
    expect(result.output.some(o => o.includes("Sorted"))).toBe(true);
  });

  it("handles already sorted array", async () => {
    const result = await runAlgorithmAndGetOutput(
      bubbleSortDef.starterCode,
      [1, 2, 3, 4, 5]
    );
    expect(result.error).toBeUndefined();
    // Already sorted: 0 swaps expected
    expect(result.metrics.swaps).toBe(0);
  });

  it("handles single element", async () => {
    const result = await runAlgorithmAndGetOutput(
      bubbleSortDef.starterCode,
      [42]
    );
    expect(result.error).toBeUndefined();
  });
});

describe("Selection Sort", () => {
  it("sorts correctly", async () => {
    const result = await runAlgorithmAndGetOutput(
      selectionSortDef.starterCode,
      [3, 1, 4, 1, 5, 9, 2, 6]
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("Sorted"))).toBe(true);
  });
});

describe("Insertion Sort", () => {
  it("sorts correctly", async () => {
    const result = await runAlgorithmAndGetOutput(
      insertionSortDef.starterCode,
      [12, 11, 13, 5, 6]
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("Sorted"))).toBe(true);
  });
});

describe("Merge Sort", () => {
  it("sorts correctly", async () => {
    const result = await runAlgorithmAndGetOutput(
      mergeSortDef.starterCode,
      [38, 27, 43, 3, 9, 82, 10]
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("Sorted"))).toBe(true);
  });

  it("has function call events", async () => {
    const engine = new JavaScriptEngine();
    await engine.load(mergeSortDef.starterCode, [5, 3, 1]);
    const events = await engine.run();
    expect(events.some(e => e.type === "function_call")).toBe(true);
  });
});

describe("Quick Sort", () => {
  it("sorts correctly", async () => {
    const result = await runAlgorithmAndGetOutput(
      quickSortDef.starterCode,
      [10, 80, 30, 90, 40, 50, 70]
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("Sorted"))).toBe(true);
  });
});

describe("Linear Search", () => {
  it("finds an element", async () => {
    const result = await runAlgorithmAndGetOutput(
      linearSearchDef.starterCode,
      { array: [2, 4, 7, 10, 15, 23], target: 10 }
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("Found"))).toBe(true);
  });

  it("handles missing element", async () => {
    const result = await runAlgorithmAndGetOutput(
      linearSearchDef.starterCode,
      { array: [1, 2, 3, 4, 5], target: 99 }
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("Not found"))).toBe(true);
  });
});

describe("Binary Search", () => {
  it("finds an element in sorted array", async () => {
    const result = await runAlgorithmAndGetOutput(
      binarySearchDef.starterCode,
      { array: [1, 3, 5, 7, 9, 11, 13], target: 7 }
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("Found"))).toBe(true);
  });

  it("uses fewer comparisons than linear search for sorted data", async () => {
    const arr = Array.from({ length: 20 }, (_, i) => i * 2 + 1);
    const target = 31;

    const linearResult = await runAlgorithmAndGetOutput(
      linearSearchDef.starterCode,
      { array: arr, target }
    );
    const binaryResult = await runAlgorithmAndGetOutput(
      binarySearchDef.starterCode,
      { array: arr, target }
    );

    // Binary search should use fewer comparisons
    expect(binaryResult.metrics.comparisons).toBeLessThan(linearResult.metrics.comparisons);
  });
});

describe("Fibonacci", () => {
  it("computes fib(8) = 21", async () => {
    const result = await runAlgorithmAndGetOutput(
      fibonacciDef.starterCode,
      8
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("21"))).toBe(true);
  });

  it("has recursive function calls", async () => {
    const engine = new JavaScriptEngine();
    await engine.load(fibonacciDef.starterCode, 5);
    const events = await engine.run();
    const callCount = events.filter(e => e.type === "function_call").length;
    expect(callCount).toBeGreaterThan(1);
  });
});

describe("Factorial", () => {
  it("computes 6! = 720", async () => {
    const result = await runAlgorithmAndGetOutput(
      factorialDef.starterCode,
      6
    );
    expect(result.error).toBeUndefined();
    expect(result.output.some(o => o.includes("720"))).toBe(true);
  });
});
