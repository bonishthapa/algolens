"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface Props {
  variables: Record<string, unknown>;
}

function ValueDisplay({ value }: { value: unknown }) {
  if (value === null) return <span style={{ color: "hsl(var(--muted-foreground))" }}>null</span>;
  if (value === undefined)
    return <span style={{ color: "hsl(var(--muted-foreground))" }}>undefined</span>;
  if (typeof value === "boolean")
    return <span className="text-purple-400">{String(value)}</span>;
  if (typeof value === "number") return <span className="text-green-400">{value}</span>;
  if (typeof value === "string")
    return <span className="text-orange-400">&quot;{value}&quot;</span>;
  if (Array.isArray(value))
    return <span className="text-blue-400">[Array({value.length})]</span>;
  if (typeof value === "object")
    return <span className="text-yellow-400">&#123;Object&#125;</span>;
  return <span>{String(value)}</span>;
}

function ExpandableValue({ name, value }: { name: string; value: unknown }) {
  const [expanded, setExpanded] = useState(false);
  const isExpandable =
    Array.isArray(value) || (typeof value === "object" && value !== null);

  if (!isExpandable) {
    return (
      <div className="flex items-center justify-between py-1 px-3">
        <span className="text-sm font-mono text-blue-300">{name}</span>
        <ValueDisplay value={value} />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between py-1 px-3 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-1">
          {expanded ? (
            <ChevronDown className="w-3 h-3" style={{ color: "hsl(var(--muted-foreground))" }} />
          ) : (
            <ChevronRight className="w-3 h-3" style={{ color: "hsl(var(--muted-foreground))" }} />
          )}
          <span className="text-sm font-mono text-blue-300">{name}</span>
        </div>
        <ValueDisplay value={value} />
      </button>
      {expanded && (
        <div className="ml-4 border-l" style={{ borderColor: "hsl(var(--border))" }}>
          {Array.isArray(value)
            ? value.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-0.5 px-3">
                  <span
                    className="text-xs font-mono"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    [{i}]
                  </span>
                  <ValueDisplay value={v} />
                </div>
              ))
            : Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-0.5 px-3">
                  <span className="text-xs font-mono text-blue-300">{k}</span>
                  <ValueDisplay value={v} />
                </div>
              ))}
        </div>
      )}
    </div>
  );
}

export function VariableInspector({ variables }: Props) {
  const entries = Object.entries(variables);

  if (entries.length === 0) {
    return (
      <div
        className="h-full flex items-center justify-center text-sm"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        Run the algorithm to inspect variables
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
        {entries.map(([name, value]) => (
          <ExpandableValue key={name} name={name} value={value} />
        ))}
      </div>
    </div>
  );
}
