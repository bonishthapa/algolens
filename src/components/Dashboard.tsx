"use client";

import { useState } from "react";
import { Playground } from "./Playground";
import { AlgorithmCard } from "./algorithms/AlgorithmCard";
import { ALGORITHM_CATEGORIES } from "@/algorithms";
import { Code2, BookOpen, GitCompare, BarChart2, Zap } from "lucide-react";
import type { AlgorithmDefinition } from "@/types";

export function Dashboard() {
  const [view, setView] = useState<"home" | "playground">("home");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmDefinition | null>(null);

  if (view === "playground") {
    return (
      <Playground
        algorithm={selectedAlgorithm}
        onBack={() => setView("home")}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-50" style={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-lg tracking-tight">AlgoLens</span>
          </div>
          <nav className="flex items-center gap-6 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            <button className="hover:text-white transition-colors">Algorithms</button>
            <button className="hover:text-white transition-colors">Compare</button>
            <button className="hover:text-white transition-colors">Learn</button>
            <button
              onClick={() => { setSelectedAlgorithm(null); setView("playground"); }}
              className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
              style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              Open Editor
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Understand algorithms by{" "}
            <span style={{ color: "hsl(var(--primary))" }}>watching them run</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
            Step through code line by line, inspect variables, visualize data structures,
            and explore time &amp; space complexity — all in one platform.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => { setSelectedAlgorithm(null); setView("playground"); }}
              className="px-6 py-2.5 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              Start with Playground
            </button>
            <button
              onClick={() => document.getElementById("algorithms")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-2.5 rounded-lg font-medium border transition-colors hover:bg-white/5"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              Browse Algorithms
            </button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Code2, label: "Live Execution", desc: "Step through code line by line" },
            { icon: BarChart2, label: "Complexity Analysis", desc: "O(n) metrics from real runs" },
            { icon: BookOpen, label: "Learn Mode", desc: "Explanations at every step" },
            { icon: GitCompare, label: "Compare", desc: "Side-by-side algorithm analysis" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-lg p-4 border text-center" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <Icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="font-medium text-sm mb-1">{label}</div>
              <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Algorithm Library */}
      <section id="algorithms" className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-semibold mb-8">Algorithm Library</h2>
        {ALGORITHM_CATEGORIES.map(category => (
          <div key={category.id} className="mb-10">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
              {category.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.algorithms.map(algo => (
                <AlgorithmCard
                  key={algo.metadata.id}
                  algorithm={algo}
                  onSelect={() => {
                    setSelectedAlgorithm(algo);
                    setView("playground");
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
