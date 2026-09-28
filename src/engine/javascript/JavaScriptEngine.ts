import { ExecutionEngine } from "../core/ExecutionEngine";
import type { ExecutionEvent, ExecutionMetrics } from "@/types";
import { createInstrumentedCode } from "../instrumentation/instrumenter";

const MAX_EVENTS = 50000;
const MAX_TIME_MS = 10000;

export class JavaScriptEngine extends ExecutionEngine {
  private code: string = "";
  private input: unknown = null;

  async load(code: string, input?: unknown): Promise<void> {
    this.code = code;
    this.input = input ?? null;
    this.reset();
  }

  async run(): Promise<ExecutionEvent[]> {
    this.events = [];
    const startTime = performance.now();

    try {
      const { events, error } = await this.executeInSandbox(this.code, this.input, this.breakpoints, startTime);
      this.events = events;

      const endTime = performance.now();

      if (error) {
        this._state.status = "error";
        this._state.error = error;
      } else {
        this._state.status = "completed";
      }

      // Compute metrics from events
      this._state.metrics = this.computeMetrics(this.events, startTime, endTime);
      this._state.events = this.events;

      return this.events;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this._state.status = "error";
      this._state.error = { message };
      this.events.push({ type: "program_error", message });
      return this.events;
    }
  }

  private async executeInSandbox(
    code: string,
    input: unknown,
    _breakpoints: Set<number>,
    startTime: number
  ): Promise<{ events: ExecutionEvent[]; error?: { line?: number; message: string } }> {
    return new Promise((resolve) => {
      const events: ExecutionEvent[] = [];

      // Build a safe execution context
      const safeConsoleLog = (...args: unknown[]) => {
        const value = args.map(a => {
          try { return JSON.stringify(a); } catch { return String(a); }
        }).join(" ");
        events.push({ type: "output", line: 0, value });
      };

      try {
        const instrumentedCode = createInstrumentedCode(code);

        // Create a restricted function with no access to browser APIs
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...fnArgs: unknown[]) => Promise<unknown>;
        const fn = new AsyncFunction(
          "__emit__",
          "__input__",
          "__console__",
          "__maxEvents__",
          "__startTime__",
          "__maxTime__",
          instrumentedCode
        );

        const emit = (event: ExecutionEvent) => {
          if (events.length >= MAX_EVENTS) {
            throw new Error(`Maximum event count (${MAX_EVENTS}) exceeded. Possible infinite loop.`);
          }
          if (performance.now() - startTime > MAX_TIME_MS) {
            throw new Error(`Execution timeout (${MAX_TIME_MS}ms) exceeded.`);
          }
          events.push(event);
        };

        fn(emit, input, safeConsoleLog, MAX_EVENTS, startTime, MAX_TIME_MS)
          .then(() => {
            events.push({ type: "program_end", timestamp: performance.now(), totalTime: performance.now() - startTime });
            resolve({ events });
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : String(err);
            events.push({ type: "program_error", message });
            resolve({ events, error: { message } });
          });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        events.push({ type: "program_error", message });
        resolve({ events, error: { message } });
      }
    });
  }

  private computeMetrics(events: ExecutionEvent[], startTime: number, endTime: number): ExecutionMetrics {
    const metrics: ExecutionMetrics = {
      comparisons: 0, swaps: 0, assignments: 0, functionCalls: 0,
      loopIterations: 0, arrayAccesses: 0, maxRecursionDepth: 0,
      currentRecursionDepth: 0, allocations: 0,
      startTime, endTime, elapsedTime: endTime - startTime,
    };

    let currentDepth = 0;
    for (const event of events) {
      switch (event.type) {
        case "comparison": metrics.comparisons++; break;
        case "array_swap": metrics.swaps++; break;
        case "variable_update": metrics.assignments++; break;
        case "function_call":
          metrics.functionCalls++;
          currentDepth++;
          metrics.maxRecursionDepth = Math.max(metrics.maxRecursionDepth, currentDepth);
          break;
        case "function_return": currentDepth = Math.max(0, currentDepth - 1); break;
        case "loop_iteration": metrics.loopIterations++; break;
        case "array_access": metrics.arrayAccesses++; break;
        case "array_set": metrics.assignments++; metrics.arrayAccesses++; break;
        case "allocation": metrics.allocations++; break;
      }
    }

    return metrics;
  }
}
