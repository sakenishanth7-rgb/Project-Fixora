import { createContext, useContext, ReactNode } from "react";

export interface UserProfile {
  name: string;
  age: string;
  profession: string;
  language: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "debug-result" | "chat";
}

export interface DebugSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  code: string;
  language: string;
  createdAt: number;
}

export function getUserProfile(): UserProfile | null {
  const stored = localStorage.getItem("fixora_user");
  if (!stored) return null;
  return JSON.parse(stored);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}
