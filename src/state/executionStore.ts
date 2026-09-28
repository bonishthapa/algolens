import { create } from "zustand";
import type { ExecutionStatus, UIMode, Theme } from "@/types";
import { JavaScriptEngine } from "@/engine/javascript/JavaScriptEngine";
import { useEventStore } from "@/events/store/eventStore";

interface ExecutionStore {
  // Execution control
  status: ExecutionStatus;
  speed: number; // 0.25, 0.5, 1, 2, 4, 8, or 0 for instant
  isPlaying: boolean;
  breakpoints: Set<number>;

  // Code & input
  code: string;
  language: string;
  input: unknown;
  algorithmId?: string;

  // UI
  uiMode: UIMode;
  theme: Theme;
  activePanel: "variables" | "callstack" | "complexity" | "memory" | "output";

  // Engine
  engine: JavaScriptEngine | null;
  playbackTimer: ReturnType<typeof setTimeout> | null;

  // Actions
  setCode(code: string): void;
  setLanguage(lang: string): void;
  setInput(input: unknown): void;
  setAlgorithmId(id: string): void;
  setSpeed(speed: number): void;
  setUIMode(mode: UIMode): void;
  setTheme(theme: Theme): void;
  setActivePanel(panel: ExecutionStore["activePanel"]): void;

  toggleBreakpoint(line: number): void;

  run(): Promise<void>;
  pause(): void;
  resume(): void;
  stepForward(): void;
  stepBackward(): void;
  restart(): void;
  stop(): void;

  startPlayback(): void;
  stopPlayback(): void;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  status: "idle",
  speed: 1,
  isPlaying: false,
  breakpoints: new Set(),
  code: "",
  language: "javascript",
  input: null,
  algorithmId: undefined,
  uiMode: "beginner",
  theme: "dark",
  activePanel: "variables",
  engine: null,
  playbackTimer: null,

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setInput: (input) => set({ input }),
  setAlgorithmId: (algorithmId) => set({ algorithmId }),
  setSpeed: (speed) => set({ speed }),
  setUIMode: (uiMode) => set({ uiMode }),
  setTheme: (theme) => set({ theme }),
  setActivePanel: (activePanel) => set({ activePanel }),

  toggleBreakpoint(line) {
    const { breakpoints } = get();
    const next = new Set(breakpoints);
    if (next.has(line)) next.delete(line);
    else next.add(line);
    set({ breakpoints: next });
  },

  async run() {
    const { code, input, breakpoints } = get();
    if (!code.trim()) return;

    // Stop any existing playback
    get().stopPlayback();

    const engine = new JavaScriptEngine();
    set({ engine, status: "running" });
    useEventStore.getState().reset();

    // Sync breakpoints
    breakpoints.forEach(line => engine.setBreakpoint(line));

    try {
      await engine.load(code, input);
      const events = await engine.run();

      useEventStore.getState().setEvents(events);

      const engineState = engine.getState();
      const hasError = engineState.status === "error";

      if (hasError) {
        set({ status: "error" });
        useEventStore.getState().seekToEnd();
      } else {
        // Seek to start then auto-start playback
        useEventStore.getState().seekToStart();
        set({ status: "paused" });
        // Auto-start playback so the user sees the animation immediately
        get().startPlayback();
      }
    } catch {
      set({ status: "error" });
    }
  },

  pause() {
    get().stopPlayback();
    set({ isPlaying: false, status: "paused" });
  },

  resume() {
    set({ status: "running", isPlaying: true });
    get().startPlayback();
  },

  stepForward() {
    get().stopPlayback();
    set({ isPlaying: false, status: "paused" });
    useEventStore.getState().seekToNext();

    const { events, currentEventIndex } = useEventStore.getState();
    if (currentEventIndex >= events.length - 1) {
      set({ status: "completed" });
    }
  },

  stepBackward() {
    get().stopPlayback();
    set({ isPlaying: false, status: "paused" });
    useEventStore.getState().seekToPrev();
  },

  restart() {
    get().stopPlayback();
    useEventStore.getState().seekToStart();
    set({ isPlaying: false, status: "paused" });
  },

  stop() {
    get().stopPlayback();
    useEventStore.getState().reset();
    set({ status: "idle", isPlaying: false });
  },

  startPlayback() {
    get().stopPlayback();

    const tick = () => {
      // Re-read state fresh each tick to catch pause/stop/speed changes
      const { status, speed: currentSpeed } = get();

      // Stop ticking if we're not in playing state
      if (status !== "running") return;

      const { events, currentEventIndex } = useEventStore.getState();

      if (currentSpeed === 0) {
        // Instant mode — jump to end
        useEventStore.getState().seekToEnd();
        set({ status: "completed", isPlaying: false });
        return;
      }

      if (currentEventIndex >= events.length - 1) {
        set({ status: "completed", isPlaying: false });
        return;
      }

      useEventStore.getState().seekToNext();

      const newIdx = useEventStore.getState().currentEventIndex;
      if (newIdx >= events.length - 1) {
        set({ status: "completed", isPlaying: false });
        return;
      }

      // Delay: at speed 1x, show ~8 events per second (125ms/event)
      // At 8x: ~64 events/sec (15ms/event). At 0.25x: ~2 events/sec (500ms/event)
      const delay = 125 / currentSpeed;
      const timer = setTimeout(tick, delay);
      set({ playbackTimer: timer });
    };

    set({ isPlaying: true, status: "running" });
    // Use setTimeout(tick, 0) so state settles before first tick
    const startTimer = setTimeout(tick, 0);
    set({ playbackTimer: startTimer });
  },

  stopPlayback() {
    const { playbackTimer } = get();
    if (playbackTimer) {
      clearTimeout(playbackTimer);
      set({ playbackTimer: null });
    }
  },
}));
