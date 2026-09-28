"use client";

import Editor, { type Monaco } from "@monaco-editor/react";
import { useRef, useEffect, useCallback } from "react";
import type { ExecutionStatus } from "@/types";
import type * as monacoEditor from "monaco-editor";

interface Props {
  code: string;
  onChange: (code: string) => void;
  currentLine?: number;
  breakpoints: Set<number>;
  onBreakpointToggle: (line: number) => void;
  language: string;
  status: ExecutionStatus;
}

export function MonacoEditorPanel({
  code,
  onChange,
  currentLine,
  breakpoints,
  onBreakpointToggle,
  language,
  status,
}: Props) {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const updateDecorations = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecorations: monacoEditor.editor.IModelDeltaDecoration[] = [];

    // Current line highlight
    if (currentLine !== undefined && currentLine > 0) {
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: "current-line-highlight",
          glyphMarginClassName: "current-line-glyph",
          zIndex: 1,
        },
      });
      // Scroll to line
      editor.revealLineInCenter(currentLine, 1);
    }

    // Breakpoints
    breakpoints.forEach(line => {
      newDecorations.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: "breakpoint-gutter",
          glyphMarginHoverMessage: { value: "Breakpoint" },
        },
      });
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [currentLine, breakpoints]);

  useEffect(() => {
    updateDecorations();
  }, [updateDecorations]);

  const handleEditorDidMount = useCallback(
    (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Breakpoint toggle on gutter click
      editor.onMouseDown((e) => {
        if (
          e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
          e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
        ) {
          const lineNumber = e.target.position?.lineNumber;
          if (lineNumber) {
            onBreakpointToggle(lineNumber);
          }
        }
      });

      // Define custom theme
      monaco.editor.defineTheme("algolens-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955" },
          { token: "keyword", foreground: "569CD6" },
          { token: "string", foreground: "CE9178" },
          { token: "number", foreground: "B5CEA8" },
          { token: "function", foreground: "DCDCAA" },
        ],
        colors: {
          "editor.background": "#0D1117",
          "editor.foreground": "#E6EDF3",
          "editor.lineHighlightBackground": "#161B22",
          "editor.selectionBackground": "#264F78",
          "editorLineNumber.foreground": "#6E7681",
          "editorGutter.background": "#0D1117",
          "editor.findMatchBackground": "#9E6A03",
        },
      });
      monaco.editor.setTheme("algolens-dark");

      editor.updateOptions({
        glyphMargin: true,
        lineNumbers: "on",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineHeight: 20,
        fontFamily:
          "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontLigatures: true,
        wordWrap: "on",
        padding: { top: 8, bottom: 8 },
        renderLineHighlight: "none",
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        scrollbar: {
          vertical: "visible",
          horizontal: "visible",
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
        },
      });

      updateDecorations();
    },
    [onBreakpointToggle, updateDecorations]
  );

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={(val) => onChange(val ?? "")}
        onMount={handleEditorDidMount}
        options={{
          readOnly: status === "running",
          glyphMargin: true,
        }}
      />
    </div>
  );
}
