"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useExecutionStore } from "@/state/executionStore";
import { useEventStore } from "@/events/store/eventStore";
import { VariableInspector } from "./debugger/VariableInspector";
import { CallStackPanel } from "./debugger/CallStackPanel";
import { ComplexityPanel } from "./complexity/ComplexityPanel";
import { ArrayVisualizer } from "./visualization/ArrayVisualizer";
import { ExecutionTimeline } from "./timeline/ExecutionTimeline";
import { ExecutionToolbar } from "./editor/ExecutionToolbar";
import { OutputPanel } from "./debugger/OutputPanel";
import { InputPanel } from "./editor/InputPanel";
import { PerformanceChart } from "./complexity/PerformanceChart";
import { RecursionTree } from "./visualization/RecursionTree";
import { ErrorPanel } from "./debugger/ErrorPanel";
import { ALL_ALGORITHMS } from "@/algorithms";
import type { AlgorithmDefinition } from "@/types";
import { ArrowLeft, LayoutPanelLeft } from "lucide-react";

const MonacoEditorPanel = dynamic(
  () => import("./editor/MonacoEditorPanel").then(m => ({ default: m.MonacoEditorPanel })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
        Loading editor...
      </div>
    ),
  }
);

type RightTab = "variables" | "callstack" | "complexity" | "output" | "performance" | "recursion";

interface Props {
  algorithm?: AlgorithmDefinition | null;
  onBack?: () => void;
}

export function Playground({ algorithm, onBack }: Props) {
  const {
    code,
    setCode,
    setInput,
    setAlgorithmId,
    input,
    run,
    pause,
    resume,
    stepForward,
    stepBackward,
    restart,
    stop,
    status,
    speed,
    setSpeed,
    toggleBreakpoint,
    breakpoints,
  } = useExecutionStore();

  const {
    currentLine,
    variables,
    callStack,
    arrayStates,
    output,
    metrics,
    events,
    currentEventIndex,
  } = useEventStore();

  const [rightTab, setRightTab] = useState<RightTab>("variables");
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string>(
    algorithm?.metadata.id ?? "bubble-sort"
  );

  // Load algorithm on mount / when selection changes
  useEffect(() => {
    const algo = algorithm ?? ALL_ALGORITHMS.find(a => a.metadata.id === selectedAlgorithmId);
    if (algo) {
      setCode(algo.starterCode);
      setInput(algo.defaultInput);
      setAlgorithmId(algo.metadata.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlgorithmId, algorithm]);

  const handleRun = useCallback(async () => {
    if (status === "running") {
      pause();
    } else if (status === "paused") {
      resume();
    } else {
      await run();
    }
  }, [status, run, pause, resume]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const inEditor =
        active?.closest(".monaco-editor") ||
        active?.tagName === "TEXTAREA" ||
        active?.tagName === "INPUT";
      if (inEditor) return;

      if (e.key === "F5") { e.preventDefault(); void handleRun(); }
      if (e.key === "F6") { e.preventDefault(); if (status === "running") pause(); }
      if (e.key === "F10" && !e.shiftKey) { e.preventDefault(); stepForward(); }
      if (e.key === "F10" && e.shiftKey) { e.preventDefault(); stepBackward(); }
      if ((e.key === "r" || e.key === "R") && !inEditor) { e.preventDefault(); restart(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [status, handleRun, pause, stepForward, stepBackward, restart]);

  const currentAlgorithm = ALL_ALGORITHMS.find(
    a => a.metadata.id === (algorithm?.metadata.id ?? selectedAlgorithmId)
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "hsl(var(--background))" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded hover:bg-white/10 transition-colors mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <LayoutPanelLeft className="w-4 h-4 text-blue-400" />
        <span className="font-semibold text-sm">AlgoLens</span>
        <div className="w-px h-4 mx-2" style={{ backgroundColor: "hsl(var(--border))" }} />

        {/* Algorithm selector */}
        <select
          value={algorithm?.metadata.id ?? selectedAlgorithmId}
          onChange={(e) => setSelectedAlgorithmId(e.target.value)}
          disabled={!!algorithm}
          className="text-sm px-2 py-1 rounded border"
          style={{
            backgroundColor: "hsl(var(--secondary))",
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--foreground))",
          }}
        >
          {ALL_ALGORITHMS.map(a => (
            <option key={a.metadata.id} value={a.metadata.id}>
              {a.metadata.name}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <ExecutionToolbar
          status={status}
          speed={speed}
          onRun={() => void handleRun()}
          onPause={pause}
          onResume={resume}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onRestart={restart}
          onStop={stop}
          onSpeedChange={setSpeed}
          hasEvents={events.length > 0}
          currentEventIndex={currentEventIndex}
          totalEvents={events.length}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Editor + Input */}
        <div className="flex flex-col overflow-hidden" style={{ width: "50%", minWidth: 0 }}>
          <div className="flex-1 overflow-hidden min-h-0">
            <MonacoEditorPanel
              code={code}
              onChange={setCode}
              currentLine={currentLine}
              breakpoints={breakpoints}
              onBreakpointToggle={toggleBreakpoint}
              language="javascript"
              status={status}
            />
          </div>
          <div className="border-t flex-shrink-0" style={{ borderColor: "hsl(var(--border))", height: "140px" }}>
            <InputPanel
              algorithm={currentAlgorithm}
              input={input}
              onInputChange={setInput}
            />
          </div>
        </div>

        {/* Right: Debug panels */}
        <div
          className="flex flex-col border-l overflow-hidden"
          style={{ width: "50%", borderColor: "hsl(var(--border))" }}
        >
          {/* Tabs */}
          <div className="flex border-b text-xs flex-shrink-0 overflow-x-auto" style={{ borderColor: "hsl(var(--border))" }}>
            {(["variables", "callstack", "complexity", "output", "performance", ...(currentAlgorithm?.visualizerHints?.showRecursionTree ? ["recursion"] : [])] as RightTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors whitespace-nowrap ${
                  rightTab === tab ? "border-b-2 border-blue-500 text-blue-400" : "hover:text-white"
                }`}
                style={{ color: rightTab === tab ? undefined : "hsl(var(--muted-foreground))" }}
              >
                {tab === "callstack" ? "Call Stack" : tab === "performance" ? "Performance" : tab === "recursion" ? "Recursion" : tab}
                {tab === "output" && output.length > 0 && (
                  <span
                    className="ml-1 px-1 rounded text-xs"
                    style={{
                      backgroundColor: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                    }}
                  >
                    {output.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
            {status === "error" && (
              <ErrorPanel events={events} currentLine={currentLine} />
            )}
            <div className="flex-1 overflow-hidden min-h-0">
              {rightTab === "variables" && <VariableInspector variables={variables} />}
              {rightTab === "callstack" && <CallStackPanel callStack={callStack} />}
              {rightTab === "complexity" && (
                <ComplexityPanel metrics={metrics} algorithm={currentAlgorithm} />
              )}
              {rightTab === "output" && <OutputPanel output={output} />}
              {rightTab === "performance" && (
                <PerformanceChart algorithm={currentAlgorithm} />
              )}
              {rightTab === "recursion" && currentAlgorithm?.visualizerHints?.showRecursionTree && (
                <RecursionTree events={events} currentEventIndex={currentEventIndex} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Visualization + Timeline */}
      <div className="border-t flex-shrink-0" style={{ borderColor: "hsl(var(--border))", height: "280px" }}>
        <div className="h-full flex flex-col overflow-hidden">
          <ArrayVisualizer
            arrayStates={arrayStates}
            currentEvent={currentEventIndex >= 0 ? events[currentEventIndex] : undefined}
          />
          <ExecutionTimeline
            events={events}
            currentIndex={currentEventIndex}
            onSeek={(idx) => useEventStore.getState().seekToEvent(idx)}
          />
        </div>
      </div>
    </div>
  );
}
