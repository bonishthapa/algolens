"use client";

interface Props {
  output: string[];
}

export function OutputPanel({ output }: Props) {
  if (output.length === 0) {
    return (
      <div
        className="h-full flex items-center justify-center text-sm"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        No output yet
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 font-mono text-sm">
      {output.map((line, idx) => (
        <div key={idx} className="py-0.5 text-green-400">
          {line}
        </div>
      ))}
    </div>
  );
}
