import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Dumbbell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";

const sampleWorkouts = [
  { name: "Barbell Bench Press", sets: 4, reps: "8-10", rest: "90s" },
  { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60s" },
  { name: "Cable Flyes", sets: 3, reps: "12-15", rest: "60s" },
  { name: "Tricep Pushdowns", sets: 3, reps: "12-15", rest: "45s" },
  { name: "Overhead Tricep Extension", sets: 3, reps: "10-12", rest: "45s" },
];

const WorkoutGenerator = () => {
  const { t } = useLang();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<typeof sampleWorkouts | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { setImage(ev.target?.result as string); generateWorkout(); };
      reader.readAsDataURL(file);
    }
  };

  const generateWorkout = () => {
    setLoading(true); setWorkout(null);
    setTimeout(() => { setWorkout(sampleWorkouts); setLoading(false); }, 2000);
  };

  return (
    <div className="px-5 pt-8 pb-28">
      <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">{t("workout.title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("workout.subtitle")}</p>

      <label className="block cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <div className={`glass-card rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${image ? "border-primary/30" : "border-border hover:border-primary/40"}`}>
          {image ? (
            <img src={image} alt="Equipment" className="w-full h-48 object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Upload className="w-10 h-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("workout.upload")}</span>
            </div>
          )}
        </div>
      </label>

      {image && !workout && !loading && (
        <Button onClick={generateWorkout} className="w-full mt-4 h-12 bg-primary text-primary-foreground font-display font-semibold tracking-wider">
          <Zap className="w-4 h-4 mr-2" /> {t("workout.generate")}
        </Button>
      )}

      {loading && (
        <div className="flex flex-col items-center mt-10 gap-3">
          <Dumbbell className="w-10 h-10 text-primary animate-pulse-neon" />
          <p className="text-sm text-muted-foreground font-display tracking-wider">{t("workout.analyzing")}</p>
        </div>
      )}

      {workout && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
          <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">{t("workout.suggested")}</h2>
          {workout.map((ex, i) => (
            <motion.div key={ex.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{ex.name}</p>
                <p className="text-sm text-muted-foreground">{ex.sets} {t("workout.sets")} × {ex.reps} {t("workout.reps")}</p>
              </div>
              <span className="text-xs font-display text-primary bg-primary/10 px-2 py-1 rounded-full">{ex.rest}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutGenerator;
