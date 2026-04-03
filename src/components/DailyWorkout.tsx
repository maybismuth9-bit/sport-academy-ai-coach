import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import { Dumbbell, Loader2, Play } from "lucide-react";
import { motion } from "framer-motion";

interface Exercise {
  id: string;
  title: string;
  video_url: string | null;
  instructions: string | null;
  muscle_group: string;
}

const muscleGroupColors: Record<string, string> = {
  Chest: "bg-cta-orange/15 text-cta-orange",
  Back: "bg-primary/15 text-primary",
  Legs: "bg-cta-green/15 text-cta-green",
  Shoulders: "bg-accent/15 text-accent",
  Arms: "bg-cta-orange/15 text-cta-orange",
  Core: "bg-primary/15 text-primary",
};

const DailyWorkout = () => {
  const { t } = useLang();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("exercises").select("*").order("muscle_group");
      if (data) setExercises(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center gap-2 mb-1">
        <Dumbbell className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
          {t("dailyWorkout.title")}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t("dailyWorkout.subtitle")}</p>

      {exercises.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t("dailyWorkout.empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              {ex.video_url && (
                <div className="relative aspect-video bg-secondary">
                  <video
                    src={ex.video_url}
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                </div>
              )}
              {!ex.video_url && (
                <div className="aspect-video bg-secondary/50 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{t("dailyWorkout.videoSoon")}</p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-display font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${muscleGroupColors[ex.muscle_group] || "bg-primary/10 text-primary"}`}>
                    {ex.muscle_group}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm">{ex.title}</h3>
                {ex.instructions && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ex.instructions}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyWorkout;
