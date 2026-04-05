import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dumbbell, Apple, BookOpen, Heart, Flame, TrendingUp,
  Activity, Trophy, Calendar, ArrowRight, Sparkles
} from "lucide-react";
import heroImg from "@/assets/hero-gym.jpg";
import logo from "@/assets/fuelcore-logo.png";

interface HomeFeedProps {
  onStartAssessment: () => void;
  onNavigate?: (page: string) => void;
}

const HomeFeed = ({ onStartAssessment, onNavigate }: HomeFeedProps) => {
  const { t } = useLang();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [mealCount, setMealCount] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Workout logs count
      const { count: wCount } = await supabase
        .from("workout_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setWorkoutCount(wCount || 0);

      // Meals logged today
      const today = new Date().toISOString().split("T")[0];
      const { count: mCount } = await supabase
        .from("user_nutrition")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", today);
      setMealCount(mCount || 0);

      // Simple streak calc - count consecutive days with logs
      const { data: logs } = await supabase
        .from("workout_logs")
        .select("logged_at")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(30);
      
      if (logs && logs.length > 0) {
        let s = 0;
        const seen = new Set<string>();
        logs.forEach(l => seen.add(new Date(l.logged_at).toDateString()));
        const d = new Date();
        for (let i = 0; i < 30; i++) {
          if (seen.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1); }
          else break;
        }
        setStreak(s);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { id: "workout", icon: Dumbbell, labelKey: "home.qa.workout", color: "from-primary/20 to-primary/5", iconColor: "text-primary", glow: "shadow-[0_0_20px_hsl(180_80%_50%/0.15)]" },
    { id: "nutrition", icon: Apple, labelKey: "home.qa.nutrition", color: "from-cta-green/20 to-cta-green/5", iconColor: "text-cta-green", glow: "shadow-[0_0_20px_hsl(145_70%_40%/0.15)]" },
    { id: "knowledgeHub", icon: BookOpen, labelKey: "home.qa.academy", color: "from-cta-orange/20 to-cta-orange/5", iconColor: "text-cta-orange", glow: "shadow-[0_0_20px_hsl(25_95%_53%/0.15)]" },
    { id: "recovery", icon: Heart, labelKey: "home.qa.physio", color: "from-accent/20 to-accent/5", iconColor: "text-accent", glow: "shadow-[0_0_20px_hsl(270_60%_60%/0.15)]" },
  ];

  const tips = [
    { icon: Flame, titleKey: "home.tip1.title", descKey: "home.tip1.desc" },
    { icon: TrendingUp, titleKey: "home.tip2.title", descKey: "home.tip2.desc" },
    { icon: Dumbbell, titleKey: "home.tip3.title", descKey: "home.tip3.desc" },
  ];

  return (
    <div className="pb-24">
      {/* Hero with overlay */}
      <div className="relative h-52 overflow-hidden">
        <img src={heroImg} alt="FuelCore" className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-3">
          <motion.img
            src={logo}
            alt="FuelCore"
            width={44}
            height={44}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="drop-shadow-[0_0_14px_hsl(180_80%_50%/0.6)]"
          />
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-xl font-display font-bold tracking-wider neon-text text-primary">
              {t("home.title")}
            </h1>
            <p className="text-xs text-muted-foreground">{t("home.subtitle")}</p>
          </motion.div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="px-5 -mt-2 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-4 grid grid-cols-3 gap-3"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-xl font-display font-bold text-foreground">{workoutCount}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("home.stat.workouts")}</p>
          </div>
          <div className="text-center border-x border-border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-cta-orange" />
            </div>
            <p className="text-xl font-display font-bold text-foreground">{streak}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("home.stat.streak")}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Apple className="w-3.5 h-3.5 text-cta-green" />
            </div>
            <p className="text-xl font-display font-bold text-foreground">{mealCount}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("home.stat.mealsToday")}</p>
          </div>
        </motion.div>
      </div>

      {/* Daily Motivation */}
      <div className="px-5 mt-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-4 border-l-4 border-cta-orange relative overflow-hidden"
        >
          <div className="absolute top-2 right-3 opacity-10">
            <Sparkles className="w-12 h-12 text-cta-orange" />
          </div>
          <p className="text-[10px] font-display font-semibold text-cta-orange tracking-[0.2em] uppercase mb-1">
            {t("home.dailyMotivation")}
          </p>
          <p className="text-foreground text-sm italic leading-relaxed">"{t(`home.motivationQuote.${new Date().getDay()}`)}"</p>
        </motion.div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-5 mt-6">
        <h3 className="text-[10px] font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">
          {t("home.quickActions")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                onClick={() => onNavigate?.(action.id)}
                className={`glass-card rounded-2xl p-4 text-left bg-gradient-to-br ${action.color} ${action.glow} hover:scale-[1.02] active:scale-[0.98] transition-transform`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="font-display font-semibold text-foreground text-sm tracking-wide">
                  {t(action.labelKey)}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Fitness Tips */}
      <div className="px-5 mt-6">
        <h3 className="text-[10px] font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">
          {t("home.tipsTitle")}
        </h3>
        <div className="space-y-2.5">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="glass-card rounded-xl p-3.5 flex items-start gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <tip.icon className="w-4 h-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm leading-tight">{t(tip.titleKey)}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(tip.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;
