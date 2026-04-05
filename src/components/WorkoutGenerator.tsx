import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Camera, Dumbbell, Zap, Edit3, Save, BarChart3, TrendingUp,
  Trash2, RefreshCw, ChevronUp, ChevronDown, Loader2, CheckCircle2, ArrowRight, Info, MoreVertical
} from "lucide-react";
import workoutHero from "@/assets/workout-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Exercise {
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  rest: string;
  weight?: string;
  description?: string;
  tips?: string[];
}

interface DayPlan {
  label: string;
  focus: string;
  exercises: Exercise[];
}

interface WorkoutLog {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  logged_at: string;
}

type FlowStep = "questionnaire" | "photos" | "generating" | "plan";

const FOCUS_OPTIONS = [
  { key: "chest", label: "Chest" },
  { key: "back", label: "Back" },
  { key: "shoulders", label: "Shoulders" },
  { key: "legs", label: "Legs" },
  { key: "arms", label: "Arms" },
  { key: "core", label: "Core" },
  { key: "fullbody", label: "Full Body" },
];

const WorkoutGenerator = () => {
  const { t, lang } = useLang();

  // Flow state
  const [step, setStep] = useState<FlowStep>("questionnaire");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [skipPhotos, setSkipPhotos] = useState(false);

  // Plan state
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [replacingExercise, setReplacingExercise] = useState<string | null>(null);

  // Tracking state
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [logValues, setLogValues] = useState<Record<string, { sets: string; reps: string; weight: string }>>({});
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [savingLog, setSavingLog] = useState<string | null>(null);

  // Load saved plan and logs
  useEffect(() => {
    const saved = localStorage.getItem("fuelcore_workout_plan");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlan(parsed);
        setStep("plan");
      } catch { /* ignore */ }
    }
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

  // Build previous weights map from logs
  const getPreviousWeights = useCallback(() => {
    const weights: Record<string, number> = {};
    workoutLogs.forEach(log => {
      if (log.weight > 0) weights[log.exercise_name] = log.weight;
    });
    return weights;
  }, [workoutLogs]);

  // Get last logged weight for an exercise
  const getLastWeight = (exerciseName: string): number | null => {
    const logs = workoutLogs.filter(l => l.exercise_name === exerciseName && l.weight > 0);
    if (logs.length === 0) return null;
    return logs[logs.length - 1].weight;
  };

  const generatePlan = async () => {
    setStep("generating");
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout", {
        body: {
          daysPerWeek,
          focusAreas: selectedFocus.length > 0 ? selectedFocus : ["Full Body"],
          equipment: images.length > 0 ? ["gym photos uploaded"] : [],
          language: lang,
          previousWeights: getPreviousWeights(),
        },
      });

      if (error) throw error;
      if (!data?.days) throw new Error("Invalid plan format");

      setPlan(data.days);
      localStorage.setItem("fuelcore_workout_plan", JSON.stringify(data.days));
      setSelectedDay(0);
      setStep("plan");
      toast({ title: "💪", description: t("workout.planReady") });
    } catch (err: any) {
      console.error("Generate workout error:", err);
      toast({ title: t("nutritionPlan.error"), description: err.message, variant: "destructive" });
      setStep("questionnaire");
    }
  };

  const deleteExercise = async (dayIdx: number, exIdx: number) => {
    if (!plan) return;
    const updated = [...plan];
    const day = { ...updated[dayIdx], exercises: [...updated[dayIdx].exercises] };

    // Replace with AI
    setReplacingExercise(day.exercises[exIdx].name);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout", {
        body: {
          daysPerWeek: 1,
          focusAreas: [day.focus],
          language: lang,
          previousWeights: getPreviousWeights(),
        },
      });

      if (error) throw error;
      const newExercise = data?.days?.[0]?.exercises?.find(
        (e: Exercise) => !day.exercises.some(ex => ex.name === e.name)
      );

      if (newExercise) {
        day.exercises[exIdx] = newExercise;
      } else {
        day.exercises.splice(exIdx, 1);
      }
    } catch {
      day.exercises.splice(exIdx, 1);
    }

    updated[dayIdx] = day;
    setPlan(updated);
    localStorage.setItem("fuelcore_workout_plan", JSON.stringify(updated));
    setReplacingExercise(null);
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

  const resetPlan = () => {
    setPlan(null);
    setStep("questionnaire");
    setImages([]);
    setSelectedFocus([]);
    setSkipPhotos(false);
    localStorage.removeItem("fuelcore_workout_plan");
  };

  const toggleFocus = (key: string) => {
    setSelectedFocus(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const graphData = getGraphData();
  const currentDay = plan?.[selectedDay];

  // ─── QUESTIONNAIRE STEP ───
  if (step === "questionnaire") {
    return (
      <div className="pb-28">
        {/* Hero image */}
        <div className="relative h-40 overflow-hidden">
          <img src={workoutHero} alt="Workout" className="w-full h-full object-cover" loading="lazy" width={1080} height={640} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
              {t("workout.title")}
            </h1>
            <p className="text-xs text-muted-foreground">{t("workout.setupDesc")}</p>
          </div>
        </div>
        <div className="px-5 pt-5">
        <div className="glass-card rounded-xl p-5 mb-5">
          <p className="text-sm font-semibold text-foreground mb-3">{t("workout.howManyDays")}</p>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => setDaysPerWeek(n)}
                className={`flex-1 py-3 rounded-lg text-sm font-display font-bold transition-all ${
                  daysPerWeek === n
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(180_80%_50%/0.4)]"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Focus areas */}
        <div className="glass-card rounded-xl p-5 mb-5">
          <p className="text-sm font-semibold text-foreground mb-3">{t("workout.focusAreas")}</p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => toggleFocus(opt.key)}
                className={`px-3 py-2 rounded-full text-xs font-display font-semibold tracking-wider transition-all ${
                  selectedFocus.includes(opt.key)
                    ? "bg-cta-orange text-black"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`workout.focus.${opt.key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Next: photos or skip */}
        <div className="flex gap-3">
          <Button
            onClick={() => setStep("photos")}
            className="flex-1 h-12 bg-primary text-primary-foreground font-display font-semibold tracking-wider"
          >
            <Camera className="w-4 h-4 mr-2" />
            {t("workout.uploadPhotos")}
          </Button>
          <Button
            onClick={() => { setSkipPhotos(true); generatePlan(); }}
            variant="outline"
            className="flex-1 h-12 font-display font-semibold tracking-wider border-primary/30"
          >
            <Zap className="w-4 h-4 mr-2" />
            {t("workout.skipToAi")}
          </Button>
        </div>
      </div>
    );
  }

  // ─── PHOTOS STEP ───
  if (step === "photos") {
    return (
      <div className="px-5 pt-8 pb-28">
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">
          {t("workout.scanGym")}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">{t("workout.uploadHint")}</p>

        <label className="block cursor-pointer mb-5">
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
              </div>
            )}
          </div>
        </label>

        <Button
          onClick={generatePlan}
          disabled={images.length === 0}
          className="w-full h-12 bg-cta-green hover:bg-cta-green/90 text-black font-display font-bold tracking-wider"
        >
          <Zap className="w-4 h-4 mr-2" />
          {t("workout.generate")}
        </Button>

        <button
          onClick={() => setStep("questionnaire")}
          className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground text-center"
        >
          ← {t("workout.back")}
        </button>
      </div>
    );
  }

  // ─── GENERATING STEP ───
  if (step === "generating") {
    return (
      <div className="px-5 pt-8 pb-28">
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">
          {t("workout.title")}
        </h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 space-y-4">
          <div className="flex items-center gap-3 justify-center mb-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-primary font-display tracking-wider animate-pulse">
              {t("workout.aiGenerating")}
            </p>
          </div>
          {Array.from({ length: daysPerWeek }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <div className="space-y-2">
                {[1, 2, 3].map(j => <Skeleton key={j} className="h-3 w-full" />)}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  // ─── PLAN VIEW ───
  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
          {t("workout.title")}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={resetPlan} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              {t("workout.regenerate")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setPlan(null); localStorage.removeItem("fuelcore_workout_plan"); setStep("questionnaire"); }} className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
              {t("workout.deletePlan")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t("workout.subtitle")}</p>

      {/* Performance Graph */}
      {graphData.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowGraph(!showGraph)}
            className="flex items-center gap-2 text-xs font-display font-semibold tracking-wider text-primary mb-3"
          >
            <BarChart3 className="w-4 h-4" />
            {showGraph ? t("workout.hideGraph") : t("workout.showGraph")}
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
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                    <Line type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground text-center mt-2">Total Volume (weight × sets × reps)</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Day Selector */}
      {plan && (
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
          {plan.map((d, i) => (
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
      )}

      {/* Day Focus */}
      {currentDay && (
        <div className="glass-card rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-foreground">{currentDay.focus}</p>
        </div>
      )}

      {/* Exercises */}
      {currentDay && (
        <div className="space-y-3">
          {currentDay.exercises.map((ex, i) => {
            const lastWeight = getLastWeight(ex.name);
            const isReplacing = replacingExercise === ex.name;

            return (
              <motion.div
                key={`${selectedDay}-${ex.name}-${i}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card rounded-xl overflow-hidden"
              >
                {isReplacing ? (
                  <div className="p-4 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground">{t("workout.replacing")}</span>
                  </div>
                ) : (
                  <>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-sm">{ex.name}</p>
                          <p className="text-xs text-muted-foreground">{ex.muscle}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedExercise(expandedExercise === ex.name ? null : ex.name)}
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                            title={t("workout.exerciseInfo")}
                          >
                            <Info className="w-3.5 h-3.5 text-primary" />
                          </button>
                          <button
                            onClick={() => setEditingExercise(editingExercise === ex.name ? null : ex.name)}
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => deleteExercise(selectedDay, i)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive/60 hover:text-destructive" />
                          </button>
                        </div>
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

                      {/* Weight display with memory */}
                      <div className="flex items-center gap-2 mt-2">
                        {ex.weight && (
                          <span className="text-xs text-foreground font-medium">
                            {t("workout.suggested")}: {ex.weight}
                          </span>
                        )}
                        {lastWeight !== null && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-cta-green bg-cta-green/10 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("workout.lastUsed")}: {lastWeight}kg
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Exercise Details Panel */}
                    <AnimatePresence>
                      {expandedExercise === ex.name && (ex.description || ex.tips) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border px-4 py-3 bg-primary/5"
                        >
                          {ex.description && (
                            <p className="text-xs text-foreground leading-relaxed mb-2">{ex.description}</p>
                          )}
                          {ex.tips && ex.tips.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-display font-semibold text-primary tracking-wider uppercase mb-1">
                                {t("workout.tips")}
                              </p>
                              {ex.tips.map((tip, ti) => (
                                <div key={ti} className="flex items-start gap-1.5">
                                  <span className="text-primary text-[10px] mt-0.5">•</span>
                                  <p className="text-[11px] text-muted-foreground leading-snug">{tip}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                            {t("workout.logPerformance")}
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-muted-foreground">{t("workout.sets")}</label>
                              <Input
                                type="number"
                                className="h-8 text-xs bg-background border-border"
                                placeholder={String(ex.sets)}
                                value={logValues[ex.name]?.sets || ""}
                                onChange={(e) => setLogValues(prev => ({
                                  ...prev,
                                  [ex.name]: { sets: e.target.value, reps: prev[ex.name]?.reps || "", weight: prev[ex.name]?.weight || "" }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">{t("workout.reps")}</label>
                              <Input
                                type="number"
                                className="h-8 text-xs bg-background border-border"
                                placeholder={ex.reps.split("-")[0]}
                                value={logValues[ex.name]?.reps || ""}
                                onChange={(e) => setLogValues(prev => ({
                                  ...prev,
                                  [ex.name]: { reps: e.target.value, sets: prev[ex.name]?.sets || "", weight: prev[ex.name]?.weight || "" }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">{t("workout.weightKg")}</label>
                              <Input
                                type="number"
                                className="h-8 text-xs bg-background border-border"
                                placeholder={lastWeight ? String(lastWeight) : ex.weight?.replace("kg", "") || "0"}
                                value={logValues[ex.name]?.weight || ""}
                                onChange={(e) => setLogValues(prev => ({
                                  ...prev,
                                  [ex.name]: { weight: e.target.value, sets: prev[ex.name]?.sets || "", reps: prev[ex.name]?.reps || "" }
                                }))}
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => saveLog(ex.name, currentDay.label)}
                            disabled={savingLog === ex.name}
                            className="w-full mt-3 h-8 text-xs bg-cta-green hover:bg-cta-green/90 text-black font-bold"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            {t("nutritionPlan.save")}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkoutGenerator;
