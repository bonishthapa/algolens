import { describe, it, expect, beforeEach } from "vitest";
import { useEventStore } from "@/events/store/eventStore";
import type { ExecutionEvent } from "@/types";

// Reset store between tests
beforeEach(() => {
  useEventStore.getState().reset();
});

const sampleEvents: ExecutionEvent[] = [
  { type: "program_start", timestamp: 0 },
  { type: "line_start", line: 1, timestamp: 1 },
  { type: "variable_update", line: 1, name: "x", value: 5 },
  { type: "line_start", line: 2, timestamp: 2 },
  { type: "comparison", line: 2, left: 5, right: 3, operator: ">", result: true },
  { type: "program_end", timestamp: 10, totalTime: 10 },
];

describe("useEventStore", () => {
  it("initializes with empty state", () => {
    const state = useEventStore.getState();
    expect(state.events).toHaveLength(0);
    expect(state.currentEventIndex).toBe(-1);
    expect(state.variables).toEqual({});
  });

  it("sets events and maintains index at -1", () => {
    useEventStore.getState().setEvents(sampleEvents);
    const state = useEventStore.getState();
    expect(state.events).toHaveLength(sampleEvents.length);
    expect(state.currentEventIndex).toBe(-1);
  });

  it("seekToNext advances the index", () => {
    useEventStore.getState().setEvents(sampleEvents);
    useEventStore.getState().seekToNext();
    expect(useEventStore.getState().currentEventIndex).toBe(0);
  });

  it("rebuilds variables from events on seek", () => {
    useEventStore.getState().setEvents(sampleEvents);
    // Seek to after variable_update event (index 2)
    useEventStore.getState().seekToEvent(2);
    const state = useEventStore.getState();
    expect(state.variables.x).toBe(5);
  });

  it("seekToPrev decrements index", () => {
    useEventStore.getState().setEvents(sampleEvents);
    useEventStore.getState().seekToEvent(3);
    useEventStore.getState().seekToPrev();
    expect(useEventStore.getState().currentEventIndex).toBe(2);
  });

  it("seekToStart resets to -1", () => {
    useEventStore.getState().setEvents(sampleEvents);
    useEventStore.getState().seekToEvent(3);
    useEventStore.getState().seekToStart();
    expect(useEventStore.getState().currentEventIndex).toBe(-1);
    expect(useEventStore.getState().variables).toEqual({});
  });

  it("seekToEnd goes to last event", () => {
    useEventStore.getState().setEvents(sampleEvents);
    useEventStore.getState().seekToEnd();
    expect(useEventStore.getState().currentEventIndex).toBe(sampleEvents.length - 1);
  });

  it("tracks metrics correctly", () => {
    const events: ExecutionEvent[] = [
      { type: "program_start", timestamp: 0 },
      { type: "comparison", line: 1, left: 1, right: 2, operator: "<", result: true },
      { type: "comparison", line: 2, left: 3, right: 4, operator: "<", result: true },
      { type: "array_swap", line: 3, arrayId: "arr", indexA: 0, indexB: 1 },
      { type: "program_end", timestamp: 100, totalTime: 100 },
    ];
    useEventStore.getState().setEvents(events);
    useEventStore.getState().seekToEnd();

    const metrics = useEventStore.getState().metrics;
    expect(metrics.comparisons).toBe(2);
    expect(metrics.swaps).toBe(1);
  });

  it("resets all state", () => {
    useEventStore.getState().setEvents(sampleEvents);
    useEventStore.getState().seekToEnd();
    useEventStore.getState().reset();

    const state = useEventStore.getState();
    expect(state.events).toHaveLength(0);
    expect(state.currentEventIndex).toBe(-1);
    expect(state.variables).toEqual({});
    expect(state.metrics.comparisons).toBe(0);
  });

  it("clamps seek index to valid range", () => {
    useEventStore.getState().setEvents(sampleEvents);
    useEventStore.getState().seekToEvent(999);
    expect(useEventStore.getState().currentEventIndex).toBe(sampleEvents.length - 1);

    useEventStore.getState().seekToEvent(-999);
    expect(useEventStore.getState().currentEventIndex).toBe(-1);
  });
});
