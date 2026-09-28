// All core types for AlgoLens
export type ExecutionStatus = "idle" | "running" | "paused" | "completed" | "error";

export type ExecutionEvent =
  | { type: "line_start"; line: number; timestamp: number }
  | { type: "line_end"; line: number; timestamp: number }
  | { type: "variable_update"; line: number; name: string; value: unknown }
  | { type: "function_call"; line: number; functionName: string; args: unknown[] }
  | { type: "function_return"; line: number; functionName: string; value: unknown }
  | { type: "array_access"; line: number; arrayId: string; index: number; value: unknown }
  | { type: "array_swap"; line: number; arrayId: string; indexA: number; indexB: number }
  | { type: "array_compare"; line: number; arrayId: string; indexA: number; indexB: number; result: boolean }
  | { type: "array_set"; line: number; arrayId: string; index: number; value: unknown; prevValue: unknown }
  | { type: "array_sorted"; line: number; arrayId: string; index: number }
  | { type: "comparison"; line: number; left: unknown; right: unknown; operator: string; result: boolean }
  | { type: "allocation"; line: number; objectId: string; value: unknown; objectType: string }
  | { type: "deallocation"; line: number; objectId: string }
  | { type: "loop_iteration"; line: number; loopId: string; iteration: number; variables: Record<string, unknown> }
  | { type: "breakpoint"; line: number }
  | { type: "output"; line: number; value: string }
  | { type: "program_start"; timestamp: number }
  | { type: "program_end"; timestamp: number; totalTime: number }
  | { type: "program_error"; line?: number; message: string; stack?: string };

export interface CallFrame {
  id: string;
  functionName: string;
  args: unknown[];
  line: number;
  variables: Record<string, unknown>;
  returnValue?: unknown;
}

export interface ExecutionMetrics {
  comparisons: number;
  swaps: number;
  assignments: number;
  functionCalls: number;
  loopIterations: number;
  arrayAccesses: number;
  maxRecursionDepth: number;
  currentRecursionDepth: number;
  allocations: number;
  startTime: number;
  endTime?: number;
  elapsedTime: number;
}

export interface ExecutionState {
  status: ExecutionStatus;
  currentEventIndex: number;
  currentLine?: number;
  variables: Record<string, unknown>;
  callStack: CallFrame[];
  events: ExecutionEvent[];
  metrics: ExecutionMetrics;
  elapsedTime: number;
  breakpoints: Set<number>;
  output: string[];
  error?: { line?: number; message: string; stack?: string };
}

export interface ArrayVisualizationState {
  id: string;
  elements: ArrayElement[];
  name: string;
}

export interface ArrayElement {
  value: unknown;
  state: "normal" | "active" | "comparing" | "selected" | "swapped" | "sorted" | "pivot" | "found" | "eliminated" | "inserting";
  index: number;
}

export type AlgorithmDifficulty = "beginner" | "intermediate" | "advanced";

export interface AlgorithmMetadata {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  stable?: boolean;
  inPlace?: boolean;
  difficulty: AlgorithmDifficulty;
  tags: string[];
  complexityExplanation?: string;
}

export interface InputSchema {
  type: "array" | "graph" | "tree" | "string" | "number" | "search" | "custom";
  fields: InputField[];
}

export interface InputField {
  id: string;
  label: string;
  type: "array" | "number" | "string" | "boolean";
  defaultValue: unknown;
  description?: string;
}

export interface AlgorithmDefinition {
  metadata: AlgorithmMetadata;
  starterCode: string;
  inputSchema: InputSchema;
  defaultInput: unknown;
  generateInput?: (size: number) => Record<string, unknown>;
  visualizerHints?: VisualizerHints;
}

export interface VisualizerHints {
  primaryArray?: string;
  dataStructure?: "array" | "linked-list" | "stack" | "queue" | "tree" | "graph";
  showRecursionTree?: boolean;
}

export interface VisualizationSession {
  id: string;
  code: string;
  language: string;
  input: unknown;
  algorithmId?: string;
  events: ExecutionEvent[];
  metrics: ExecutionMetrics;
  createdAt: string;
  name?: string;
}

export type UIMode = "beginner" | "advanced";
export type Theme = "dark" | "light";

export interface ExplanationContext {
  algorithmId?: string;
  currentLine?: number;
  currentEvent?: ExecutionEvent;
  variables?: Record<string, unknown>;
  callStack?: CallFrame[];
  code?: string;
  metrics?: ExecutionMetrics;
}

export interface ExplanationProvider {
  explain(context: ExplanationContext): Promise<string>;
  explainStep(context: ExplanationContext): Promise<string>;
  explainComplexity(algorithmId: string, metrics: ExecutionMetrics): Promise<string>;
}

export interface PerformanceDataPoint {
  inputSize: number;
  operations: number;
  timeMs: number;
  algorithmId: string;
}
