import { Home, BookOpen, Dumbbell, Apple, Camera, ShieldCheck } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

interface BottomNavProps {
  active: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "home", labelKey: "nav.home", icon: Home },
  { id: "knowledgeHub", labelKey: "nav.academy", icon: BookOpen },
  { id: "workout", labelKey: "nav.workout", icon: Dumbbell },
  { id: "nutritionPlan", labelKey: "nav.nutrition", icon: Apple },
  { id: "progress", labelKey: "nav.progress", icon: Camera },
];

const BottomNav = ({ active, onNavigate }: BottomNavProps) => {
  const { t } = useLang();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg transition-all duration-300 ${
                isActive ? "text-primary neon-text" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_hsl(180_80%_50%/0.6)]" : ""}`} />
              <span className="text-[9px] font-medium font-display tracking-wider uppercase">
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
