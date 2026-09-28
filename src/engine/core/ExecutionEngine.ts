import type { ExecutionEvent, ExecutionState } from "@/types";

export abstract class ExecutionEngine {
  protected events: ExecutionEvent[] = [];
  protected breakpoints: Set<number> = new Set();
  protected _state: ExecutionState;

  constructor() {
    this._state = this.createInitialState();
  }

  protected createInitialState(): ExecutionState {
    return {
      status: "idle",
      currentEventIndex: -1,
      currentLine: undefined,
      variables: {},
      callStack: [],
      events: [],
      metrics: {
        comparisons: 0, swaps: 0, assignments: 0, functionCalls: 0,
        loopIterations: 0, arrayAccesses: 0, maxRecursionDepth: 0,
        currentRecursionDepth: 0, allocations: 0,
        startTime: 0, elapsedTime: 0,
      },
      elapsedTime: 0,
      breakpoints: new Set(),
      output: [],
    };
  }

  abstract load(code: string, input?: unknown): Promise<void>;
  abstract run(): Promise<ExecutionEvent[]>;

  getState(): ExecutionState { return this._state; }
  getEvents(): ExecutionEvent[] { return this.events; }

  setBreakpoint(line: number): void { this.breakpoints.add(line); }
  removeBreakpoint(line: number): void { this.breakpoints.delete(line); }
  clearBreakpoints(): void { this.breakpoints.clear(); }
  hasBreakpoint(line: number): boolean { return this.breakpoints.has(line); }

  reset(): void {
    this.events = [];
    this._state = this.createInitialState();
    this._state.breakpoints = this.breakpoints;
  }

  protected emitEvent(event: ExecutionEvent): void {
    this.events.push(event);
  }
}
