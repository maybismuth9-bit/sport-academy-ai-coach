import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";

interface MacroBarProps {
  label: string; current: number; target: number; color: string;
}

const MacroBar = ({ label, current, target, color }: MacroBarProps) => {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{current}g / {target}g</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
    </div>
  );
};

const NutritionDashboard = () => {
  const { t } = useLang();
  const caloriesCurrent = 1450;
  const caloriesTarget = 2400;
  const calPct = (caloriesCurrent / caloriesTarget) * 100;

  const macros = [
    { label: t("nutrition.protein"), current: 120, target: 180, color: "hsl(142, 72%, 50%)" },
    { label: t("nutrition.carbs"), current: 150, target: 260, color: "hsl(200, 80%, 55%)" },
    { label: t("nutrition.fat"), current: 40, target: 70, color: "hsl(35, 90%, 55%)" },
  ];

  return (
    <div className="px-5 pt-8 pb-28">
      <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">{t("nutrition.title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("nutrition.subtitle")}</p>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 flex flex-col items-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(220, 14%, 18%)" strokeWidth="8" />
            <motion.circle cx="60" cy="60" r="52" fill="none" stroke="hsl(142, 72%, 50%)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`} initial={{ strokeDashoffset: 2 * Math.PI * 52 }} animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - calPct / 100) }} transition={{ duration: 1.2, ease: "easeOut" }} style={{ filter: "drop-shadow(0 0 6px hsl(142 72% 50% / 0.5))" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-display font-bold text-foreground">{caloriesCurrent}</span>
            <span className="text-xs text-muted-foreground">/ {caloriesTarget} {t("nutrition.kcal")}</span>
          </div>
        </div>
        <p className="text-xs font-display tracking-widest text-muted-foreground mt-4 uppercase">{t("nutrition.calories")}</p>
      </motion.div>

      <div className="glass-card rounded-2xl p-5 space-y-5">
        <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">{t("nutrition.macros")}</h2>
        {macros.map((m) => <MacroBar key={m.label} {...m} />)}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { label: t("nutrition.water"), value: "1.5L", sub: "/ 3L" },
          { label: t("nutrition.meals"), value: "3", sub: "/ 5" },
          { label: t("nutrition.fiber"), value: "18g", sub: "/ 30g" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
            <p className="text-[10px] font-display tracking-wider text-primary uppercase mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionDashboard;
