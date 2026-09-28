import { create } from "zustand";
import type { ExecutionEvent, ExecutionMetrics, ArrayVisualizationState, ArrayElement, CallFrame } from "@/types";

interface EventStore {
  events: ExecutionEvent[];
  currentEventIndex: number;

  // Derived state computed from events up to currentEventIndex
  currentLine?: number;
  variables: Record<string, unknown>;
  callStack: CallFrame[];
  arrayStates: Map<string, ArrayVisualizationState>;
  output: string[];
  metrics: ExecutionMetrics;
  changedVars: Set<string>;

  setEvents(events: ExecutionEvent[]): void;
  seekToEvent(index: number): void;
  seekToNext(): void;
  seekToPrev(): void;
  seekToStart(): void;
  seekToEnd(): void;
  reset(): void;
}

function createEmptyMetrics(): ExecutionMetrics {
  return {
    comparisons: 0, swaps: 0, assignments: 0, functionCalls: 0,
    loopIterations: 0, arrayAccesses: 0, maxRecursionDepth: 0,
    currentRecursionDepth: 0, allocations: 0,
    startTime: 0, elapsedTime: 0,
  };
}

function replayEvents(events: ExecutionEvent[], upToIndex: number): {
  currentLine?: number;
  variables: Record<string, unknown>;
  callStack: CallFrame[];
  arrayStates: Map<string, ArrayVisualizationState>;
  output: string[];
  metrics: ExecutionMetrics;
  changedVars: Set<string>;
} {
  const variables: Record<string, unknown> = {};
  const callStack: CallFrame[] = [];
  const arrayStates = new Map<string, ArrayVisualizationState>();
  const output: string[] = [];
  const metrics = createEmptyMetrics();
  let currentLine: number | undefined;
  let currentDepth = 0;
  const changedVars = new Set<string>();

  for (let i = 0; i <= upToIndex && i < events.length; i++) {
    const event = events[i];

    switch (event.type) {
      case "line_start":
        currentLine = event.line;
        break;

      case "variable_update":
        variables[event.name] = event.value;
        metrics.assignments++;
        changedVars.add(event.name);
        break;

      case "function_call":
        currentDepth++;
        metrics.functionCalls++;
        metrics.maxRecursionDepth = Math.max(metrics.maxRecursionDepth, currentDepth);
        callStack.push({
          id: `${event.functionName}-${i}`,
          functionName: event.functionName,
          args: event.args,
          line: event.line,
          variables: { ...variables },
        });
        break;

      case "function_return":
        currentDepth = Math.max(0, currentDepth - 1);
        if (callStack.length > 0) {
          const frame = callStack[callStack.length - 1];
          if (frame) frame.returnValue = event.value;
          callStack.pop();
        }
        break;

      case "comparison":
        metrics.comparisons++;
        break;

      case "array_swap": {
        metrics.swaps++;
        const swapState = arrayStates.get(event.arrayId);
        if (swapState) {
          const elements = [...swapState.elements];
          const tmp = elements[event.indexA];
          if (tmp && elements[event.indexB]) {
            elements[event.indexA] = { ...elements[event.indexB], index: event.indexA, state: "swapped" };
            elements[event.indexB] = { ...tmp, index: event.indexB, state: "swapped" };
            arrayStates.set(event.arrayId, { ...swapState, elements });
          }
        }
        break;
      }

      case "array_set": {
        metrics.assignments++;
        metrics.arrayAccesses++;
        let setArrState = arrayStates.get(event.arrayId);
        if (!setArrState) {
          setArrState = { id: event.arrayId, name: event.arrayId, elements: [] };
        }
        const setElements = [...setArrState.elements];
        while (setElements.length <= event.index) {
          setElements.push({ value: undefined, state: "normal", index: setElements.length });
        }
        setElements[event.index] = { value: event.value, state: "active", index: event.index };
        arrayStates.set(event.arrayId, { ...setArrState, elements: setElements });
        break;
      }

      case "array_access":
        metrics.arrayAccesses++;
        break;

      case "array_sorted": {
        const sortedState = arrayStates.get(event.arrayId);
        if (sortedState) {
          const sortedElements = [...sortedState.elements];
          if (sortedElements[event.index]) {
            sortedElements[event.index] = { ...sortedElements[event.index], state: "sorted" };
          }
          arrayStates.set(event.arrayId, { ...sortedState, elements: sortedElements });
        }
        break;
      }

      case "allocation": {
        metrics.allocations++;
        if (event.objectType === "array" && Array.isArray(event.value)) {
          const elements: ArrayElement[] = (event.value as unknown[]).map((v, idx) => ({
            value: v,
            state: "normal" as const,
            index: idx,
          }));
          arrayStates.set(event.objectId, {
            id: event.objectId,
            name: event.objectId,
            elements,
          });
        }
        break;
      }

      case "loop_iteration":
        metrics.loopIterations++;
        break;

      case "output":
        output.push(event.value);
        break;

      case "program_start":
        metrics.startTime = event.timestamp;
        break;

      case "program_end":
        metrics.endTime = event.timestamp;
        metrics.elapsedTime = event.totalTime;
        break;
    }
  }

  metrics.currentRecursionDepth = currentDepth;
  if (!metrics.elapsedTime && metrics.startTime) {
    metrics.elapsedTime = Date.now() - metrics.startTime;
  }

  return { currentLine, variables, callStack, arrayStates, output, metrics, changedVars };
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  currentEventIndex: -1,
  currentLine: undefined,
  variables: {},
  callStack: [],
  arrayStates: new Map(),
  output: [],
  metrics: createEmptyMetrics(),
  changedVars: new Set(),

  setEvents(events) {
    set({ events, currentEventIndex: -1, ...replayEvents([], -1) });
  },

  seekToEvent(index) {
    const { events } = get();
    const clampedIndex = Math.max(-1, Math.min(index, events.length - 1));
    const derived = replayEvents(events, clampedIndex);
    set({ currentEventIndex: clampedIndex, ...derived });
  },

  seekToNext() {
    const { currentEventIndex, events } = get();
    if (currentEventIndex < events.length - 1) {
      get().seekToEvent(currentEventIndex + 1);
    }
  },

  seekToPrev() {
    const { currentEventIndex } = get();
    if (currentEventIndex > -1) {
      get().seekToEvent(currentEventIndex - 1);
    }
  },

  seekToStart() {
    get().seekToEvent(-1);
  },

  seekToEnd() {
    const { events } = get();
    get().seekToEvent(events.length - 1);
  },

  reset() {
    set({
      events: [],
      currentEventIndex: -1,
      currentLine: undefined,
      variables: {},
      callStack: [],
      arrayStates: new Map(),
      output: [],
      metrics: createEmptyMetrics(),
      changedVars: new Set(),
    });
  },
}));
