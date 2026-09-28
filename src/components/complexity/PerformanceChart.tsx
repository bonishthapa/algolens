"use client";

import { useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { runPerformanceExperiment } from "@/analysis/performance/performanceRunner";
import { REFERENCE_CURVES } from "@/analysis/complexity/complexityEngine";
import type { AlgorithmDefinition, PerformanceDataPoint } from "@/types";
import { Play, BarChart2 } from "lucide-react";

const INPUT_SIZES = [10, 20, 50, 100, 200, 500];

const ALGO_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899",
];

interface Props {
  algorithm?: AlgorithmDefinition;
}

export function PerformanceChart({ algorithm }: Props) {
  const [data, setData] = useState<PerformanceDataPoint[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showReference, setShowReference] = useState(true);
  const [metric, setMetric] = useState<"operations" | "timeMs">("operations");

  const runExperiment = useCallback(async () => {
    if (!algorithm || isRunning) return;
    setIsRunning(true);
    setData([]);
    try {
      const results = await runPerformanceExperiment(algorithm, INPUT_SIZES);
      setData(results);
    } catch (err) {
      console.error("Performance experiment failed:", err);
    } finally {
      setIsRunning(false);
    }
  }, [algorithm, isRunning]);

  if (!algorithm) {
    return (
      <div className="h-full flex items-center justify-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
        Select an algorithm to run performance experiments
      </div>
    );
  }

  // Build chart data: one row per input size
  const chartData = INPUT_SIZES.map(size => {
    const point = data.find(d => d.inputSize === size);
    const row: Record<string, number | null> = { size };

    // Actual data
    if (point) {
      row[algorithm.metadata.name] = metric === "operations" ? point.operations : point.timeMs;
    } else {
      row[algorithm.metadata.name] = null;
    }

    // Reference curves (normalized to n=100 baseline)
    if (showReference && data.length > 0) {
      const baseline = data.find(d => d.inputSize === 100);
      const baseOps = baseline?.operations ?? 1;

      REFERENCE_CURVES.forEach(curve => {
        const baseVal = curve.fn(100);
        const scale = baseVal > 0 ? baseOps / baseVal : 1;
        row[curve.name] = curve.fn(size) * scale;
      });
    }

    return row;
  });

  const hasData = data.length > 0;

  return (
    <div className="h-full flex flex-col p-4 gap-3 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Performance Analysis</h3>
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            Run {algorithm.metadata.name} across different input sizes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showReference}
              onChange={e => setShowReference(e.target.checked)}
              className="w-3 h-3"
            />
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Reference curves</span>
          </label>
          <select
            value={metric}
            onChange={e => setMetric(e.target.value as "operations" | "timeMs")}
            className="text-xs px-2 py-1 rounded border"
            style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
          >
            <option value="operations">Operations</option>
            <option value="timeMs">Time (ms)</option>
          </select>
          <button
            onClick={() => void runExperiment()}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                Run Experiment
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: "250px" }}>
        {!hasData && !isRunning ? (
          <div className="h-full flex flex-col items-center justify-center gap-3" style={{ color: "hsl(var(--muted-foreground))" }}>
            <BarChart2 className="w-10 h-10 opacity-30" />
            <div className="text-sm text-center">
              Click &quot;Run Experiment&quot; to measure performance<br />
              across different input sizes
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="size"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                label={{ value: "Input Size", position: "insideBottom", offset: -3, fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                label={{ value: metric === "operations" ? "Operations" : "Time (ms)", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }} />

              {/* Actual algorithm line */}
              <Line
                type="monotone"
                dataKey={algorithm.metadata.name}
                stroke={ALGO_COLORS[0]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: ALGO_COLORS[0] }}
                connectNulls={false}
              />

              {/* Reference curves */}
              {showReference && hasData && REFERENCE_CURVES.map((curve) => (
                <Line
                  key={curve.name}
                  type="monotone"
                  dataKey={curve.name}
                  stroke={curve.color}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  opacity={0.6}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasData && (
        <div className="rounded border p-3" style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}>
          <div className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
            Results Summary
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {data.map(d => (
              <div key={d.inputSize} className="text-center">
                <div className="font-mono font-medium">n={d.inputSize}</div>
                <div style={{ color: "hsl(var(--muted-foreground))" }}>
                  {d.operations.toLocaleString()} ops
                </div>
                <div style={{ color: "hsl(var(--muted-foreground))" }}>
                  {d.timeMs.toFixed(2)}ms
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
