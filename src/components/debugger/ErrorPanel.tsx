"use client";

import { AlertTriangle } from "lucide-react";
import type { ExecutionEvent } from "@/types";

interface Props {
  events: ExecutionEvent[];
  currentLine?: number;
}

export function ErrorPanel({ events }: Props) {
  const errorEvent = events.find(e => e.type === "program_error");
  if (!errorEvent || errorEvent.type !== "program_error") return null;

  return (
    <div className="p-4">
      <div className="rounded-lg border p-4" style={{ backgroundColor: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.3)" }}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="font-medium text-red-400 text-sm">Execution Error</span>
          {errorEvent.line && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }}>
              Line {errorEvent.line}
            </span>
          )}
        </div>
        <pre className="text-sm font-mono text-red-300 whitespace-pre-wrap break-words">
          {errorEvent.message}
        </pre>
        {errorEvent.stack && (
          <details className="mt-3">
            <summary className="text-xs cursor-pointer" style={{ color: "hsl(var(--muted-foreground))" }}>
              Stack trace
            </summary>
            <pre className="mt-2 text-xs font-mono overflow-x-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
              {errorEvent.stack}
            </pre>
          </details>
        )}
        <div className="mt-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          <strong>Tip:</strong> Check for undefined variables, off-by-one errors, or incorrect array access.
        </div>
      </div>
    </div>
  );
}
