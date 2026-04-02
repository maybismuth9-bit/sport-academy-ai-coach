import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, Dumbbell, Zap, Play, Edit3, TrendingUp, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/contexts/LangContext";

interface Exercise {
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  rest: string;
  weight?: string;
  suggestedIncrease?: string;
}

interface DayPlan {
  dayKey: string;
  focus: string;
  exercises: Exercise[];
}

const weeklyPlan: DayPlan[] = [
  {
    dayKey: "workout.day.sun",
    focus: "Push (Chest/Shoulders/Triceps)",
    exercises: [
      { name: "Barbell Bench Press", muscle: "Chest", sets: 4, reps: "8-10", rest: "90s", weight: "60kg", suggestedIncrease: "+2.5kg" },
      { name: "Overhead Press", muscle: "Shoulders", sets: 3, reps: "10-12", rest: "60s", weight: "35kg", suggestedIncrease: "+2.5kg" },
      { name: "Incline DB Press", muscle: "Upper Chest", sets: 3, reps: "10-12", rest: "60s", weight: "22kg" },
      { name: "Tricep Pushdown", muscle: "Triceps", sets: 3, reps: "12-15", rest: "45s", weight: "25kg" },
    ],
  },
  {
    dayKey: "workout.day.mon",
    focus: "Pull (Back/Biceps)",
    exercises: [
      { name: "Deadlift", muscle: "Full Back", sets: 4, reps: "6-8", rest: "120s", weight: "100kg", suggestedIncrease: "+5kg" },
      { name: "Weighted Pull-Ups", muscle: "Lats", sets: 4, reps: "8-10", rest: "90s", weight: "+10kg" },
      { name: "Seated Row", muscle: "Rhomboids", sets: 3, reps: "10-12", rest: "60s", weight: "50kg" },
      { name: "Barbell Curl", muscle: "Biceps", sets: 3, reps: "10-12", rest: "45s", weight: "25kg" },
    ],
  },
  {
    dayKey: "workout.day.tue",
    focus: "Rest / Active Recovery",
    exercises: [],
  },
  {
    dayKey: "workout.day.wed",
    focus: "Legs & Core",
    exercises: [
      { name: "Barbell Squat", muscle: "Quads/Glutes", sets: 4, reps: "8-10", rest: "120s", weight: "80kg", suggestedIncrease: "+5kg" },
      { name: "Romanian Deadlift", muscle: "Hamstrings", sets: 3, reps: "10-12", rest: "90s", weight: "60kg" },
      { name: "Leg Press", muscle: "Quads", sets: 3, reps: "12-15", rest: "60s", weight: "120kg" },
      { name: "Hanging Leg Raise", muscle: "Core", sets: 3, reps: "12-15", rest: "45s" },
    ],
  },
  {
    dayKey: "workout.day.thu",
    focus: "Upper Body (Hypertrophy)",
    exercises: [
      { name: "Cable Chest Fly", muscle: "Chest", sets: 3, reps: "12-15", rest: "60s", weight: "15kg" },
      { name: "Lat Pulldown", muscle: "Lats", sets: 3, reps: "10-12", rest: "60s", weight: "55kg" },
      { name: "Lateral Raise", muscle: "Delts", sets: 3, reps: "15-20", rest: "45s", weight: "10kg" },
      { name: "Face Pulls", muscle: "Rear Delts", sets: 3, reps: "15-20", rest: "45s", weight: "20kg" },
    ],
  },
  {
    dayKey: "workout.day.fri",
    focus: "Rest / Active Recovery",
    exercises: [],
  },
  {
    dayKey: "workout.day.sat",
    focus: "Full Body / Weak Points",
    exercises: [
      { name: "Front Squat", muscle: "Quads/Core", sets: 3, reps: "8-10", rest: "90s", weight: "50kg" },
      { name: "Dumbbell Row", muscle: "Back", sets: 3, reps: "10-12", rest: "60s", weight: "30kg" },
      { name: "Push-Ups", muscle: "Chest/Triceps", sets: 3, reps: "To failure", rest: "60s" },
    ],
  },
];

const aiExercises = [
  { name: "Lat Pulldown", muscle: "Back — Lats", reps: "4 × 10-12" },
  { name: "Cable Chest Fly", muscle: "Chest — Pectorals", reps: "3 × 12-15" },
  { name: "Seated Row", muscle: "Back — Rhomboids", reps: "3 × 10-12" },
];

const WorkoutGenerator = () => {
  const { t } = useLang();
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [customValues, setCustomValues] = useState<Record<string, { weight?: string; reps?: string }>>({});

  // Gym scanner state
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanWorkout, setScanWorkout] = useState<typeof aiExercises | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 5 - images.length;
    const toProcess = files.slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev.slice(0, 4), ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const generateWorkout = () => {
    setLoading(true);
    setScanWorkout(null);
    setTimeout(() => { setScanWorkout(aiExercises); setLoading(false); }, 2500);
  };

  const day = weeklyPlan[selectedDay];

  const getCustomValue = (exName: string, field: "weight" | "reps") => {
    return customValues[exName]?.[field];
  };

  const setCustomValue = (exName: string, field: "weight" | "reps", value: string) => {
    setCustomValues((prev) => ({
      ...prev,
      [exName]: { ...prev[exName], [field]: value },
    }));
  };

  return (
    <div className="px-5 pt-8 pb-28">
      <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">{t("workout.title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("workout.subtitle")}</p>

      {/* Weekly Day Selector */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
        {weeklyPlan.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-display font-semibold tracking-wider transition-all duration-300 ${
              selectedDay === i
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(180_80%_50%/0.4)]"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(d.dayKey)}
          </button>
        ))}
      </div>

      {/* Day Focus */}
      <div className="glass-card rounded-xl p-4 mb-5">
        <p className="text-sm font-semibold text-foreground">{day.focus}</p>
        {day.exercises.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">Active recovery — light stretching, walking, or foam rolling.</p>
        )}
      </div>

      {/* Exercise Cards */}
      {day.exercises.length > 0 && (
        <div className="space-y-3 mb-8">
          {day.exercises.map((ex, i) => (
            <motion.div
              key={`${selectedDay}-${ex.name}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.muscle}</p>
                  </div>
                  <button
                    onClick={() => setEditingExercise(editingExercise === ex.name ? null : ex.name)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-display">
                    {ex.sets} {t("workout.sets")}
                  </span>
                  <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full font-display">
                    {getCustomValue(ex.name, "reps") || ex.reps} {t("workout.reps")}
                  </span>
                  <span className="text-muted-foreground">{ex.rest} {t("workout.rest")}</span>
                </div>

                {/* Weight & Progressive Overload */}
                {ex.weight && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-foreground font-medium">
                      {getCustomValue(ex.name, "weight") || ex.weight}
                    </span>
                    {ex.suggestedIncrease && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-cta-green bg-cta-green/10 px-1.5 py-0.5 rounded-full">
                        <ChevronUp className="w-3 h-3" />
                        {ex.suggestedIncrease}
                      </span>
                    )}
                  </div>
                )}

                {/* Video placeholder */}
                <div className="mt-3 w-full h-20 bg-background/50 rounded-lg border border-border flex items-center justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Play className="w-4 h-4" />
                    <span className="text-[10px]">{t("workout.videoPlaceholder")}</span>
                  </div>
                </div>
              </div>

              {/* Manual Adjustment Panel */}
              {editingExercise === ex.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-border p-4 bg-secondary/30"
                >
                  <p className="text-xs font-display font-semibold text-muted-foreground mb-3 tracking-wider uppercase">
                    {t("workout.manualAdjust")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Weight</label>
                      <Input
                        className="h-8 text-xs bg-background border-border"
                        placeholder={ex.weight || "—"}
                        value={getCustomValue(ex.name, "weight") || ""}
                        onChange={(e) => setCustomValue(ex.name, "weight", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Reps</label>
                      <Input
                        className="h-8 text-xs bg-background border-border"
                        placeholder={ex.reps}
                        value={getCustomValue(ex.name, "reps") || ""}
                        onChange={(e) => setCustomValue(ex.name, "reps", e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Gym Scanner Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">{t("workout.scanGym")}</h2>
        </div>

        <label className="block cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          <div className={`glass-card rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${images.length > 0 ? "border-primary/30" : "border-border hover:border-primary/40"}`}>
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 p-2">
                {images.map((img, i) => (
                  <img key={i} src={img} alt={`Equipment ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
                ))}
                {images.length < 5 && (
                  <div className="w-full h-24 rounded-lg bg-secondary/50 flex items-center justify-center border border-dashed border-border">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-36 gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{t("workout.upload")}</span>
                <span className="text-xs text-muted-foreground/60">{t("workout.uploadHint")}</span>
              </div>
            )}
          </div>
        </label>

        {images.length > 0 && !scanWorkout && !loading && (
          <Button onClick={generateWorkout} className="w-full mt-4 h-12 bg-primary text-primary-foreground font-display font-semibold tracking-wider">
            <Zap className="w-4 h-4 mr-2" /> {t("workout.generate")}
          </Button>
        )}

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
              </div>
            ))}
          </motion.div>
        )}

        {scanWorkout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
            <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">{t("workout.suggested")}</h2>
            {scanWorkout.map((ex, i) => (
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
    </div>
  );
};

export default WorkoutGenerator;
