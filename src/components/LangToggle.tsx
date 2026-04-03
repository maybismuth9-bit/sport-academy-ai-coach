import { useLang } from "@/contexts/LangContext";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LANG_LABELS: Record<string, string> = {
  en: "EN",
  he: "עב",
  es: "ES",
  zh: "中",
  ar: "عر",
  de: "DE",
};

const LangToggle = () => {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="glass-card rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-display font-semibold tracking-wider text-primary hover:neon-border transition-shadow duration-300"
      >
        <Globe className="w-3.5 h-3.5" />
        {LANG_LABELS[lang]}
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 glass-card rounded-lg py-1 min-w-[80px] shadow-lg">
          {Object.entries(LANG_LABELS).map(([code, label]) => (
            <button
              key={code}
              onClick={() => { setLang(code as any); setOpen(false); }}
              className={`w-full px-3 py-1.5 text-xs text-left hover:bg-primary/10 transition-colors ${
                lang === code ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LangToggle;
