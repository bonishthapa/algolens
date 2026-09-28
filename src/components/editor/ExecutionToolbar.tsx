"use client";

import { Play, Pause, RotateCcw, Square, ChevronLeft, ChevronRight } from "lucide-react";
import type { ExecutionStatus } from "@/types";

interface Props {
  status: ExecutionStatus;
  speed: number;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onRestart: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  hasEvents: boolean;
  currentEventIndex: number;
  totalEvents: number;
}

const SPEEDS = [
  { label: "0.25×", value: 0.25 },
  { label: "0.5×", value: 0.5 },
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "4×", value: 4 },
  { label: "8×", value: 8 },
  { label: "⚡", value: 0 },
];

export function ExecutionToolbar({
  status,
  speed,
  onRun,
  onPause,
  onResume,
  onStepForward,
  onStepBackward,
  onRestart,
  onStop,
  onSpeedChange,
  hasEvents,
  currentEventIndex,
  totalEvents,
}: Props) {
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = status === "idle";
  const isCompleted = status === "completed";
  const canStep = hasEvents && (isPaused || isCompleted);

  return (
    <div className="flex items-center gap-2">
      {/* Step backward */}
      <button
        onClick={onStepBackward}
        disabled={!canStep || currentEventIndex <= -1}
        title="Step Back (Shift+F10)"
        className="p-1.5 rounded transition-colors disabled:opacity-30 hover:bg-white/10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Run/Pause/Resume button */}
      <button
        onClick={isRunning ? onPause : isPaused ? onResume : onRun}
        title={isRunning ? "Pause (F6)" : "Run (F5)"}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
        style={{
          backgroundColor: isRunning ? "hsl(var(--destructive))" : "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
        }}
      >
        {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {isRunning ? "Pause" : isPaused ? "Resume" : "Run"}
      </button>

      {/* Step forward */}
      <button
        onClick={onStepForward}
        disabled={!canStep || currentEventIndex >= totalEvents - 1}
        title="Step Forward (F10)"
        className="p-1.5 rounded transition-colors disabled:opacity-30 hover:bg-white/10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Restart */}
      <button
        onClick={onRestart}
        disabled={!hasEvents}
        title="Restart (R)"
        className="p-1.5 rounded transition-colors disabled:opacity-30 hover:bg-white/10"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Stop */}
      <button
        onClick={onStop}
        disabled={isIdle}
        title="Stop"
        className="p-1.5 rounded transition-colors disabled:opacity-30 hover:bg-white/10"
      >
        <Square className="w-4 h-4" />
      </button>

      <div className="w-px h-4 mx-1" style={{ backgroundColor: "hsl(var(--border))" }} />

      {/* Speed selector */}
      <div className="flex items-center gap-1">
        {SPEEDS.map(s => (
          <button
            key={s.value}
            onClick={() => onSpeedChange(s.value)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              speed === s.value ? "text-blue-400" : "hover:bg-white/10"
            }`}
            style={
              speed === s.value
                ? { backgroundColor: "hsl(var(--secondary))" }
                : { color: "hsl(var(--muted-foreground))" }
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Status indicator */}
      <div className="ml-2 flex items-center gap-1.5 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
        <span
          className={`w-2 h-2 rounded-full ${
            isRunning
              ? "bg-green-400 animate-pulse"
              : isPaused
              ? "bg-yellow-400"
              : isCompleted
              ? "bg-blue-400"
              : status === "error"
              ? "bg-red-400"
              : "bg-gray-500"
          }`}
        />
        {hasEvents && `${currentEventIndex + 1}/${totalEvents}`}
      </div>
    </div>
  );
}
