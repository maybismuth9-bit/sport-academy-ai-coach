import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { NutritionPlan, AssessmentData } from "@/components/AssessmentForm";
import { Dumbbell, ShieldCheck } from "lucide-react";

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
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
    </div>
  );
};

interface NutritionDashboardProps {
  plan: NutritionPlan | null;
  assessmentData?: AssessmentData | null;
}

const goalWorkouts: Record<string, { name: string; muscle: string; reps: string }[]> = {
  muscle: [
    { name: "Barbell Bench Press", muscle: "Chest", reps: "4×8-10" },
    { name: "Weighted Pull-Ups", muscle: "Back", reps: "4×6-8" },
    { name: "Barbell Squat", muscle: "Legs", reps: "4×8-10" },
    { name: "Overhead Press", muscle: "Shoulders", reps: "3×10-12" },
  ],
  loss: [
    { name: "Burpees", muscle: "Full Body", reps: "3×15" },
    { name: "Mountain Climbers", muscle: "Core", reps: "3×20" },
    { name: "Jump Squats", muscle: "Legs", reps: "3×15" },
    { name: "Kettlebell Swings", muscle: "Posterior Chain", reps: "3×20" },
  ],
  maintain: [
    { name: "Deadlift", muscle: "Full Body", reps: "3×8" },
    { name: "Dumbbell Row", muscle: "Back", reps: "3×10" },
    { name: "Leg Press", muscle: "Legs", reps: "3×12" },
    { name: "Plank Hold", muscle: "Core", reps: "3×45s" },
  ],
};

const recoveryTips: Record<string, { en: string; he: string }[]> = {
  back: [
    { en: "Cat-Cow stretches — 2 min before workout", he: "מתיחות חתול-פרה — 2 דקות לפני אימון" },
    { en: "Avoid heavy deadlifts until pain subsides", he: "הימנעו מדדליפט כבד עד שהכאב שוכך" },
  ],
  knee: [
    { en: "Foam roll quads & IT band — 3 min", he: "רולר קצף על ירכיים — 3 דקות" },
    { en: "Replace squats with leg press (limited ROM)", he: "החליפו סקוואט בלג פרס (טווח תנועה מוגבל)" },
  ],
  shoulder: [
    { en: "Band pull-aparts for rotator cuff warm-up", he: "מתיחות גומי לחימום שרוול מסובב" },
    { en: "Avoid overhead press if pain persists", he: "הימנעו מלחיצה מעל הראש אם הכאב נמשך" },
  ],
  general: [
    { en: "Warm up 5-10 min before each session", he: "חימום 5-10 דקות לפני כל אימון" },
    { en: "Stretch major muscle groups after training", he: "מתיחות לקבוצות שרירים עיקריות אחרי אימון" },
    { en: "Listen to your body — rest when needed", he: "הקשיבו לגוף — נוחו כשצריך" },
  ],
};

function getGoalKey(goal: string): string {
  const lower = goal.toLowerCase();
  if (lower.includes("muscle") || lower.includes("שריר") || lower.includes("mass")) return "muscle";
  if (lower.includes("loss") || lower.includes("ירידה") || lower.includes("cut")) return "loss";
  return "maintain";
}

function getRecoveryTips(injuries: string, lang: "en" | "he"): string[] {
  const lower = injuries.toLowerCase();
  const tips: string[] = [];
  if (lower.includes("back") || lower.includes("גב")) {
    tips.push(...recoveryTips.back.map(t => t[lang]));
  }
  if (lower.includes("knee") || lower.includes("ברכ")) {
    tips.push(...recoveryTips.knee.map(t => t[lang]));
  }
  if (lower.includes("shoulder") || lower.includes("כתף")) {
    tips.push(...recoveryTips.shoulder.map(t => t[lang]));
  }
  tips.push(...recoveryTips.general.map(t => t[lang]));
  return tips;
}

const NutritionDashboard = ({ plan, assessmentData }: NutritionDashboardProps) => {
  const { t, lang } = useLang();

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <p className="text-muted-foreground text-center">{t("nutrition.noData")}</p>
      </div>
    );
  }

  const calPct = 0;
  const macros = [
    { label: t("nutrition.protein"), current: 0, target: plan.protein, color: "hsl(180, 80%, 50%)" },
    { label: t("nutrition.carbs"), current: 0, target: plan.carbs, color: "hsl(270, 60%, 60%)" },
    { label: t("nutrition.fat"), current: 0, target: plan.fat, color: "hsl(35, 90%, 55%)" },
  ];

  const goalKey = assessmentData?.goal ? getGoalKey(assessmentData.goal) : "maintain";
  const workouts = goalWorkouts[goalKey];
  const tips = assessmentData?.injuries
    ? getRecoveryTips(assessmentData.injuries, lang as "en" | "he")
    : recoveryTips.general.map(t => t[lang as "en" | "he"]);

  return (
    <div className="px-5 pt-8 pb-28">
      <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">{t("nutrition.title")}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t("nutrition.dailyTargets")}</p>

      {plan.summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-4 mb-6 border-l-4 border-accent">
          <p className="text-sm text-foreground">{plan.summary}</p>
        </motion.div>
      )}

      {/* Calorie ring */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 flex flex-col items-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(220, 14%, 18%)" strokeWidth="8" />
            <motion.circle cx="60" cy="60" r="52" fill="none" stroke="hsl(180, 80%, 50%)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - calPct / 100) }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ filter: "drop-shadow(0 0 6px hsl(180 80% 50% / 0.5))" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-display font-bold text-foreground">{plan.calories}</span>
            <span className="text-xs text-muted-foreground">{t("nutrition.kcal")} target</span>
          </div>
        </div>
        <p className="text-xs font-display tracking-widest text-muted-foreground mt-4 uppercase">{t("nutrition.calories")}</p>
      </motion.div>

      {/* Macros */}
      <div className="glass-card rounded-2xl p-5 space-y-5">
        <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">{t("nutrition.macros")}</h2>
        {macros.map((m) => <MacroBar key={m.label} {...m} />)}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { label: t("nutrition.water"), value: `${plan.water}L`, sub: "target" },
          { label: t("nutrition.meals"), value: "—", sub: "today" },
          { label: t("nutrition.fiber"), value: `${plan.fiber}g`, sub: "target" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
            <p className="text-[10px] font-display tracking-wider text-primary uppercase mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Daily Workout */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">{t("nutrition.dailyWorkout")}</h2>
        </div>
        <div className="space-y-3">
          {workouts.map((ex, i) => (
            <motion.div key={ex.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">{ex.name}</p>
                <p className="text-xs text-muted-foreground">{ex.muscle}</p>
              </div>
              <span className="text-xs font-display text-primary bg-primary/10 px-2 py-1 rounded-full">{ex.reps}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Physio Recovery */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">{t("nutrition.recovery")}</h2>
        </div>
        <div className="glass-card rounded-2xl p-5 space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-primary mt-0.5">•</span>
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NutritionDashboard;
