import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Bug, Sparkles, Zap, Code2, Terminal, Binary } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const PROFESSIONS = [
  "School Student",
  "Undergraduate Student",
  "Graduate Student",
  "Professor",
  "Software Developer",
  "Non-Technical Professional",
  "Hobbyist / Self-Learner",
];

const LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German", "Chinese",
  "Japanese", "Korean", "Arabic", "Portuguese", "Russian", "Tamil",
  "Telugu", "Bengali", "Urdu", "Italian", "Dutch", "Turkish",
];

const Welcome = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    age: "",
    profession: "",
    language: "English",
  });

  const ageRef = useRef<HTMLInputElement>(null);
  const professionRef = useRef<HTMLSelectElement>(null);
  const languageRef = useRef<HTMLSelectElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement | null>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.profession) return;
    localStorage.setItem("fixora_user", JSON.stringify(form));
    navigate("/workspace");
  };

  const isValid = form.name && form.age && form.profession;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-neon-purple/15 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-neon-blue/15 blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-pink/8 blur-[130px]" />
      </div>

      {/* Floating icons - more intense */}
      <motion.div
        animate={{ y: [-14, 14, -14], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-[12%] text-neon-purple/40 drop-shadow-[0_0_12px_hsl(var(--neon-purple)/0.6)]"
      >
        <Bug size={48} />
      </motion.div>
      <motion.div
        animate={{ y: [12, -12, 12], rotate: [0, -8, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-28 right-[12%] text-neon-blue/40 drop-shadow-[0_0_12px_hsl(var(--neon-blue)/0.6)]"
      >
        <Code2 size={44} />
      </motion.div>
      <motion.div
        animate={{ y: [-10, 14, -10], x: [-5, 5, -5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-28 left-[18%] text-neon-pink/40 drop-shadow-[0_0_12px_hsl(var(--neon-pink)/0.6)]"
      >
        <Zap size={40} />
      </motion.div>
      <motion.div
        animate={{ y: [8, -12, 8], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-[18%] text-neon-purple/35 drop-shadow-[0_0_10px_hsl(var(--neon-purple)/0.5)]"
      >
        <Terminal size={36} />
      </motion.div>
      <motion.div
        animate={{ y: [-6, 10, -6], x: [3, -3, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 left-[40%] text-neon-blue/30 drop-shadow-[0_0_8px_hsl(var(--neon-blue)/0.4)]"
      >
        <Binary size={32} />
      </motion.div>
      <motion.div
        animate={{ y: [10, -8, 10], rotate: [0, -12, 12, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 left-[60%] text-neon-pink/35 drop-shadow-[0_0_10px_hsl(var(--neon-pink)/0.5)]"
      >
        <Sparkles size={34} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-8 glass-card p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-blue/10 pointer-events-none" />
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <div className="w-12 h-12 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-primary/30">
                <Sparkles className="text-primary-foreground" size={24} />
              </div>
            </motion.div>
            <h1 className="text-4xl font-bold font-display neon-text mb-1 drop-shadow-[0_0_15px_hsl(var(--neon-purple)/0.5)]">
              Fixora
            </h1>
            <p className="text-foreground/90 text-sm font-medium tracking-wide">
              AI Debugging Assistant for Students & Developers
            </p>
            <div className="mx-auto mt-3 h-0.5 w-32 rounded-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink opacity-80" />
          </div>
        </motion.div>

        {/* Glass Card Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, ageRef)}
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Age</label>
            <input
              ref={ageRef}
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, professionRef)}
              placeholder="Enter your age"
              min={5}
              max={100}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Profession</label>
            <select
              ref={professionRef}
              value={form.profession}
              onChange={(e) => {
                setForm({ ...form, profession: e.target.value });
                if (e.target.value) languageRef.current?.focus();
              }}
              onKeyDown={(e) => handleKeyDown(e, languageRef)}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">Select your profession</option>
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Native Language */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Native Language</label>
            <select
              ref={languageRef}
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, submitRef)}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <motion.button
            ref={submitRef}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!isValid}
            className="w-full py-3 gradient-btn disabled:opacity-40 disabled:cursor-not-allowed text-base"
          >
            Start Debugging
          </motion.button>
        </motion.form>

        <p className="text-center text-muted-foreground/50 text-xs mt-6">
          Understand your bugs. Fix them smarter.
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;
