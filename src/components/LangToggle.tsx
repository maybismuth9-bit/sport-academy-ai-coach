import { useLang } from "@/contexts/LangContext";
import { Globe } from "lucide-react";

const LangToggle = () => {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className="fixed top-4 right-4 z-50 glass-card rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-display font-semibold tracking-wider text-primary hover:neon-border transition-shadow duration-300"
    >
      <Globe className="w-3.5 h-3.5" />
      {lang === "en" ? "עב" : "EN"}
    </button>
  );
};

export default LangToggle;
