import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MessageSquare, Globe, Bookmark, ChevronLeft, ChevronRight, Trash2
} from "lucide-react";

interface SidebarProps {
  sessions: { id: string; title: string; createdAt: number }[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  userLanguage: string;
  onChangeLanguage: (lang: string) => void;
}

const LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German", "Chinese",
  "Japanese", "Korean", "Arabic", "Portuguese", "Russian", "Tamil",
  "Telugu", "Bengali", "Urdu", "Italian", "Dutch", "Turkish",
];

const DebugSidebar = ({
  sessions, activeSessionId, onNewChat, onSelectSession,
  onDeleteSession, userLanguage, onChangeLanguage,
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 260 }}
      transition={{ duration: 0.2 }}
      className="h-full bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-display font-bold text-sm neon-text truncate">Fixora</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat */}
      <div className="p-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg gradient-btn text-sm"
        >
          <Plus size={16} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Language */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground text-sm transition-colors"
          >
            <Globe size={16} />
            <span className="truncate">{userLanguage}</span>
          </button>
          <AnimatePresence>
            {showLangPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="max-h-40 overflow-y-auto bg-muted rounded-lg mt-1 p-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { onChangeLanguage(lang); setShowLangPicker(false); }}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-md transition-colors ${
                        lang === userLanguage
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-sidebar-accent text-sidebar-foreground"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Sessions */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2">
          <p className="text-xs text-muted-foreground px-2 py-2 font-medium">Recent Chats</p>
          <div className="space-y-0.5">
            {sessions.length === 0 && (
              <p className="text-xs text-muted-foreground/50 px-2 py-4 text-center">No sessions yet</p>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  s.id === activeSessionId
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
                onClick={() => onSelectSession(s.id)}
              >
                <MessageSquare size={14} className="shrink-0" />
                <span className="truncate flex-1">{s.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default DebugSidebar;
