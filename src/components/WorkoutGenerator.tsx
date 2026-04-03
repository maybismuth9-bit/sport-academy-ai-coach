import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Dumbbell, Zap, Play, Edit3, ChevronUp, Save, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
  label: string;
  dayKey: string;
  focus: string;
  exercises: Exercise[];
}

const trainingDays: DayPlan[] = [
  {
    label: "Day 1", dayKey: "workout.day.sun", focus: "Push (Chest/Shoulders/Triceps)",
    exercises: [
      { name: "Barbell Bench Press", muscle: "Chest", sets: 4, reps: "8-10", rest: "90s", weight: "60kg", suggestedIncrease: "+2.5kg" },
      { name: "Overhead Press", muscle: "Shoulders", sets: 3, reps: "10-12", rest: "60s", weight: "35kg", suggestedIncrease: "+2.5kg" },
      { name: "Incline DB Press", muscle: "Upper Chest", sets: 3, reps: "10-12", rest: "60s", weight: "22kg" },
      { name: "Tricep Pushdown", muscle: "Triceps", sets: 3, reps: "12-15", rest: "45s", weight: "25kg" },
    ],
  },
  {
    label: "Day 2", dayKey: "workout.day.mon", focus: "Pull (Back/Biceps)",
    exercises: [
      { name: "Deadlift", muscle: "Full Back", sets: 4, reps: "6-8", rest: "120s", weight: "100kg", suggestedIncrease: "+5kg" },
      { name: "Weighted Pull-Ups", muscle: "Lats", sets: 4, reps: "8-10", rest: "90s", weight: "+10kg" },
      { name: "Seated Row", muscle: "Rhomboids", sets: 3, reps: "10-12", rest: "60s", weight: "50kg" },
      { name: "Barbell Curl", muscle: "Biceps", sets: 3, reps: "10-12", rest: "45s", weight: "25kg" },
    ],
  },
  {
    label: "Day 3", dayKey: "workout.day.wed", focus: "Legs & Core",
    exercises: [
      { name: "Barbell Squat", muscle: "Quads/Glutes", sets: 4, reps: "8-10", rest: "120s", weight: "80kg", suggestedIncrease: "+5kg" },
      { name: "Romanian Deadlift", muscle: "Hamstrings", sets: 3, reps: "10-12", rest: "90s", weight: "60kg" },
      { name: "Leg Press", muscle: "Quads", sets: 3, reps: "12-15", rest: "60s", weight: "120kg" },
      { name: "Hanging Leg Raise", muscle: "Core", sets: 3, reps: "12-15", rest: "45s" },
    ],
  },
  {
    label: "Day 4", dayKey: "workout.day.thu", focus: "Upper Body (Hypertrophy)",
    exercises: [
      { name: "Cable Chest Fly", muscle: "Chest", sets: 3, reps: "12-15", rest: "60s", weight: "15kg" },
      { name: "Lat Pulldown", muscle: "Lats", sets: 3, reps: "10-12", rest: "60s", weight: "55kg" },
      { name: "Lateral Raise", muscle: "Delts", sets: 3, reps: "15-20", rest: "45s", weight: "10kg" },
      { name: "Face Pulls", muscle: "Rear Delts", sets: 3, reps: "15-20", rest: "45s", weight: "20kg" },
    ],
  },
  {
    label: "Free", dayKey: "workout.day.sat", focus: "Full Body / Weak Points",
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

interface WorkoutLog {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  logged_at: string;
}

const WorkoutGenerator = () => {
  const { t } = useLang();
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [logValues, setLogValues] = useState<Record<string, { sets: string; reps: string; weight: string }>>({});
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [savingLog, setSavingLog] = useState<string | null>(null);

  // Gym scanner state
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanWorkout, setScanWorkout] = useState<typeof aiExercises | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: true });
    if (data) setWorkoutLogs(data as WorkoutLog[]);
  };

  const saveLog = async (exerciseName: string, dayLabel: string) => {
    const vals = logValues[exerciseName];
    if (!vals?.sets && !vals?.reps && !vals?.weight) return;
    
    setSavingLog(exerciseName);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("workout_logs").insert({
      user_id: user.id,
      exercise_name: exerciseName,
      sets: parseInt(vals.sets) || 0,
      reps: parseInt(vals.reps) || 0,
      weight: parseFloat(vals.weight) || 0,
      training_day: dayLabel,
    });

    if (error) {
      toast({ title: t("nutritionPlan.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅", description: t("nutritionPlan.updated") });
      setLogValues(prev => ({ ...prev, [exerciseName]: { sets: "", reps: "", weight: "" } }));
      setEditingExercise(null);
      fetchLogs();
    }
    setSavingLog(null);
  };

  // Build graph data from logs
  const getGraphData = () => {
    if (workoutLogs.length === 0) return [];
    const byDate: Record<string, number> = {};
    workoutLogs.forEach(log => {
      const date = new Date(log.logged_at).toLocaleDateString();
      byDate[date] = (byDate[date] || 0) + (log.weight * log.sets * log.reps);
    });
    return Object.entries(byDate).map(([date, volume]) => ({ date, volume: Math.round(volume) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 5 - images.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImages((prev) => [...prev.slice(0, 4), ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const generateWorkout = () => {
    setLoading(true);
    setScanWorkout(null);
    setTimeout(() => { setScanWorkout(aiExercises); setLoading(false); }, 2500);
  };

  const day = trainingDays[selectedDay];
  const graphData = getGraphData();

  return (
    <div className="px-5 pt-8 pb-28">
      <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">{t("workout.title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("workout.subtitle")}</p>

      {/* Performance Graph Toggle */}
      {graphData.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowGraph(!showGraph)}
            className="flex items-center gap-2 text-xs font-display font-semibold tracking-wider text-primary mb-3"
          >
            <BarChart3 className="w-4 h-4" />
            {showGraph ? "Hide" : "Show"} Performance Graph
            <TrendingUp className="w-3 h-3" />
          </button>
          <AnimatePresence>
            {showGraph && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="glass-card rounded-xl p-4"
              >
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={graphData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground text-center mt-2">Total Volume (weight × sets × reps)</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Training Day Selector */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
        {trainingDays.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-display font-semibold tracking-wider transition-all duration-300 ${
              selectedDay === i
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(180_80%_50%/0.4)]"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Day Focus */}
      <div className="glass-card rounded-xl p-4 mb-5">
        <p className="text-sm font-semibold text-foreground">{day.focus}</p>
      </div>

      {/* Exercise Cards with Performance Tracking */}
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

                <div className="flex items-center gap-3 text-xs">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-display">
                    {ex.sets} {t("workout.sets")}
                  </span>
                  <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full font-display">
                    {ex.reps} {t("workout.reps")}
                  </span>
                  <span className="text-muted-foreground">{ex.rest} {t("workout.rest")}</span>
                </div>

                {ex.weight && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-foreground font-medium">{ex.weight}</span>
                    {ex.suggestedIncrease && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-cta-green bg-cta-green/10 px-1.5 py-0.5 rounded-full">
                        <ChevronUp className="w-3 h-3" />
                        {ex.suggestedIncrease}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 w-full h-20 bg-background/50 rounded-lg border border-border flex items-center justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Play className="w-4 h-4" />
                    <span className="text-[10px]">{t("workout.videoPlaceholder")}</span>
                  </div>
                </div>
              </div>

              {/* Performance Tracking Panel */}
              <AnimatePresence>
                {editingExercise === ex.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border p-4 bg-secondary/30"
                  >
                    <p className="text-xs font-display font-semibold text-muted-foreground mb-3 tracking-wider uppercase">
                      Log Performance
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">{t("workout.sets")}</label>
                        <Input
                          type="number"
                          className="h-8 text-xs bg-background border-border"
                          placeholder={String(ex.sets)}
                          value={logValues[ex.name]?.sets || ""}
                          onChange={(e) => setLogValues(prev => ({ ...prev, [ex.name]: { ...prev[ex.name], sets: e.target.value, reps: prev[ex.name]?.reps || "", weight: prev[ex.name]?.weight || "" } }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">{t("workout.reps")}</label>
                        <Input
                          type="number"
                          className="h-8 text-xs bg-background border-border"
                          placeholder={ex.reps.split("-")[0]}
                          value={logValues[ex.name]?.reps || ""}
                          onChange={(e) => setLogValues(prev => ({ ...prev, [ex.name]: { ...prev[ex.name], reps: e.target.value, sets: prev[ex.name]?.sets || "", weight: prev[ex.name]?.weight || "" } }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Weight</label>
                        <Input
                          type="number"
                          className="h-8 text-xs bg-background border-border"
                          placeholder={ex.weight?.replace("kg", "") || "0"}
                          value={logValues[ex.name]?.weight || ""}
                          onChange={(e) => setLogValues(prev => ({ ...prev, [ex.name]: { ...prev[ex.name], weight: e.target.value, sets: prev[ex.name]?.sets || "", reps: prev[ex.name]?.reps || "" } }))}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => saveLog(ex.name, day.label)}
                      disabled={savingLog === ex.name}
                      className="w-full mt-3 h-8 text-xs bg-cta-green hover:bg-cta-green/90 text-black font-bold"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {t("nutritionPlan.save")}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Gym Scanner */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">{t("workout.scanGym")}</h2>
        </div>

        <label className="block cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          <div className={`glass-card rounded-2xl border-2 border-dashed transition-all ${images.length > 0 ? "border-primary/30" : "border-border hover:border-primary/40"}`}>
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
