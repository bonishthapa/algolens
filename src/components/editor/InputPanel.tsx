"use client";

import { useState } from "react";
import type { AlgorithmDefinition } from "@/types";
import {
  parseArrayInput,
  generateRandomArray,
  generateSortedArray,
  generateReverseSortedArray,
} from "@/lib/utils";

interface Props {
  algorithm?: AlgorithmDefinition;
  input: unknown;
  onInputChange: (input: unknown) => void;
}

function deriveDisplayValues(input: unknown): { rawInput: string; targetInput: string } {
  if (input === null || input === undefined) return { rawInput: "", targetInput: "" };
  if (Array.isArray(input)) return { rawInput: JSON.stringify(input), targetInput: "" };
  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    return {
      rawInput: Array.isArray(obj.array) ? JSON.stringify(obj.array) : "",
      targetInput: obj.target !== undefined ? String(obj.target) : "",
    };
  }
  if (typeof input === "number") return { rawInput: String(input), targetInput: "" };
  return { rawInput: "", targetInput: "" };
}

export function InputPanel({ algorithm, input, onInputChange }: Props) {
  const initial = deriveDisplayValues(input);
  const [rawInput, setRawInput] = useState(initial.rawInput);
  const [targetInput, setTargetInput] = useState(initial.targetInput);
  const [error, setError] = useState<string | null>(null);

  const isSearchAlgo = algorithm?.inputSchema.type === "search";
  const isNumberInput = algorithm?.inputSchema.type === "number";

  const handleArrayChange = (val: string) => {
    setRawInput(val);
    setError(null);
    try {
      const parsed = parseArrayInput(val);
      if (parsed.length === 0 && val.trim() !== "" && val.trim() !== "[]") {
        setError("Invalid array format");
        return;
      }
      if (isSearchAlgo) {
        const tgt = parseFloat(targetInput) || 0;
        onInputChange({ array: parsed, target: tgt });
      } else {
        onInputChange(parsed);
      }
    } catch {
      setError("Invalid array format");
    }
  };

  const handleTargetChange = (val: string) => {
    setTargetInput(val);
    const tgt = parseFloat(val) || 0;
    const arr = parseArrayInput(rawInput);
    onInputChange({ array: arr, target: tgt });
  };

  const handleNumberChange = (val: string) => {
    setRawInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n)) onInputChange(n);
  };

  const generateRandom = (size = 8) => {
    const arr = generateRandomArray(size, 1, 99);
    const arrStr = JSON.stringify(arr);
    setRawInput(arrStr);
    setError(null);
    if (isSearchAlgo) {
      const tgt = arr[Math.floor(Math.random() * arr.length)] ?? arr[0] ?? 0;
      setTargetInput(String(tgt));
      onInputChange({ array: arr, target: tgt });
    } else {
      onInputChange(arr);
    }
  };

  return (
    <div className="h-full flex flex-col p-3 gap-2">
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Input
        </span>
        {!isNumberInput && (
          <div className="flex gap-1.5">
            {[
              { label: "Random", fn: () => generateRandom(8) },
              {
                label: "Sorted",
                fn: () => {
                  const a = generateSortedArray(8);
                  setRawInput(JSON.stringify(a));
                  setError(null);
                  onInputChange(a);
                },
              },
              {
                label: "Reverse",
                fn: () => {
                  const a = generateReverseSortedArray(8);
                  setRawInput(JSON.stringify(a));
                  setError(null);
                  onInputChange(a);
                },
              },
            ].map(({ label, fn }) => (
              <button
                key={label}
                onClick={fn}
                className="px-2 py-0.5 rounded text-xs transition-colors hover:opacity-80"
                style={{
                  backgroundColor: "hsl(var(--secondary))",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-1">
        <div className="flex-1 flex flex-col">
          <input
            type="text"
            value={rawInput}
            onChange={(e) =>
              isNumberInput
                ? handleNumberChange(e.target.value)
                : handleArrayChange(e.target.value)
            }
            placeholder={
              isNumberInput
                ? "Enter a number (e.g. 8)"
                : "e.g. [64, 34, 25, 12]"
            }
            className="w-full flex-1 px-3 py-2 rounded text-sm font-mono"
            style={{
              backgroundColor: "hsl(var(--secondary))",
              borderColor: error ? "hsl(var(--destructive))" : "hsl(var(--border))",
              border: "1px solid",
              color: "hsl(var(--foreground))",
              outline: "none",
            }}
          />
          {error && (
            <div className="text-xs mt-1" style={{ color: "hsl(var(--destructive))" }}>
              {error}
            </div>
          )}
        </div>

        {isSearchAlgo && (
          <div className="w-32">
            <input
              type="number"
              value={targetInput}
              onChange={(e) => handleTargetChange(e.target.value)}
              placeholder="Target"
              className="w-full h-full px-3 py-2 rounded text-sm font-mono"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
                outline: "none",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
