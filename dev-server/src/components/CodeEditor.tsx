import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { Copy, Trash2, FileCode } from "lucide-react";
import { motion } from "framer-motion";

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onLoadExample: () => void;
  detectedLang?: string | null;
}

const LANGS = ["Auto-Detect", "Python", "JavaScript", "Java", "C", "C++", "HTML", "CSS"];

function getLangExtension(lang: string) {
  switch (lang.toLowerCase()) {
    case "python": return python();
    case "javascript": return javascript();
    case "java": return java();
    case "c": case "c++": return cpp();
    case "html": return html();
    case "css": return css();
    default: return python();
  }
}

const CodeEditor = ({ code, onChange, language, onLanguageChange, onLoadExample, detectedLang }: CodeEditorProps) => {
  const extension = useMemo(() => getLangExtension(language), [language]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="text-xs bg-muted border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          {detectedLang && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
              Detected: {detectedLang}
            </span>
          )}
          <span className="text-xs text-muted-foreground">Paste your code here</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLoadExample}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileCode size={13} />
            Example
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 size={13} />
            Clear
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyCode}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy size={13} />
            Copy
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <CodeMirror
        value={code}
        onChange={onChange}
        theme={oneDark}
        extensions={[extension]}
        height="280px"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
        }}
        className="text-sm"
      />
    </div>
  );
};

export default CodeEditor;
