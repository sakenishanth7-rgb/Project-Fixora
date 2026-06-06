import { motion } from "framer-motion";
import { AlertTriangle, BookOpen, Code2, Copy, Globe, Lightbulb, ToggleLeft, ToggleRight, Brain, Wrench, Shield, ListChecks, Monitor, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface DebugResultsProps {
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
  onCopyFixed: () => void;
  onTranslate: () => void;
  translatedExplanation: string | null;
  onOptimize: () => void;
  optimizedCode: string | null;
  isOptimizing: boolean;
}

const DebugResults = ({
  errors, explanation, technicalExplanation, mentalModel, fixSuggestions, bestPractice,
  futureTip, fixedCode, stepByStep, expectedOutput, onCopyFixed,
  onTranslate, translatedExplanation, onOptimize, optimizedCode, isOptimizing,
}: DebugResultsProps) => {
  const [learningMode, setLearningMode] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.12, duration: 0.4 },
    }),
  };

  const errorTypeBadge = (type?: string) => {
    if (!type) return null;
    const colors: Record<string, string> = {
      syntax: "bg-neon-pink/20 text-neon-pink",
      runtime: "bg-orange-500/20 text-orange-400",
      logical: "bg-yellow-500/20 text-yellow-400",
    };
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${colors[type] || "bg-muted text-muted-foreground"}`}>
        {type}
      </span>
    );
  };

  let cardIndex = 0;

  return (
    <div className="space-y-4">
      {/* Learning Mode Toggle */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">Learning Mode</span>
        <button onClick={() => setLearningMode(!learningMode)} className="text-primary">
          {learningMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
        </button>
      </div>

      {/* Error Detection Card */}
      <motion.div custom={cardIndex++} initial="hidden" animate="visible" variants={cardVariants} className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className={errors.length === 0 ? "text-green-400" : "text-neon-pink"} />
          <h3 className="font-display font-semibold text-sm">{errors.length === 0 ? "No Errors Found" : "Errors Found"}</h3>
        </div>
        <div className="space-y-2">
          {errors.length === 0 ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-sm text-center">
              <p className="text-green-400 font-semibold text-base">✅ No errors found</p>
              <p className="text-muted-foreground text-xs mt-1">Your code looks good!</p>
            </div>
          ) : (
            errors.map((err, i) => (
              <div key={i} className="bg-muted rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-neon-pink font-medium">
                  <span>Error: {err.name}</span>
                  {errorTypeBadge(err.errorType)}
                </div>
                <p className="text-muted-foreground text-xs mt-1">Line: {err.line}</p>
                <p className="text-foreground/80 text-xs mt-1">{err.description}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Simple Explanation Card */}
      <motion.div custom={cardIndex++} initial="hidden" animate="visible" variants={cardVariants} className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-neon-blue" />
          <h3 className="font-display font-semibold text-sm">Simple Explanation</h3>
        </div>
        <div className="prose prose-sm prose-invert max-w-none text-foreground/85 text-sm">
          <ReactMarkdown>{translatedExplanation || explanation}</ReactMarkdown>
        </div>
        <button
          onClick={onTranslate}
          className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Globe size={13} />
          Translate Explanation
        </button>
      </motion.div>

      {/* Technical Explanation Card */}
      {technicalExplanation && (
        <motion.div custom={cardIndex++} initial="hidden" animate="visible" variants={cardVariants} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={18} className="text-neon-purple" />
            <h3 className="font-display font-semibold text-sm">Technical Explanation</h3>
          </div>
          <div className="prose prose-sm prose-invert max-w-none text-foreground/85 text-sm">
            <ReactMarkdown>{technicalExplanation}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* Mental Model Card */}
      {mentalModel && (
        <motion.div custom={cardIndex++} initial="hidden" animate="visible" variants={cardVariants} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} className="text-yellow-400" />
            <h3 className="font-display font-semibold text-sm">Mental Model</h3>
          </div>
          <div className="bg-yellow-400/5 border border-yellow-400/15 rounded-lg p-3">
            <p className="text-sm text-foreground/85 italic">{mentalModel}</p>
          </div>
        </motion.div>
      )}

      {/* Fix Suggestions Card */}
      {fixSuggestions && fixSuggestions.length > 0 && (
        <motion.div custom={cardIndex++} initial="hidden" animate="visible" variants={cardVariants} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench size={18} className="text-neon-blue" />
            <h3 className="font-display font-semibold text-sm">Fix Suggestions ({fixSuggestions.length})</h3>
          </div>
          <div className="space-y-3">
            {fixSuggestions.map((fix, i) => (
              <div key={i} className="bg-muted rounded-lg p-3">
                <p className="text-xs font-medium text-primary mb-2">Option {i + 1}: {fix.title}</p>
                <pre className="bg-background rounded-lg p-2.5 text-xs text-foreground/90 overflow-x-auto">
                  <code>{fix.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Best Practice + Future Tip Card */}
      {(bestPractice || futureTip) && (
        <motion.div custom={cardIndex++} initial="hidden" animate="visible" variants={cardVariants} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-green-400" />
            <h3 className="font-display font-semibold text-sm">Best Practices</h3>
          </div>
          {bestPractice && (
            <div className="flex items-start gap-2 bg-green-400/5 border border-green-400/10 rounded-lg p-3 mb-2">
              <Shield size={14} className="text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80">{bestPractice}</p>
            </div>
          )}
          {futureTip && (
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-lg p-3">
              <Lightbulb size={14} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-primary">Future Tip</p>
                <p className="text-xs text-foreground/70 mt-0.5">{futureTip}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Corrected Code Card */}
      <motion.div custom={cardIndex++} initial="hidden" animate="visible" variants={cardVariants} className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-neon-purple" />
            <h3 className="font-display font-semibold text-sm">Corrected Code</h3>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCopyFixed}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy size={13} />
              Copy
            </motion.button>
          </div>
        </div>
        <pre className="bg-muted rounded-lg p-3 text-sm text-foreground/90 overflow-x-auto">
          <code>{fixedCode}</code>
        </pre>

        {/* Optimized Code Button */}
        <div className="mt-3 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!optimizedCode && !isOptimizing) onOptimize();
              setShowOptimized(!showOptimized);
            }}
            disabled={isOptimizing}
            className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary/20 to-neon-purple/20 border border-primary/30 text-primary hover:from-primary/30 hover:to-neon-purple/30 transition-all font-medium"
          >
            {isOptimizing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap size={16} />
                {showOptimized && optimizedCode ? "Hide Optimized Code" : "⚡ Show Optimized Code"}
              </>
            )}
          </motion.button>

          {showOptimized && optimizedCode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary flex items-center gap-1">
                  <Zap size={12} /> Optimized Version
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(optimizedCode)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
              <pre className="bg-muted rounded-lg p-3 text-sm text-foreground/90 overflow-x-auto border border-primary/20">
                <code>{optimizedCode}</code>
              </pre>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Expected Output Card */}
      {expectedOutput && (
        <motion.div custom={cardIndex++} initial="hidden" animate="visible" variants={cardVariants} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Monitor size={18} className="text-green-400" />
            <h3 className="font-display font-semibold text-sm">🖥️ Expected Output</h3>
          </div>
          <pre className="bg-muted rounded-lg p-3 text-sm text-green-400 font-mono overflow-x-auto">
            {expectedOutput}
          </pre>
        </motion.div>
      )}

      {/* Step-by-Step Execution */}
      {stepByStep && (
        <motion.div custom={cardIndex++} initial="hidden" animate="visible" variants={cardVariants} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={18} className="text-neon-blue" />
            <h3 className="font-display font-semibold text-sm">Step-by-Step Execution</h3>
          </div>
          <div className="prose prose-sm prose-invert max-w-none text-foreground/85 text-sm bg-muted rounded-lg p-3">
            <ReactMarkdown>{stepByStep}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* Learning Mode Extras */}
      {learningMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-yellow-400" />
            <h3 className="font-display font-semibold text-sm">Learning Resources</h3>
          </div>
          <div className="space-y-2 text-sm text-foreground/80">
            <div className="bg-muted rounded-lg p-3">
              <p className="font-medium text-xs text-primary mb-1">Why did this happen?</p>
              <p className="text-xs">{explanation}</p>
            </div>
            {technicalExplanation && (
              <div className="bg-muted rounded-lg p-3">
                <p className="font-medium text-xs text-neon-purple mb-1">Deep Dive</p>
                <p className="text-xs">{technicalExplanation}</p>
              </div>
            )}
            <div className="bg-muted rounded-lg p-3">
              <p className="font-medium text-xs text-neon-blue mb-1">Best Practice</p>
              <p className="text-xs">{bestPractice || futureTip || "Always test your code incrementally and use proper error handling."}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DebugResults;
