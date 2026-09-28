import { describe, it, expect } from "vitest";
import { createInstrumentedCode } from "@/engine/instrumentation/instrumenter";

describe("createInstrumentedCode", () => {
  it("wraps user code in sandbox", () => {
    const code = createInstrumentedCode("const x = 1;");
    expect(code).toContain("program_start");
    expect(code).toContain("use strict");
  });

  it("blocks dangerous globals", () => {
    const code = createInstrumentedCode("const x = 1;");
    expect(code).toContain("const window = undefined");
    expect(code).toContain("const document = undefined");
    expect(code).toContain("const localStorage = undefined");
  });

  it("injects line tracking", () => {
    const code = createInstrumentedCode("const x = 1;\nconst y = 2;");
    expect(code).toContain("__line_track__(1)");
    expect(code).toContain("__line_track__(2)");
  });

  it("provides __mkarray__ helper", () => {
    const code = createInstrumentedCode("const arr = [1, 2, 3];");
    expect(code).toContain("__mkarray__");
  });

  it("provides __compare__ helper", () => {
    const code = createInstrumentedCode("const x = 1;");
    expect(code).toContain("__compare__");
  });

  it("provides console.log capture", () => {
    const code = createInstrumentedCode("console.log('hello');");
    expect(code).toContain("type: 'output'");
  });
});
