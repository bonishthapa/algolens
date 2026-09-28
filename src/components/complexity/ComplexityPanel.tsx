"use client";

import type { ExecutionMetrics, AlgorithmDefinition } from "@/types";
import { buildComplexityReport } from "@/analysis/complexity/complexityEngine";
import { formatTime, formatNumber } from "@/lib/utils";

interface Props {
  metrics: ExecutionMetrics;
  algorithm?: AlgorithmDefinition;
}

export function ComplexityPanel({ metrics, algorithm }: Props) {
  if (!algorithm) {
    return (
      <div
        className="h-full flex items-center justify-center text-sm"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        Select an algorithm to see complexity analysis
      </div>
    );
  }

  const report = buildComplexityReport(algorithm.metadata, metrics);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Theoretical */}
      <section>
        <h3
          className="text-xs uppercase tracking-wider font-medium mb-2"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Theoretical Complexity
        </h3>
        <div
          className="rounded border p-3 space-y-2"
          style={{
            backgroundColor: "hsl(var(--secondary))",
            borderColor: "hsl(var(--border))",
          }}
        >
          <div
            className="text-xs font-medium mb-1.5 uppercase tracking-wider"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Time
          </div>
          {[
            { label: "Best", value: report.theoretical.time.best },
            { label: "Average", value: report.theoretical.time.average },
            { label: "Worst", value: report.theoretical.time.worst },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
              <code className="text-green-400 font-mono text-sm">{value}</code>
            </div>
          ))}
          <div
            className="pt-2 border-t"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <div
              className="text-xs font-medium mb-1.5 uppercase tracking-wider"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Space
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>Space</span>
              <code className="text-blue-400 font-mono text-sm">
                {report.theoretical.space}
              </code>
            </div>
          </div>
          {algorithm.metadata.stable !== undefined && (
            <div className="flex items-center justify-between text-sm pt-1">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>Stable</span>
              <span className={algorithm.metadata.stable ? "text-green-400" : "text-red-400"}>
                {algorithm.metadata.stable ? "Yes" : "No"}
              </span>
            </div>
          )}
          {algorithm.metadata.inPlace !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>In-Place</span>
              <span
                className={algorithm.metadata.inPlace ? "text-green-400" : "text-red-400"}
              >
                {algorithm.metadata.inPlace ? "Yes" : "No"}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Explanation */}
      <section>
        <h3
          className="text-xs uppercase tracking-wider font-medium mb-2"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Why this complexity?
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--foreground))" }}>
          {report.theoretical.explanation}
        </p>
      </section>

      {/* Observed metrics */}
      {metrics.elapsedTime > 0 && (
        <section>
          <h3
            className="text-xs uppercase tracking-wider font-medium mb-2"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Observed Performance
          </h3>
          <div
            className="rounded border p-3 space-y-1.5"
            style={{
              backgroundColor: "hsl(var(--secondary))",
              borderColor: "hsl(var(--border))",
            }}
          >
            {[
              { label: "Execution Time", value: formatTime(metrics.elapsedTime) },
              { label: "Comparisons", value: formatNumber(metrics.comparisons) },
              { label: "Swaps", value: formatNumber(metrics.swaps) },
              { label: "Assignments", value: formatNumber(metrics.assignments) },
              { label: "Function Calls", value: formatNumber(metrics.functionCalls) },
              { label: "Loop Iterations", value: formatNumber(metrics.loopIterations) },
              { label: "Array Accesses", value: formatNumber(metrics.arrayAccesses) },
              {
                label: "Max Recursion Depth",
                value: formatNumber(metrics.maxRecursionDepth),
              },
            ]
              .filter(({ value }) => value !== "0")
              .map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
                  <span className="font-mono text-yellow-400">{value}</span>
                </div>
              ))}
          </div>
          <p
            className="text-xs mt-2"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Note: Observed metrics reflect actual execution. Big-O notation is theoretical
            and describes growth rate, not exact operation counts.
          </p>
        </section>
      )}
    </div>
  );
}
