"use client";

import type { CallFrame } from "@/types";

interface Props {
  callStack: CallFrame[];
}

export function CallStackPanel({ callStack }: Props) {
  if (callStack.length === 0) {
    return (
      <div
        className="h-full flex items-center justify-center text-sm"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        Call stack is empty
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div
        className="text-xs uppercase tracking-wider mb-3 font-medium"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        Call Stack
      </div>
      <div className="space-y-1.5">
        {[...callStack].reverse().map((frame, idx) => (
          <div
            key={frame.id}
            className="rounded p-2.5 border text-sm"
            style={{
              backgroundColor:
                idx === 0 ? "rgba(59,130,246,0.1)" : "hsl(var(--secondary))",
              borderColor:
                idx === 0 ? "rgba(59,130,246,0.3)" : "hsl(var(--border))",
            }}
          >
            <div className="font-mono font-medium text-blue-300 flex items-center justify-between">
              <span>
                {frame.functionName}(
                {frame.args.map((a, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    <span className="text-green-400 text-xs">
                      {typeof a === "object"
                        ? Array.isArray(a)
                          ? `[${(a as unknown[]).length} items]`
                          : "{...}"
                        : String(a)}
                    </span>
                  </span>
                ))}
                )
              </span>
              {idx === 0 && (
                <span className="text-xs text-blue-400 ml-2">← active</span>
              )}
            </div>
            <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              Line {frame.line}
              {frame.returnValue !== undefined && (
                <span className="ml-2">
                  →{" "}
                  <span className="text-green-400">{String(frame.returnValue)}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
