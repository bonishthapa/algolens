"use client";

import { useMemo } from "react";
import type { ExecutionEvent } from "@/types";

interface RecursionNode {
  id: string;
  functionName: string;
  args: unknown[];
  returnValue?: unknown;
  children: RecursionNode[];
  depth: number;
  status: "active" | "completed" | "pending";
}

function buildRecursionTree(events: ExecutionEvent[], upToIndex: number): RecursionNode[] {
  const roots: RecursionNode[] = [];
  const stack: RecursionNode[] = [];
  let nodeId = 0;

  for (let i = 0; i <= upToIndex && i < events.length; i++) {
    const event = events[i];
    if (event.type === "function_call") {
      const node: RecursionNode = {
        id: `node-${nodeId++}`,
        functionName: event.functionName,
        args: event.args,
        children: [],
        depth: stack.length,
        status: "active",
      };

      if (stack.length === 0) {
        roots.push(node);
      } else {
        const parent = stack[stack.length - 1];
        if (parent) parent.children.push(node);
      }
      stack.push(node);
    } else if (event.type === "function_return") {
      const top = stack[stack.length - 1];
      if (top && top.functionName === event.functionName) {
        top.returnValue = event.value;
        top.status = "completed";
        stack.pop();
      }
    }
  }

  // Mark remaining stack as pending
  stack.forEach(node => { node.status = "pending"; });

  return roots;
}

function formatArgs(args: unknown[]): string {
  return args.map(a => {
    if (Array.isArray(a)) return `[${(a as unknown[]).length}]`;
    if (typeof a === "object" && a !== null) return "{...}";
    return String(a);
  }).join(", ");
}

interface NodeProps {
  node: RecursionNode;
  maxDepth: number;
}

function TreeNode({ node, maxDepth }: NodeProps) {
  const statusColor = {
    active: "#3B82F6",
    completed: "#22C55E",
    pending: "#6B7280",
  }[node.status];

  const bgColor = {
    active: "rgba(59,130,246,0.15)",
    completed: "rgba(34,197,94,0.1)",
    pending: "rgba(107,114,128,0.1)",
  }[node.status];

  return (
    <div className="flex flex-col items-center">
      {/* Node box */}
      <div
        className="rounded border px-2 py-1 text-xs font-mono whitespace-nowrap text-center"
        style={{ backgroundColor: bgColor, borderColor: statusColor, color: statusColor, minWidth: "80px" }}
        title={`${node.functionName}(${formatArgs(node.args)})${node.returnValue !== undefined ? ` → ${node.returnValue}` : ""}`}
      >
        <div>{node.functionName}({formatArgs(node.args)})</div>
        {node.returnValue !== undefined && (
          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            &rarr; {String(node.returnValue)}
          </div>
        )}
      </div>

      {/* Children */}
      {node.children.length > 0 && node.depth < maxDepth - 1 && (
        <div className="flex gap-4 mt-3 pt-3 relative">
          {/* Connector line */}
          <div
            className="absolute top-0 left-1/2 w-px h-3"
            style={{ backgroundColor: statusColor, transform: "translateX(-50%)" }}
          />
          {node.children.map((child, i) => (
            <div key={child.id} className="relative">
              {i > 0 && (
                <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: "#374151", top: "-5px" }} />
              )}
              <TreeNode node={child} maxDepth={maxDepth} />
            </div>
          ))}
        </div>
      )}
      {node.depth >= maxDepth - 1 && node.children.length > 0 && (
        <div className="text-xs mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
          ({node.children.length} more...)
        </div>
      )}
    </div>
  );
}

interface Props {
  events: ExecutionEvent[];
  currentEventIndex: number;
}

export function RecursionTree({ events, currentEventIndex }: Props) {
  const tree = useMemo(
    () => buildRecursionTree(events, currentEventIndex),
    [events, currentEventIndex]
  );

  const hasFunctionCalls = events.some(e => e.type === "function_call");
  const MAX_DISPLAY_DEPTH = 5;

  if (!hasFunctionCalls) {
    return (
      <div className="h-full flex items-center justify-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
        No recursive function calls detected yet
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
        Run the algorithm to see the recursion tree
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="text-xs mb-3 flex items-center gap-3" style={{ color: "hsl(var(--muted-foreground))" }}>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#3B82F6" }} />
          active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#22C55E" }} />
          returned
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#6B7280" }} />
          pending
        </span>
        {MAX_DISPLAY_DEPTH < 10 && (
          <span>(Showing up to depth {MAX_DISPLAY_DEPTH})</span>
        )}
      </div>
      <div className="flex flex-col items-center gap-4">
        {tree.map(root => (
          <TreeNode key={root.id} node={root} maxDepth={MAX_DISPLAY_DEPTH} />
        ))}
      </div>
    </div>
  );
}
