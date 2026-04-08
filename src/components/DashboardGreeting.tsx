import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import { motion } from "framer-motion";
import { getNutritionWeeklyPercent, getStoredNutritionPlan, getWorkoutWeeklyPercent } from "@/lib/weeklyTracking";

const DashboardGreeting = () => {
  const { t } = useLang();
  const [firstName, setFirstName] = useState("");
  const [completionPercent, setCompletionPercent] = useState(0);
  const [workoutPercent, setWorkoutPercent] = useState(0);
  const [nutritionPercent, setNutritionPercent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch first name from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      setFirstName(profile?.first_name || user.email?.split("@")[0] || "");

      const workoutPlan = JSON.parse(localStorage.getItem("fuelcore_workout_plan") || "[]") as unknown[];
      const hasNutritionPlan = !!getStoredNutritionPlan()?.length;
      const nextWorkoutPercent = getWorkoutWeeklyPercent(workoutPlan.length);
      const nextNutritionPercent = getNutritionWeeklyPercent();
      const active = [workoutPlan.length > 0, hasNutritionPlan].filter(Boolean).length;

      setWorkoutPercent(nextWorkoutPercent);
      setNutritionPercent(nextNutritionPercent);
      setCompletionPercent(active > 0 ? Math.round((nextWorkoutPercent + nextNutritionPercent) / active) : 0);
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.morning");
    if (hour < 18) return t("dashboard.afternoon");
    return t("dashboard.evening");
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 mx-5 mt-4 flex items-center gap-5"
    >
      <div className="relative flex-shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
          <motion.circle
            cx="48" cy="48" r={radius}
            fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            transform="rotate(-90 48 48)"
            style={{ filter: "drop-shadow(0 0 6px hsl(180 80% 50% / 0.5))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-display font-bold text-primary">{completionPercent}%</span>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        <h2 className="text-xl font-display font-bold text-foreground capitalize">
          {firstName || "..."}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">{t("dashboard.weeklyCompletion")}</p>
        <div className="mt-3 w-full max-w-[180px] space-y-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{t("dashboard.workoutWeekly")}</span>
              <span>{workoutPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${workoutPercent}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{t("dashboard.nutritionWeekly")}</span>
              <span>{nutritionPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-cta-green" style={{ width: `${nutritionPercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardGreeting;
