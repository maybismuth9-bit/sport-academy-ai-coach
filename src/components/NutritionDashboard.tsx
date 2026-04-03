import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NutritionPlan, AssessmentData } from "@/components/AssessmentForm";
import { Dumbbell, ShieldCheck, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface MealPlanDay {
  day: string;
  totalCalories: number;
  meals: {
    mealName: string;
    time: string;
    items: { food: string; amount: string; calories: number; protein?: number }[];
  }[];
}

interface NutritionDashboardProps {
  plan: NutritionPlan | null;
  assessmentData?: AssessmentData | null;
}

const NutritionDashboard = ({ plan, assessmentData }: NutritionDashboardProps) => {
  const { t, lang } = useLang();
  const [aiMealPlan, setAiMealPlan] = useState<MealPlanDay[] | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    loadSavedPlan();
  }, []);

  const loadSavedPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("ai_meal_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data && data.length > 0 && (data[0] as any).plan_data) {
      const planData = (data[0] as any).plan_data;
      if (planData.days) setAiMealPlan(planData.days);
    }
  };

  const generateAIMealPlan = async () => {
    if (!assessmentData) {
      toast({ title: t("nutritionPlan.error"), description: t("nutrition.noData"), variant: "destructive" });
      return;
    }
    setGeneratingPlan(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          goal: assessmentData.goal,
          weight: assessmentData.weight,
          height: assessmentData.height,
          age: assessmentData.age,
          activityLevel: assessmentData.activityLevel,
          allergies: assessmentData.allergies?.join(", ") || "None",
          mealFrequency: assessmentData.mealFrequency || 4,
        },
      });

      if (error) throw error;
      if (data?.plan?.days) {
        setAiMealPlan(data.plan.days);
        // Save to DB
        await supabase.from("ai_meal_plans").insert({
          user_id: user.id,
          plan_data: data.plan,
          goal: assessmentData.goal,
        });
        toast({ title: "🍽️", description: "Your AI meal plan is ready!" });
      }
    } catch (err: any) {
      toast({ title: t("nutritionPlan.error"), description: err.message, variant: "destructive" });
    } finally {
      setGeneratingPlan(false);
    }
  };

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
      </motion.div>

      {/* Macros */}
      <div className="glass-card rounded-2xl p-5 space-y-5 mb-6">
        <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">{t("nutrition.macros")}</h2>
        {macros.map((m) => <MacroBar key={m.label} {...m} />)}
      </div>

      {/* AI Meal Plan Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cta-orange" />
            <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              AI Weekly Meal Plan
            </h2>
          </div>
          <Button
            onClick={generateAIMealPlan}
            disabled={generatingPlan}
            size="sm"
            className="h-8 text-xs bg-cta-orange hover:bg-cta-orange/90 text-black font-bold"
          >
            {generatingPlan ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
            {generatingPlan ? t("assess.generating") : "Generate Plan"}
          </Button>
        </div>

        {aiMealPlan && (
          <div className="space-y-2">
            {aiMealPlan.map((day, dayIdx) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIdx * 0.05 }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedDay(expandedDay === dayIdx ? null : dayIdx)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground text-sm">{day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.totalCalories} kcal</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedDay === dayIdx ? "rotate-180" : ""}`} />
                </button>

                {expandedDay === dayIdx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-4 pb-4 space-y-3"
                  >
                    {day.meals.map((meal, mealIdx) => (
                      <div key={mealIdx} className="bg-secondary/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-display font-semibold text-primary tracking-wider uppercase">{meal.mealName}</span>
                          <span className="text-[10px] text-muted-foreground">{meal.time}</span>
                        </div>
                        <div className="space-y-1">
                          {meal.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center justify-between text-xs">
                              <span className="text-foreground">{item.food} <span className="text-muted-foreground">({item.amount})</span></span>
                              <span className="text-muted-foreground">{item.calories} cal</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {!aiMealPlan && !generatingPlan && (
          <div className="glass-card rounded-xl p-6 text-center">
            <Sparkles className="w-8 h-8 text-cta-orange/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Generate a personalized AI meal plan with exact portions, calories, and timing for every day of the week.
            </p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
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
    </div>
  );
};

export default NutritionDashboard;
