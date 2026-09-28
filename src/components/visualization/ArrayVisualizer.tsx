"use client";

import type { ArrayVisualizationState, ExecutionEvent } from "@/types";

const STATE_COLORS: Record<string, string> = {
  normal: "#4B5563",
  active: "#3B82F6",
  comparing: "#F59E0B",
  selected: "#8B5CF6",
  swapped: "#EF4444",
  sorted: "#22C55E",
  pivot: "#F97316",
  found: "#10B981",
  eliminated: "#374151",
  inserting: "#EC4899",
};

const STATE_LABELS: Record<string, string> = {
  comparing: "compare",
  swapped: "swap",
  active: "active",
  pivot: "pivot",
  found: "found",
  sorted: "sorted",
  inserting: "inserting",
};

interface ArrayBarProps {
  value: unknown;
  state: string;
  index: number;
  maxValue: number;
}

function ArrayBar({ value, state, index, maxValue }: ArrayBarProps) {
  const numVal = typeof value === "number" ? value : 0;
  const heightPct = maxValue > 0 ? Math.max(0.05, numVal / maxValue) : 0.5;
  const color = STATE_COLORS[state] ?? STATE_COLORS.normal;
  const label = STATE_LABELS[state];

  return (
    <div
      className="flex flex-col items-center justify-end gap-0.5"
      style={{ flex: 1, minWidth: "24px", maxWidth: "80px" }}
    >
      {label && (
        <div className="text-xs" style={{ color, fontSize: "10px" }}>
          {label}
        </div>
      )}
      <div
        className="w-full rounded-t"
        style={{
          height: `${heightPct * 100}%`,
          backgroundColor: color,
          boxShadow: state !== "normal" ? `0 0 6px ${color}40` : "none",
          minHeight: "4px",
          transition: "height 200ms ease, background-color 200ms ease, box-shadow 200ms ease",
        }}
      />
      <div
        className="text-xs font-mono"
        style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}
      >
        {String(value)}
      </div>
      {/* Index label below value */}
      <div
        className="text-xs font-mono"
        style={{ fontSize: "9px", color: "hsl(var(--muted-foreground))", opacity: 0.6 }}
      >
        [{index}]
      </div>
    </div>
  );
}

interface Props {
  arrayStates: Map<string, ArrayVisualizationState>;
  currentEvent?: ExecutionEvent;
}

function getHighlightedIndices(
  currentEvent: ExecutionEvent | undefined,
  arrayId: string
): { swapped: Set<number>; active: Set<number> } {
  const swapped = new Set<number>();
  const active = new Set<number>();

  if (!currentEvent) return { swapped, active };

  if (currentEvent.type === "array_swap" && currentEvent.arrayId === arrayId) {
    swapped.add(currentEvent.indexA);
    swapped.add(currentEvent.indexB);
  } else if (currentEvent.type === "array_access" && currentEvent.arrayId === arrayId) {
    active.add(currentEvent.index);
  }

  return { swapped, active };
}

export function ArrayVisualizer({ arrayStates, currentEvent }: Props) {
  if (arrayStates.size === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        <div className="text-center">
          <pre className="text-xs font-mono mb-2 opacity-40 leading-tight select-none">
{`  ┌───┬───┬───┬───┬───┐
  │ 3 │ 1 │ 4 │ 1 │ 5 │
  └───┴───┴───┴───┴───┘
    0   1   2   3   4`}
          </pre>
          <div className="text-sm mb-1">Array Visualization</div>
          <div className="text-xs">
            Run an algorithm to see data structure animation
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col gap-3 p-3 overflow-x-auto"
      style={{ backgroundColor: "hsl(var(--card))" }}
    >
      {Array.from(arrayStates.values()).map((arrState) => {
        const numericValues = arrState.elements.map(e =>
          typeof e.value === "number" ? e.value : 0
        );
        const maxValue = Math.max(...numericValues, 1);

        const { swapped: highlightedSwapped, active: highlightedActive } =
          getHighlightedIndices(currentEvent, arrState.id);

        return (
          <div key={arrState.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-mono font-medium"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {arrState.name}
              </span>
              <span
                className="text-xs"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                [{arrState.elements.length}]
              </span>
            </div>
            <div
              className="flex items-end gap-0.5"
              style={{ height: "120px" }}
              role="img"
              aria-label={`Array ${arrState.name} with ${arrState.elements.length} elements`}
            >
              {arrState.elements.map((el) => {
                // Overlay current-event highlights on top of existing state
                let effectiveState = el.state;
                if (highlightedSwapped.has(el.index)) {
                  effectiveState = "swapped";
                } else if (highlightedActive.has(el.index)) {
                  effectiveState = "active";
                }
                return (
                  <ArrayBar
                    key={el.index}
                    value={el.value}
                    state={effectiveState}
                    index={el.index}
                    maxValue={maxValue}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              {Object.entries(STATE_COLORS).map(([state, color]) => {
                const hasState = arrState.elements.some(e => e.state === state)
                  || (state === "swapped" && highlightedSwapped.size > 0)
                  || (state === "active" && highlightedActive.size > 0);
                if (!hasState) return null;
                if (state === "normal" && !arrState.elements.some(e => e.state !== "normal"))
                  return null;
                return (
                  <div key={state} className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>
                      {state}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
