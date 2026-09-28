# AlgoLens

An interactive algorithm visualization and complexity analysis platform built with Next.js.

## What is AlgoLens?

AlgoLens is a production-quality web application for visualizing code execution, debugging algorithms, and understanding time & space complexity. It uses an event-driven architecture where code execution produces structured events that drive all visualizations.

## Features

- **Live Code Execution** — Run JavaScript algorithms and watch execution step by step
- **Line-by-line Debugging** — Current line highlighted in Monaco editor with breakpoint support
- **Variable Inspector** — Watch variables change in real time with expandable trees
- **Array Visualization** — Animated bars showing sorting/searching progress with state coloring
- **Call Stack Panel** — Inspect function calls and return values
- **Complexity Analysis** — Theoretical Big-O with observed runtime metrics
- **Execution Timeline** — Scrub through any point in execution history
- **Time-Travel Debugging** — Step forward and backward through execution
- **Performance Charts** — Run algorithms across multiple input sizes and compare to reference curves
- **Recursion Tree** — Visualize recursive call trees for recursive algorithms
- **Algorithm Library** — 9 built-in algorithms (sorting, searching, recursion)
- **Speed Control** — 0.25× to 8× playback plus instant mode

## Algorithm Library

| Algorithm | Category | Time Complexity |
|-----------|----------|----------------|
| Bubble Sort | Sorting | O(n²) |
| Selection Sort | Sorting | O(n²) |
| Insertion Sort | Sorting | O(n²) |
| Merge Sort | Sorting | O(n log n) |
| Quick Sort | Sorting | O(n log n) avg |
| Linear Search | Searching | O(n) |
| Binary Search | Searching | O(log n) |
| Fibonacci | Recursion | O(2ⁿ) |
| Factorial | Recursion | O(n) |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Development

```bash
# Type check
npm run typecheck  # or: npx tsc --noEmit

# Lint
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

## Architecture

AlgoLens uses an event-driven architecture:

```
User Code
   ↓ (instrumentation)
JavaScript Engine
   ↓ (execution)
Event Stream (ExecutionEvent[])
   ↓ (event store / replay)
Derived State (variables, arrays, call stack, metrics)
   ↓ (React rendering)
Visualizations (editor, array, timeline, complexity)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.

## Adding a New Algorithm

1. Create `src/algorithms/<category>/<name>.ts`
2. Export an `AlgorithmDefinition` with metadata, `starterCode`, `inputSchema`, and `defaultInput`
3. Register it in `src/algorithms/index.ts`

In the starter code, use these tracking helpers for visualization:
- `__mkarray__('name', arr)` — creates a tracked array that emits events on access/mutation
- `__compare__(a, b, '>')` — emits a comparison event and returns the result
- `__markswap__('arr', i, j)` — emits a swap event (you still do the swap manually)
- `__fn_enter__('name', ...args)` / `__fn_exit__('name', result)` — tracks function calls

## Adding a New Visualizer

Create a new component in `src/components/visualization/` that reads from `useEventStore()`. The store provides:
- `arrayStates` — current state of all tracked arrays
- `variables` — current variable values
- `callStack` — current call stack frames
- `currentLine` — currently executing line number
- `events` / `currentEventIndex` — full event history for time-travel

## Security

User code runs in an isolated sandbox:
- Dangerous globals (window, document, fetch, localStorage, etc.) are shadowed
- Execution is limited to 10 seconds and 50,000 events
- Code runs in strict mode inside an IIFE
