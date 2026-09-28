"use client";

import type { AlgorithmDefinition } from "@/types";
import { difficultyColor } from "@/lib/utils";
import { Clock, HardDrive, Play } from "lucide-react";

interface Props {
  algorithm: AlgorithmDefinition;
  onSelect: () => void;
}

export function AlgorithmCard({ algorithm, onSelect }: Props) {
  const { metadata } = algorithm;
  return (
    <div
      className="rounded-lg border p-4 cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 group"
      style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{metadata.name}</h4>
        <span className={`text-xs font-medium ${difficultyColor(metadata.difficulty)}`}>
          {metadata.difficulty}
        </span>
      </div>
      <p className="text-xs mb-3 line-clamp-2" style={{ color: "hsl(var(--muted-foreground))" }}>
        {metadata.description}
      </p>
      <div className="flex items-center gap-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {metadata.timeComplexity.average}
        </span>
        <span className="flex items-center gap-1">
          <HardDrive className="w-3 h-3" />
          {metadata.spaceComplexity}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {metadata.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
            {tag}
          </span>
        ))}
      </div>
      <button
        className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
      >
        <Play className="w-3 h-3" />
        Visualize
      </button>
    </div>
  );
}
