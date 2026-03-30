import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, Dumbbell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/contexts/LangContext";

const aiExercises = [
  { name: "Lat Pulldown", muscle: "Back — Lats", reps: "4 × 10-12" },
  { name: "Cable Chest Fly", muscle: "Chest — Pectorals", reps: "3 × 12-15" },
  { name: "Seated Row", muscle: "Back — Rhomboids", reps: "3 × 10-12" },
];

const WorkoutGenerator = () => {
  const { t } = useLang();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<typeof aiExercises | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { setImage(ev.target?.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const generateWorkout = () => {
    setLoading(true);
    setWorkout(null);
    setTimeout(() => { setWorkout(aiExercises); setLoading(false); }, 2500);
  };

  return (
    <div className="px-5 pt-8 pb-28">
      <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">{t("workout.title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("workout.subtitle")}</p>

      {/* Scan My Gym */}
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-4 h-4 text-primary" />
        <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">{t("workout.scanGym")}</h2>
      </div>

      <label className="block cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <div className={`glass-card rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${image ? "border-primary/30" : "border-border hover:border-primary/40"}`}>
          {image ? (
            <img src={image} alt="Equipment" className="w-full h-48 object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{t("workout.upload")}</span>
              <span className="text-xs text-muted-foreground/60">{t("workout.uploadHint")}</span>
            </div>
          )}
        </div>
      </label>

      {image && !workout && !loading && (
        <Button onClick={generateWorkout} className="w-full mt-4 h-12 bg-primary text-primary-foreground font-display font-semibold tracking-wider">
          <Zap className="w-4 h-4 mr-2" /> {t("workout.generate")}
        </Button>
      )}

      {/* Loading skeleton */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-4 h-4 text-primary animate-pulse" />
            <p className="text-sm text-primary font-display tracking-wider animate-pulse">{t("workout.aiIdentifying")}</p>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </motion.div>
      )}

      {/* Results */}
      {workout && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
          <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">{t("workout.suggested")}</h2>
          {workout.map((ex, i) => (
            <motion.div key={ex.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{ex.name}</p>
                <p className="text-xs text-muted-foreground">{ex.muscle}</p>
              </div>
              <span className="text-xs font-display text-primary bg-primary/10 px-3 py-1 rounded-full">{ex.reps}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutGenerator;
