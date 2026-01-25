"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/coding/constants";

interface CodeEditorProps {
  language: SupportedLanguage;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({
  language,
  value,
  onChange,
  readOnly = false,
  height = "100%",
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const handleChange: OnChange = useCallback(
    (newValue) => {
      if (newValue !== undefined) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const monacoLanguage = SUPPORTED_LANGUAGES[language]?.monacoId || "plaintext";

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border">
      <Editor
        height={height}
        language={monacoLanguage}
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          padding: { top: 10, bottom: 10 },
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
        }}
      />
    </div>
  );
}
