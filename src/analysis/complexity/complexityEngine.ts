import type { ExecutionMetrics, AlgorithmMetadata } from "@/types";

export interface ComplexityReport {
  theoretical: {
    time: { best: string; average: string; worst: string };
    space: string;
    explanation: string;
  };
  observed: {
    operations: number;
    elapsedMs: number;
    comparisons: number;
    swaps: number;
    assignments: number;
    functionCalls: number;
    loopIterations: number;
    arrayAccesses: number;
    maxRecursionDepth: number;
    allocations: number;
  };
  inputSize?: number;
}

export function buildComplexityReport(
  metadata: AlgorithmMetadata,
  metrics: ExecutionMetrics,
  inputSize?: number
): ComplexityReport {
  const operations =
    metrics.comparisons +
    metrics.swaps +
    metrics.assignments +
    metrics.arrayAccesses;

  return {
    theoretical: {
      time: metadata.timeComplexity,
      space: metadata.spaceComplexity,
      explanation: metadata.complexityExplanation ?? generateExplanation(metadata, metrics),
    },
    observed: {
      operations,
      elapsedMs: metrics.elapsedTime,
      comparisons: metrics.comparisons,
      swaps: metrics.swaps,
      assignments: metrics.assignments,
      functionCalls: metrics.functionCalls,
      loopIterations: metrics.loopIterations,
      arrayAccesses: metrics.arrayAccesses,
      maxRecursionDepth: metrics.maxRecursionDepth,
      allocations: metrics.allocations,
    },
    inputSize,
  };
}

function generateExplanation(metadata: AlgorithmMetadata, metrics: ExecutionMetrics): string {
  const worst = metadata.timeComplexity.worst;
  if (worst.includes("n²")) {
    return `This algorithm has O(n²) time complexity. The observed ${metrics.comparisons} comparisons and ${metrics.loopIterations} loop iterations reflect nested loops that each iterate approximately n times.`;
  }
  if (worst.includes("n log n")) {
    return `This algorithm has O(n log n) time complexity — characteristic of divide-and-conquer approaches. The observed ${metrics.functionCalls} recursive calls and ${metrics.comparisons} comparisons reflect logarithmic depth with linear work at each level.`;
  }
  if (worst.includes("log n")) {
    return `This algorithm has O(log n) time complexity. Each step eliminates half the remaining search space, requiring only ${metrics.comparisons} comparisons total.`;
  }
  if (worst.includes("2ⁿ") || worst.includes("2^n")) {
    return `This algorithm has exponential O(2ⁿ) time complexity. Each call branches into two recursive calls, creating a tree with ${metrics.functionCalls} total function calls.`;
  }
  return `Complexity: ${worst}. Observed: ${metrics.comparisons} comparisons, ${metrics.functionCalls} function calls, ${metrics.loopIterations} loop iterations.`;
}

// Reference complexity curves for performance graphs
export interface ReferenceCurve {
  name: string;
  fn: (n: number) => number;
  color: string;
}

export const REFERENCE_CURVES: ReferenceCurve[] = [
  { name: "O(1)", fn: () => 1, color: "#22c55e" },
  { name: "O(log n)", fn: (n) => Math.log2(n), color: "#3b82f6" },
  { name: "O(n)", fn: (n) => n, color: "#a855f7" },
  { name: "O(n log n)", fn: (n) => n * Math.log2(n), color: "#f59e0b" },
  { name: "O(n²)", fn: (n) => n * n, color: "#ef4444" },
];

export function normalizeForChart(
  dataPoints: { x: number; y: number }[],
  maxY = 1000
): { x: number; y: number }[] {
  if (!dataPoints.length) return [];
  const maxVal = Math.max(...dataPoints.map(p => p.y));
  if (maxVal === 0) return dataPoints.map(p => ({ ...p, y: 0 }));
  return dataPoints.map(p => ({ x: p.x, y: (p.y / maxVal) * maxY }));
}
