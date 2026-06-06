/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Loader2, Sparkles, Paperclip, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, generateId, type UserProfile, type ChatMessage } from "@/lib/fixora";
import { EXAMPLE_CODES } from "@/lib/examples";
import { detectBestLanguage } from "@/lib/codeDetection";
import DebugSidebar from "@/components/DebugSidebar";
import CodeEditor from "@/components/CodeEditor";
import DebugResults from "@/components/DebugResults";
import ChatInterface from "@/components/ChatInterface";
import { useToast } from "@/hooks/use-toast";

interface DebugData {
  errors: { name: string; line: string; description: string; errorType?: string }[];
  explanation: string;
  technicalExplanation?: string;
  mentalModel?: string;
  fixSuggestions?: { title: string; code: string }[];
  bestPractice?: string;
  futureTip: string;
  fixedCode: string;
  stepByStep?: string;
  expectedOutput?: string;
}

interface Session {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: number;
  debugData: DebugData | null;
   chatMessages: ChatMessage[];
}

interface ExtractedCodeData {
  code: string;
  language: string;
}

const Workspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Auto-Detect");
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [query, setQuery] = useState("Debug this code");
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [translatedExplanation, setTranslatedExplanation] = useState<string | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState("English");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [optimizedCode, setOptimizedCode] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleVoiceInput = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: BlobPart[] = [];
      recognitionRef.current = recorder;

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstart = () => setIsListening(true);
      recorder.onstop = async () => {
        setIsListening(false);
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          try {
            const { data, error } = await supabase.functions.invoke("debug-code", {
              body: { action: "transcribe", audioBase64: base64 },
            });
            if (error) throw error;
            if (data.result) setQuery(data.result);
          } catch (err: any) {
            toast({ title: "Transcription failed", description: err.message || "Could not transcribe audio.", variant: "destructive" });
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 8000);
    } catch (err: any) {
      toast({ title: "Microphone error", description: err.message || "Could not access microphone.", variant: "destructive" });
    }
  };

  const parseResult = <T,>(result: T | string): T => {
    return typeof result === "string" ? JSON.parse(result) as T : result;
  };

  const resetWorkspaceOutputs = useCallback(() => {
    setDebugData(null);
    setChatMessages([]);
    setOutput(null);
    setTranslatedExplanation(null);
    setOptimizedCode(null);
  }, []);

  const handleOptimize = async () => {
    if (!debugData?.fixedCode) return;
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("debug-code", {
        body: { action: "optimize", code: debugData.fixedCode, language },
      });
      if (error) throw error;
      setOptimizedCode(data.result);
    } catch (err: any) {
      toast({ title: "Optimization failed", description: err.message || "Could not optimize.", variant: "destructive" });
    } finally {
      setIsOptimizing(false);
    }
  };

  const syncActiveSessionMessages = useCallback((messages: ChatMessage[]) => {
    if (!activeSessionId) return;

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId ? { ...session, chatMessages: messages } : session,
      ),
    );
  }, [activeSessionId]);

  useEffect(() => {
    const profile = getUserProfile();
    if (!profile) {
      navigate("/");
      return;
    }
    setUser(profile);
    setNativeLanguage(profile.language);
  }, [navigate]);

  // Auto-detect language when code changes
  useEffect(() => {
    if (!code.trim()) {
      setDetectedLang(null);
      return;
    }
    const detected = detectBestLanguage({ code, fallbackLanguage: "" });
    if (detected && detected !== language) {
      setDetectedLang(detected);
      setLanguage(detected);
    } else if (detected) {
      setDetectedLang(detected);
    } else {
      setDetectedLang(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleDebug = async () => {
    if (!code.trim()) return;
    setIsDebugging(true);
    resetWorkspaceOutputs();

    try {
      const { data, error } = await supabase.functions.invoke("debug-code", {
        body: {
          code,
          language,
          query,
          userProfile: user,
          action: "debug",
        },
      });

      if (error) throw error;

      let parsed: DebugData;
      try {
        parsed = parseResult<DebugData>(data.result);
      } catch {
        throw new Error("Failed to parse AI response");
      }

      setDebugData(parsed);

      const sessionId = generateId();
      const newSession: Session = {
        id: sessionId,
        title: `${language} - ${new Date().toLocaleTimeString()}`,
        code,
        language,
        createdAt: Date.now(),
        debugData: parsed,
        chatMessages: [],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(sessionId);
    } catch (err: any) {
      console.error("Debug error:", err);
      toast({
        title: "Debugging failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const handleChat = async (message: string) => {
    const userMsg: ChatMessage = { id: generateId(), role: "user", content: message };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    syncActiveSessionMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const contextMessages: { role: string; content: string }[] = [];
      
      // Add debugging context if available
      if (code.trim() && debugData) {
        contextMessages.push({
          role: "user",
          content: `Context - I was debugging ${language} code:\n\`\`\`\n${code}\n\`\`\`\n\nThe errors found were: ${debugData?.errors.map((e) => e.description).join(", ")}`,
        });
      }

      const { data, error } = await supabase.functions.invoke("debug-code", {
        body: {
          action: "chat",
          userProfile: user,
          chatMessages: [
            ...contextMessages,
            ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
        },
      });

      if (error) throw error;

      const assistantMsg = {
        id: generateId(),
        role: "assistant" as const,
        content: data.result,
      };
      const nextMessages = [...updatedMessages, assistantMsg];
      setChatMessages(nextMessages);
      syncActiveSessionMessages(nextMessages);
    } catch (err: any) {
      toast({
        title: "Chat error",
        description: err.message || "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the uploaded file."));
    reader.readAsDataURL(file);
  });

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      resetWorkspaceOutputs();
      setActiveSessionId(null);

      if (file.type.startsWith("image/")) {
        const imageDataUrl = await readFileAsDataUrl(file);
        const { data, error } = await supabase.functions.invoke("debug-code", {
          body: {
            action: "extract",
            imageDataUrl,
            fileName: file.name,
          },
        });

        if (error) throw error;

        const extracted = parseResult<ExtractedCodeData>(data.result);
        const detectedLanguage = detectBestLanguage({
          code: extracted.code,
          fileName: file.name,
          hintLanguage: extracted.language,
          fallbackLanguage: language,
        });

        setCode(extracted.code);
        setLanguage(detectedLanguage);
        toast({
          title: "Code imported",
          description: `Detected ${detectedLanguage} from ${file.name}.`,
        });
      } else {
        const fileText = await file.text();
        const detectedLanguage = detectBestLanguage({
          code: fileText,
          fileName: file.name,
          fallbackLanguage: language,
        });

        setCode(fileText);
        setLanguage(detectedLanguage);
        toast({
          title: "Code imported",
          description: `Loaded ${file.name} as ${detectedLanguage}.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message || "Could not import the selected file or photo.",
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
      setIsImporting(false);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    // Simulated execution (real execution would need a sandboxed runtime)
    setTimeout(() => {
      setOutput("⚠️ Code execution is simulated.\nThe corrected code should run without errors in your local environment.");
      setIsRunning(false);
    }, 1000);
  };

  const handleTranslate = async () => {
    if (nativeLanguage === "English" || !debugData) {
      setTranslatedExplanation(null);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("debug-code", {
        body: {
          action: "translate",
          code: debugData.explanation + "\n\nFuture Tip: " + debugData.futureTip,
          userProfile: { ...user, language: nativeLanguage },
        },
      });

      if (error) throw error;
      setTranslatedExplanation(data.result);
    } catch {
      toast({
        title: "Translation failed",
        description: "Could not translate the explanation.",
        variant: "destructive",
      });
    }
  };

  const loadExample = () => {
    const keys = Object.keys(EXAMPLE_CODES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const example = EXAMPLE_CODES[randomKey];
    resetWorkspaceOutputs();
    setActiveSessionId(null);
    setCode(example.code);
    setLanguage(example.language);
  };

  const handleNewChat = () => {
    setCode("");
    resetWorkspaceOutputs();
    setActiveSessionId(null);
  };

  const handleSelectSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setCode(session.code);
      setLanguage(session.language);
      setDebugData(session.debugData);
      setChatMessages(session.chatMessages);
      setActiveSessionId(id);
      setOutput(null);
      setTranslatedExplanation(null);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) handleNewChat();
  };

  const handleDownload = () => {
    if (!debugData) return;
    const content = `Fixora Debug Session
====================
Language: ${language}
Date: ${new Date().toLocaleString()}

--- Original Code ---
${code}

--- Errors Found ---
${debugData.errors.map((e) => `${e.name} (Line ${e.line}): ${e.description}`).join("\n")}

--- Explanation ---
${debugData.explanation}

--- Future Tip ---
${debugData.futureTip}

--- Corrected Code ---
${debugData.fixedCode}
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fixora-session.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <DebugSidebar
        sessions={sessions.map((s) => ({ id: s.id, title: s.title, createdAt: s.createdAt }))}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        userLanguage={nativeLanguage}
        onChangeLanguage={setNativeLanguage}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="glass-card px-5 py-3 flex flex-col gap-0.5">
              <h2 className="font-display font-bold text-lg neon-text">
                Fixora <span className="text-foreground font-normal text-sm ml-1">– AI Debugging Assistant</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Hi {user.name} 👋 — Ready to fix some bugs today?
              </p>
            </div>
            <div className="glass-card px-4 py-2.5 text-xs text-muted-foreground max-w-[320px]">
              <p className="font-semibold text-foreground/80 mb-1 flex items-center gap-1">
                <Sparkles size={12} className="text-primary" /> How it works
              </p>
              <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
                <li>Paste or upload your code</li>
                <li>Hit <span className="text-primary font-medium">Debug</span></li>
                <li>Get errors, fixes &amp; tips</li>
                <li>Chat to learn more</li>
              </ol>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={!debugData}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <Download size={14} />
            Download Session
          </motion.button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={(l) => { setLanguage(l); setDetectedLang(null); }}
            onLoadExample={loadExample}
            detectedLang={detectedLang}
          />

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".py,.js,.jsx,.ts,.tsx,.java,.c,.cpp,.cc,.cxx,.h,.hpp,.html,.htm,.css,.txt,image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Debug this code, Find errors, Explain why this fails..."
                className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                onClick={handleVoiceInput}
                type="button"
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isListening ? "bg-destructive/20 text-destructive animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
              {isImporting ? "Reading..." : "Add File"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDebug}
              disabled={!code.trim() || isDebugging || isImporting}
              className="px-6 py-2.5 gradient-btn flex items-center gap-2 text-sm disabled:opacity-40"
            >
              {isDebugging ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Debug
                </>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {isDebugging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-8 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Fixora is analyzing your code...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {debugData && !isDebugging && (
            <DebugResults
              errors={debugData.errors}
              explanation={debugData.explanation}
              technicalExplanation={debugData.technicalExplanation}
              mentalModel={debugData.mentalModel}
              fixSuggestions={debugData.fixSuggestions}
              bestPractice={debugData.bestPractice}
              futureTip={debugData.futureTip}
              fixedCode={debugData.fixedCode}
              stepByStep={debugData.stepByStep}
              onCopyFixed={() => navigator.clipboard.writeText(debugData.fixedCode)}
              onTranslate={handleTranslate}
              expectedOutput={debugData.expectedOutput}
              translatedExplanation={translatedExplanation}
              onOptimize={handleOptimize}
              optimizedCode={optimizedCode}
              isOptimizing={isOptimizing}
            />
          )}

          <ChatInterface
            messages={chatMessages}
            onSend={handleChat}
            isLoading={isChatLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Workspace;
