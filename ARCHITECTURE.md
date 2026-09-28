# AlgoLens Architecture

## Overview

AlgoLens is built around a single design principle: code execution produces a flat, ordered stream of typed events, and every visualization is a pure function of replaying that stream up to a chosen index. This separation makes time-travel debugging, metrics computation, and future language support straightforward to implement.

## The Event-Driven Execution Model

When a user runs code, the system does not render anything live during execution. Instead, it runs the code completely, collects every `ExecutionEvent` into an array, and hands that array to the event store. Visualizations then derive their state by replaying events from the beginning up to a cursor index (`currentEventIndex`).

All events share a discriminated-union type (`ExecutionEvent` in `src/types/index.ts`). Each variant carries exactly the data needed for its visualization. For example, `array_set` carries the array ID, index, new value, and previous value — enough to animate the change forward or reconstruct the previous state by re-replaying from index 0.

This design means:

- **Time travel is free.** Seeking to any point is a matter of calling `replayEvents(events, targetIndex)`, which is a pure linear scan.
- **Metrics are always consistent.** Comparisons, swaps, array accesses, and recursion depth are counted as a byproduct of the same replay pass — they cannot drift from what the visualizations show.
- **There is no mutable animation state.** Components read derived state; they do not mutate it.

## Execution Engine Hierarchy

```
src/engine/
  core/ExecutionEngine.ts          — Abstract base class
  instrumentation/instrumenter.ts  — Code transformation
  javascript/JavaScriptEngine.ts   — Concrete JS engine
```

`ExecutionEngine` (abstract) owns the breakpoint set, the raw event array, and the execution status. It exposes `load(code, input)`, `run()`, and helpers for breakpoint management. Subclasses implement `load` and `run`.

`JavaScriptEngine` instruments the user's source via `createInstrumentedCode`, then evaluates the result inside an `AsyncFunction` constructor (not `eval`). The instrumented code receives six injected arguments — `__emit__`, `__input__`, `__console__`, `__maxEvents__`, `__startTime__`, and `__maxTime__` — and never touches any global state directly.

`createInstrumentedCode` (in `instrumenter.ts`) wraps user code in an IIFE that:

1. Captures safe built-ins (`Math`, `JSON`, `Array`, etc.) before shadowing globals.
2. Shadows dangerous globals (`window`, `document`, `fetch`, `localStorage`, `process`, etc.) with `undefined`.
3. Injects `__line_track__(n)` calls at the start of each non-trivial statement via a token-based line scanner.
4. Provides helper functions — `__mkarray__`, `__compare__`, `__markswap__`, `__fn_enter__`, `__fn_exit__`, `__loop__`, `__assign__` — that emit structured events and return their operand values so they can be used inline in expressions.

Adding a new execution language means creating a new subclass of `ExecutionEngine` that produces the same `ExecutionEvent[]` shape.

## The Event Store and Time-Travel

```
src/events/store/eventStore.ts
```

The event store is a Zustand store that holds the complete event array and a `currentEventIndex` cursor. All derived visualization state — `variables`, `callStack`, `arrayStates`, `output`, `metrics`, `currentLine` — is computed by `replayEvents(events, currentEventIndex)` every time the cursor moves.

Navigation methods:

| Method | Effect |
|---|---|
| `setEvents(events)` | Loads a new event array; resets cursor to -1 (before execution) |
| `seekToEvent(index)` | Moves cursor to an arbitrary index (clamped) |
| `seekToNext()` | Advances cursor by one |
| `seekToPrev()` | Retreats cursor by one |
| `seekToStart()` | Resets cursor to -1 |
| `seekToEnd()` | Moves cursor to the last event |
| `reset()` | Clears all state |

Because `replayEvents` is a pure function, there is no risk of derived state becoming inconsistent with the event log. Any component that needs to display state at a different point in time can call the store's seek methods — the rest of the UI updates automatically via Zustand subscriptions.

## State Management Split

AlgoLens uses two Zustand stores with distinct responsibilities:

- **`useEventStore`** (`src/events/store/eventStore.ts`) — owns the event log and all derived visualization state. This is the source of truth for "what is happening in the algorithm right now."
- **`useExecutionStore`** (`src/state/executionStore.ts`) — owns UI-level state: selected algorithm, editor code, user input, playback speed, animation mode, and whether execution is in progress. It orchestrates the engine and feeds results into the event store.

Components that need to visualize algorithm state subscribe to `useEventStore`. Components that need to control execution (run button, speed slider, algorithm picker) subscribe to `useExecutionStore`. This separation keeps visualization components free of side effects.

## Extending AlgoLens

### Adding a new algorithm

1. Create `src/algorithms/<category>/<name>.ts` exporting an `AlgorithmDefinition`.
2. Provide `metadata` (id, name, complexity strings, difficulty), `starterCode`, `inputSchema`, `defaultInput`, and optionally `generateInput` (for performance benchmarking) and `visualizerHints`.
3. Register the definition in `src/algorithms/index.ts`.

Use the injected helpers in starter code. `__mkarray__` wraps any array in a Proxy that emits `allocation`, `array_access`, and `array_set` events automatically. `__compare__` emits a `comparison` event and returns the boolean result, so it works directly inside `if` conditions.

### Adding a new execution engine

1. Extend `ExecutionEngine` from `src/engine/core/ExecutionEngine.ts`.
2. Implement `load(code, input)` and `run()` returning `ExecutionEvent[]`.
3. The new engine only needs to produce the same event types — the rest of the system is engine-agnostic.

### Adding a new visualizer

Create a React component in `src/components/visualization/` that subscribes to `useEventStore`. The store exposes `arrayStates` (a `Map<string, ArrayVisualizationState>`), `variables`, `callStack`, `currentLine`, `output`, and `metrics`. Components must not call seek methods during render; seek calls belong in event handlers and playback timers in `useExecutionStore`.

## File Layout

```
src/
  algorithms/          — Algorithm definitions (metadata + starter code)
  analysis/            — Complexity engine and performance runner
  app/                 — Next.js App Router pages
  components/          — React UI components
    algorithms/        — Algorithm picker cards
    complexity/        — Big-O panel and performance charts
    debugger/          — Variable inspector, call stack, output, error panels
    editor/            — Monaco editor wrapper and toolbar
    timeline/          — Execution timeline scrubber
    visualization/     — Array visualizer and recursion tree
  engine/
    core/              — Abstract ExecutionEngine base
    instrumentation/   — Code transformation (instrumenter)
    javascript/        — JavaScriptEngine implementation
  events/
    store/             — eventStore (Zustand, time-travel)
  lib/                 — Shared utilities
  state/               — executionStore (UI + orchestration)
  types/               — Shared TypeScript types
```
