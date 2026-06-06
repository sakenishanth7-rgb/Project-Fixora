const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  py: "Python",
  js: "JavaScript",
  jsx: "JavaScript",
  ts: "JavaScript",
  tsx: "JavaScript",
  mjs: "JavaScript",
  cjs: "JavaScript",
  java: "Java",
  c: "C",
  h: "C",
  cpp: "C++",
  cxx: "C++",
  cc: "C++",
  hpp: "C++",
  hh: "C++",
  html: "HTML",
  htm: "HTML",
  css: "CSS",
};

export function normalizeLanguage(language?: string | null): string | null {
  if (!language) return null;

  const normalized = language.trim().toLowerCase();

  if (["python", "py"].includes(normalized)) return "Python";
  if (["javascript", "js", "typescript", "ts", "jsx", "tsx"].includes(normalized)) return "JavaScript";
  if (["java"].includes(normalized)) return "Java";
  if (["c"].includes(normalized)) return "C";
  if (["c++", "cpp", "cxx", "cc"].includes(normalized)) return "C++";
  if (["html", "htm"].includes(normalized)) return "HTML";
  if (["css"].includes(normalized)) return "CSS";

  return null;
}

export function detectLanguageFromFilename(fileName?: string | null): string | null {
  if (!fileName || !fileName.includes(".")) return null;

  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? EXTENSION_LANGUAGE_MAP[extension] ?? null : null;
}

export function detectLanguageFromCode(code: string): string | null {
  const value = code.trim();
  const lower = value.toLowerCase();

  if (!value) return null;

  if (/(<!doctype html|<html[\s>]|<body[\s>]|<div[\s>]|<span[\s>]|<head[\s>])/.test(lower)) return "HTML";
  if (/^[\s\S]*\{[\s\S]*:[\s\S]*;[\s\S]*\}/m.test(value) && !/(function\s|=>|console\.log|<\w+)/.test(value)) return "CSS";
  if (/(^|\n)\s*#include\s*</.test(value) && /(std::|cout\s*<<|cin\s*>>|using namespace std)/.test(value)) return "C++";
  if (/(^|\n)\s*#include\s*</.test(value) && /(printf\s*\(|scanf\s*\(|int\s+main\s*\()/.test(value)) return "C";
  if (/(public\s+class|System\.out\.println|public\s+static\s+void\s+main|NullPointerException)/.test(value)) return "Java";
  if (/(^|\n)\s*def\s+\w+\s*\(|print\s*\(|from\s+\w+\s+import|import\s+\w+|elif\s+|except\s*:/.test(value)) return "Python";
  if (/(function\s+\w+\s*\(|=>|console\.log\s*\(|\bconst\b|\blet\b|\bvar\b|document\.)/.test(value)) return "JavaScript";

  return null;
}

export function detectBestLanguage({
  code,
  fileName,
  hintLanguage,
  fallbackLanguage = "Python",
}: {
  code: string;
  fileName?: string | null;
  hintLanguage?: string | null;
  fallbackLanguage?: string;
}): string {
  return (
    normalizeLanguage(hintLanguage) ??
    detectLanguageFromFilename(fileName) ??
    detectLanguageFromCode(code) ??
    fallbackLanguage
  );
}