import type { AlgorithmDefinition, PerformanceDataPoint } from "@/types";
import { JavaScriptEngine } from "@/engine/javascript/JavaScriptEngine";

const PERFORMANCE_INPUT_SIZES = [10, 50, 100, 500, 1000];

export async function runPerformanceExperiment(
  algorithm: AlgorithmDefinition,
  inputSizes: number[] = PERFORMANCE_INPUT_SIZES
): Promise<PerformanceDataPoint[]> {
  const results: PerformanceDataPoint[] = [];

  for (const size of inputSizes) {
    const input = algorithm.generateInput
      ? algorithm.generateInput(size)
      : { size };

    const engine = new JavaScriptEngine();
    const inputValue = Array.isArray(input) ? input : (input as Record<string, unknown>).array ?? input;
    await engine.load(algorithm.starterCode, inputValue);

    await engine.run();
    const metrics = engine.getState().metrics;

    const operations =
      metrics.comparisons + metrics.swaps + metrics.assignments + metrics.arrayAccesses;

    results.push({
      inputSize: size,
      operations,
      timeMs: metrics.elapsedTime,
      algorithmId: algorithm.metadata.id,
    });
  }

  return results;
}
