"use client";

import { useRef, useCallback } from "react";
import type { ExecutionEvent } from "@/types";

const EVENT_COLORS: Record<string, string> = {
  line_start: "#3B82F6",
  variable_update: "#F59E0B",
  function_call: "#A855F7",
  function_return: "#EC4899",
  comparison: "#EF4444",
  array_swap: "#F97316",
  array_set: "#22C55E",
  loop_iteration: "#06B6D4",
  output: "#10B981",
  program_end: "#6B7280",
  program_error: "#EF4444",
};

function getEventColor(event: ExecutionEvent): string {
  return EVENT_COLORS[event.type] ?? "#4B5563";
}

interface Props {
  events: ExecutionEvent[];
  currentIndex: number;
  onSeek: (index: number) => void;
}

export function ExecutionTimeline({ events, currentIndex, onSeek }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || events.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      const index = Math.floor(pct * events.length) - 1;
      onSeek(Math.max(-1, Math.min(index, events.length - 1)));
    },
    [events.length, onSeek]
  );

  if (events.length === 0) {
    return (
      <div
        className="h-10 flex items-center px-4 border-t flex-shrink-0"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          Timeline — run the algorithm to see execution events
        </span>
      </div>
    );
  }

  const progress = events.length > 0 ? (currentIndex + 1) / events.length : 0;
  const currentEvent = currentIndex >= 0 ? events[currentIndex] : undefined;

  return (
    <div
      className="border-t px-3 py-2 flex-shrink-0"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-xs font-medium"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Timeline
        </span>
        <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          {currentIndex + 1} / {events.length} events
        </span>
        {currentEvent && (
          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            — {currentEvent.type.replace(/_/g, " ")}
          </span>
        )}
      </div>
      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative h-6 rounded cursor-pointer overflow-hidden"
        style={{ backgroundColor: "hsl(var(--secondary))" }}
        role="slider"
        aria-label="Execution timeline"
        aria-valuenow={currentIndex}
        aria-valuemin={-1}
        aria-valuemax={events.length - 1}
      >
        {/* Event ticks */}
        <div className="absolute inset-0 flex">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="flex-1"
              style={{
                backgroundColor:
                  idx <= currentIndex ? getEventColor(event) + "80" : "transparent",
                minWidth: "1px",
                maxWidth: "8px",
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="absolute left-0 top-0 h-full opacity-30 pointer-events-none"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: "hsl(var(--primary))",
          }}
        />

        {/* Playhead */}
        {currentIndex >= 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white pointer-events-none"
            style={{
              left: `${progress * 100}%`,
              transform: "translateX(-50%)",
            }}
          />
        )}
      </div>

      {/* Event type legend */}
      <div className="flex flex-wrap gap-3 mt-1">
        {Object.entries(EVENT_COLORS)
          .slice(0, 6)
          .map(([type, color]) => (
            <div key={type} className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                {type.replace(/_/g, " ")}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
