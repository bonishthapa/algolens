import { describe, it, expect } from "vitest";
import { JavaScriptEngine } from "@/engine/javascript/JavaScriptEngine";

describe("JavaScriptEngine", () => {
  it("executes simple code and returns events", async () => {
    const engine = new JavaScriptEngine();
    await engine.load("console.log('hello');");
    const events = await engine.run();

    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBeGreaterThan(0);
    expect(events.some(e => e.type === "program_start")).toBe(true);
    expect(events.some(e => e.type === "program_end")).toBe(true);
  });

  it("captures console.log output", async () => {
    const engine = new JavaScriptEngine();
    await engine.load("console.log('test output');");
    const events = await engine.run();

    const outputEvents = events.filter(e => e.type === "output");
    expect(outputEvents.length).toBeGreaterThan(0);
    const outputEvent = outputEvents[0];
    expect(outputEvent?.type === "output" && outputEvent.value).toContain("test output");
  });

  it("emits line_start events for each line", async () => {
    const engine = new JavaScriptEngine();
    await engine.load("const x = 1;\nconst y = 2;");
    const events = await engine.run();

    const lineEvents = events.filter(e => e.type === "line_start");
    expect(lineEvents.length).toBeGreaterThan(0);
  });

  it("emits array events when using __mkarray__", async () => {
    const engine = new JavaScriptEngine();
    await engine.load(`
const arr = __mkarray__('myArr', [1, 2, 3]);
const x = arr[0];
arr[1] = 99;
    `);
    const events = await engine.run();

    expect(events.some(e => e.type === "allocation")).toBe(true);
    expect(events.some(e => e.type === "array_access")).toBe(true);
    expect(events.some(e => e.type === "array_set")).toBe(true);
  });

  it("emits comparison events when using __compare__", async () => {
    const engine = new JavaScriptEngine();
    await engine.load(`
const x = __compare__(5, 3, '>');
    `);
    const events = await engine.run();

    const cmpEvents = events.filter(e => e.type === "comparison");
    expect(cmpEvents.length).toBe(1);
    const cmp = cmpEvents[0];
    expect(cmp?.type === "comparison" && cmp.result).toBe(true);
  });

  it("handles runtime errors gracefully", async () => {
    const engine = new JavaScriptEngine();
    await engine.load("throw new Error('test error');");
    const events = await engine.run();

    const errorEvent = events.find(e => e.type === "program_error");
    expect(errorEvent).toBeDefined();
    expect(errorEvent?.type === "program_error" && errorEvent.message).toContain("test error");
    expect(engine.getState().status).toBe("error");
  });

  it("resets state on reset()", async () => {
    const engine = new JavaScriptEngine();
    await engine.load("const x = 1;");
    await engine.run();
    engine.reset();

    expect(engine.getState().status).toBe("idle");
    expect(engine.getEvents().length).toBe(0);
  });

  it("tracks breakpoints", () => {
    const engine = new JavaScriptEngine();
    engine.setBreakpoint(5);
    engine.setBreakpoint(10);

    expect(engine.hasBreakpoint(5)).toBe(true);
    expect(engine.hasBreakpoint(10)).toBe(true);
    expect(engine.hasBreakpoint(3)).toBe(false);

    engine.removeBreakpoint(5);
    expect(engine.hasBreakpoint(5)).toBe(false);
  });

  it("computes correct metrics", async () => {
    const engine = new JavaScriptEngine();
    await engine.load(`
const arr = __mkarray__('arr', [3, 1, 2]);
__compare__(arr[0], arr[1], '>');
__markswap__('arr', 0, 1);
const t = arr[0];
arr[0] = arr[1];
arr[1] = t;
    `);
    await engine.run();
    const metrics = engine.getState().metrics;

    expect(metrics.comparisons).toBeGreaterThan(0);
    expect(metrics.swaps).toBeGreaterThan(0);
    expect(metrics.elapsedTime).toBeGreaterThanOrEqual(0);
  });
});
