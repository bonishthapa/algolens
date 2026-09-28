import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function generateRandomArray(size: number, min = 1, max = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

export function generateSortedArray(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i + 1);
}

export function generateReverseSortedArray(size: number): number[] {
  return Array.from({ length: size }, (_, i) => size - i);
}

export function generateNearlySortedArray(size: number): number[] {
  const arr = generateSortedArray(size);
  const swaps = Math.floor(size * 0.1);
  for (let i = 0; i < swaps; i++) {
    const a = Math.floor(Math.random() * size);
    const b = Math.floor(Math.random() * size);
    [arr[a], arr[b]] = [arr[b], arr[a]];
  }
  return arr;
}

export function parseArrayInput(input: string): number[] {
  try {
    const cleaned = input.replace(/[[\]]/g, "").trim();
    if (!cleaned) return [];
    return cleaned.split(",").map(s => {
      const n = parseFloat(s.trim());
      if (isNaN(n)) throw new Error(`Invalid number: ${s}`);
      return n;
    });
  } catch {
    return [];
  }
}

export function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner": return "text-green-400";
    case "intermediate": return "text-yellow-400";
    case "advanced": return "text-red-400";
    default: return "text-gray-400";
  }
}
