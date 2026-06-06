import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading: boolean;
}

const ChatInterface = ({ messages, onSend, isLoading }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-4 py-2 border-b border-glass-border">
        <p className="text-xs font-medium text-muted-foreground">
          {messages.length === 0 ? "Ask Fixora anything about this bug" : "Continue the conversation"}
        </p>
      </div>
      <div className="max-h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Ask for another example, a simpler explanation, or how to avoid the bug next time.
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "gradient-btn"
                  : "bg-muted text-foreground/90"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-glass-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-lg gradient-btn disabled:opacity-40"
        >
          <Send size={16} />
        </motion.button>
      </form>
    </div>
  );
};

export default ChatInterface;
