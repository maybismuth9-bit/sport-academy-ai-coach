import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import { motion } from "framer-motion";

const DashboardGreeting = () => {
  const { t } = useLang();
  const [firstName, setFirstName] = useState("");
  const [completionPercent, setCompletionPercent] = useState(0);

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

      // Calculate daily completion based on meals logged today
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("user_nutrition")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", today);
      
      const percent = Math.min(100, Math.round(((count || 0) / 4) * 100));
      setCompletionPercent(percent);
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
        <p className="text-xs text-muted-foreground mt-1">{t("dashboard.completion")}</p>
      </div>
    </motion.div>
  );
};

export default DashboardGreeting;
