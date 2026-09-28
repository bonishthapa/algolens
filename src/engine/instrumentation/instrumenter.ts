/**
 * Instruments JavaScript code to emit execution events.
 *
 * This instrumenter injects __line_track__ calls at the start of statements
 * using a token-based approach. It also provides helper functions for
 * array tracking, variable tracking, and function tracking.
 *
 * User code can call these helpers directly for precise tracking,
 * or rely on the auto-instrumentation for basic line tracking.
 */

export function createInstrumentedCode(userCode: string): string {
  const injected = injectLineTracking(userCode);

  return `
// Capture safe built-ins in outer scope before any shadowing
(function(__emit__, __input__, __console__, __maxEvents__, __startTime__, __maxTime__,
  _Math, _JSON, _Array, _Object, _parseInt, _parseFloat, _isNaN, _isFinite,
  _String, _Number, _Boolean, _Date, _Proxy, _Map) {
"use strict";

// Safety: shadow dangerous globals so user code cannot access them
const window = undefined;
const document = undefined;
const fetch = undefined;
const XMLHttpRequest = undefined;
const WebSocket = undefined;
const localStorage = undefined;
const sessionStorage = undefined;
const indexedDB = undefined;
const location = undefined;
const history = undefined;
const process = undefined;
const require = undefined;
const module = undefined;
const exports = undefined;
const global = undefined;
const globalThis = undefined;
const self = undefined;

// Re-expose safe globals (these shadow the dangerous-global declarations above
// but the identifiers are captured as parameters, avoiding any TDZ issue)
const Math = _Math;
const JSON = _JSON;
const Array = _Array;
const Object = _Object;
const parseInt = _parseInt;
const parseFloat = _parseFloat;
const isNaN = _isNaN;
const isFinite = _isFinite;
const String = _String;
const Number = _Number;
const Boolean = _Boolean;

// Tracked state
const __vars__ = {};
const __arrays__ = new _Map();
let __line__ = 0;
let __callDepth__ = 0;

// Emit a line_start event
// Note: the __emit__ callback itself enforces event-count and time limits
function __line_track__(line) {
  __line__ = line;
  __emit__({ type: 'line_start', line, timestamp: _Date.now() });
}

// Track variable assignment — returns value so it can be used inline
function __assign__(name, value, line) {
  __vars__[name] = value;
  __emit__({ type: 'variable_update', line: line || __line__, name,
    value: _Array.isArray(value) ? [...value] : value });
  return value;
}

// Create an instrumented array proxy — tracks reads and writes
function __mkarray__(name, arr) {
  const id = name;
  const raw = _Array.isArray(arr) ? arr : [];
  __arrays__.set(id, raw);
  __emit__({ type: 'allocation', line: __line__, objectId: id, value: [...raw], objectType: 'array' });

  return new _Proxy(raw, {
    get(target, prop) {
      if (typeof prop === 'string' && !_isNaN(_Number(prop))) {
        const index = _Number(prop);
        __emit__({ type: 'array_access', line: __line__, arrayId: id, index, value: target[index] });
      }
      const val = target[prop];
      if (typeof val === 'function') return val.bind(target);
      return val;
    },
    set(target, prop, value) {
      if (typeof prop === 'string' && !_isNaN(_Number(prop))) {
        const index = _Number(prop);
        const prevValue = target[index];
        target[index] = value;
        __emit__({ type: 'array_set', line: __line__, arrayId: id, index, value, prevValue });
      } else {
        target[prop] = value;
      }
      return true;
    }
  });
}

// Track comparison — returns result so it can be used in conditionals
function __compare__(left, right, op) {
  let result;
  switch(op) {
    case '<':   result = left < right; break;
    case '>':   result = left > right; break;
    case '<=':  result = left <= right; break;
    case '>=':  result = left >= right; break;
    case '===': result = left === right; break;
    case '!==': result = left !== right; break;
    case '==':  result = left == right; break;   // intentional loose equal
    case '!=':  result = left != right; break;   // intentional loose not-equal
    default:    result = false;
  }
  __emit__({ type: 'comparison', line: __line__, left, right, operator: op, result });
  return result;
}

// Mark a swap (emit event; caller does the actual swap)
function __markswap__(arrayId, i, j) {
  __emit__({ type: 'array_swap', line: __line__, arrayId, indexA: i, indexB: j });
}

// Track function entry
function __fn_enter__(name, ...args) {
  __callDepth__++;
  __emit__({ type: 'function_call', line: __line__, functionName: name, args });
}

// Track function exit — returns value
function __fn_exit__(name, value) {
  __callDepth__ = _Math.max(0, __callDepth__ - 1);
  __emit__({ type: 'function_return', line: __line__, functionName: name, value });
  return value;
}

// Track loop iteration
function __loop__(loopId, iter, vars) {
  __emit__({ type: 'loop_iteration', line: __line__, loopId, iteration: iter, variables: vars || {} });
}

// Console output (sandboxed)
const console = {
  log: (...args) => {
    __console__(...args);
    const value = args.map(a => {
      try { return typeof a === 'object' ? _JSON.stringify(a) : _String(a); }
      catch { return _String(a); }
    }).join(' ');
    __emit__({ type: 'output', line: __line__, value });
  },
  error: (...args) => { __console__(...args); },
  warn: (...args) => { __console__(...args); },
  info: (...args) => { __console__(...args); },
};

// Input data
const input = __input__;

// Mark start
__emit__({ type: 'program_start', timestamp: _Date.now() });

// ============ USER CODE (auto-instrumented) ============
${injected}
// ============ END USER CODE ============

})(__emit__, __input__, __console__, __maxEvents__, __startTime__, __maxTime__,
  Math, JSON, Array, Object, parseInt, parseFloat, isNaN, isFinite,
  String, Number, Boolean, Date, Proxy, Map);`;
}

/**
 * Injects __line_track__(n) calls at the start of each statement.
 * Uses a simple approach: track line numbers by injecting at statement boundaries.
 */
function injectLineTracking(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  const inMultilineString = false;
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // Track block comments
    if (!inMultilineString) {
      if (inBlockComment) {
        result.push(line);
        if (trimmed.includes("*/")) inBlockComment = false;
        continue;
      }
      if (trimmed.startsWith("/*")) {
        inBlockComment = !trimmed.includes("*/");
        result.push(line);
        continue;
      }
    }

    // Skip empty lines and single-line comments
    if (!trimmed || trimmed.startsWith("//")) {
      result.push(line);
      continue;
    }

    // Skip pure closing braces/brackets (not statements)
    if (/^[}\])]/.test(trimmed) && trimmed.length <= 2) {
      result.push(line);
      continue;
    }

    // Inject line tracker before the statement
    // Preserve indentation
    const indent = line.match(/^(\s*)/)?.[1] ?? "";
    result.push(`${indent}__line_track__(${lineNum});`);
    result.push(line);
  }

  return result.join("\n");
}
