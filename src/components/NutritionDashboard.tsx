import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NutritionPlan, AssessmentData } from "@/components/AssessmentForm";
import {
  Sparkles, Loader2, ChevronLeft, ChevronRight,
  Apple, Plus, Pencil, Trash2, Utensils, MoreVertical, RefreshCw, ArrowLeftRight, Target, CheckSquare, Square
} from "lucide-react";
import {
  getNutritionCompletionState, saveNutritionCompletionState,
  isNutritionMealCompleted, updateNutritionMealCompletion,
  saveStoredNutritionPlan,
} from "@/lib/weeklyTracking";
import nutritionHero from "@/assets/nutrition-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MealItem {
  food: string;
  amount: string;
  calories: number;
  protein?: number;
}

interface MealSlot {
  mealName: string;
  time: string;
  items: MealItem[];
}

interface MealPlanDay {
  day: string;
  totalCalories: number;
  meals: MealSlot[];
}

interface ManualMeal {
  id: string;
  meal_time: string;
  food_name: string;
  calories: number;
  protein: number;
}

interface NutritionDashboardProps {
  plan: NutritionPlan | null;
  assessmentData?: AssessmentData | null;
}

const DAYS_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

const mealTimes = ["Breakfast", "Lunch", "Dinner", "Snack"];

const NutritionDashboard = ({ plan, assessmentData }: NutritionDashboardProps) => {
  const { t, lang } = useLang();

  // AI plan state
  const [aiMealPlan, setAiMealPlan] = useState<MealPlanDay[] | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [swappingKey, setSwappingKey] = useState<string | null>(null);

  // Custom calorie goal
  const [calorieGoal, setCalorieGoal] = useState<number>(() => {
    const saved = localStorage.getItem("fuelcore_calorie_goal");
    return saved ? parseInt(saved) : 0;
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  // Manual meals state
  const [meals, setMeals] = useState<ManualMeal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [editMeal, setEditMeal] = useState<ManualMeal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ food_name: "", calories: "", protein: "", meal_time: "Breakfast" });
  const [saving, setSaving] = useState(false);

  // Completion tracking
  const [nutritionCompletion, setNutritionCompletion] = useState(getNutritionCompletionState());

  const toggleMealComplete = (dayIdx: number, mealIdx: number, mealCount: number) => {
    const current = isNutritionMealCompleted(nutritionCompletion, dayIdx, mealIdx);
    const next = updateNutritionMealCompletion(nutritionCompletion, dayIdx, mealIdx, mealCount, !current);
    setNutritionCompletion(next);
    saveNutritionCompletionState(next);
  };

  useEffect(() => {
    loadSavedPlan();
    fetchManualMeals();
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

  const fetchManualMeals = async () => {
    const { data } = await supabase
      .from("user_nutrition")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setMeals(data as ManualMeal[]);
    setLoadingMeals(false);
  };

  const generateAIMealPlan = async () => {
    setGeneratingPlan(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const defaults = {
        goal: "maintenance",
        weight: 75,
        height: 175,
        age: 30,
        activityLevel: "3",
        allergies: "None",
        mealFrequency: 4,
      };

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          goal: assessmentData?.goal || defaults.goal,
          weight: assessmentData?.weight || defaults.weight,
          height: assessmentData?.height || defaults.height,
          age: assessmentData?.age || defaults.age,
          activityLevel: assessmentData?.activityLevel || defaults.activityLevel,
          allergies: assessmentData?.allergies?.join(", ") || defaults.allergies,
          mealFrequency: assessmentData?.mealFrequency || defaults.mealFrequency,
          language: lang,
        },
      });

      if (error) throw error;
      if (data?.plan?.days) {
        setAiMealPlan(data.plan.days);
        saveStoredNutritionPlan(data.plan.days);
        setSelectedDayIdx(0);
        await supabase.from("ai_meal_plans").insert({
          user_id: user.id,
          plan_data: data.plan,
          goal: assessmentData?.goal || "maintenance",
        });
        toast({ title: "🍽️", description: t("nutrition.planReady") });
      }
    } catch (err: any) {
      toast({ title: t("nutritionPlan.error"), description: err.message, variant: "destructive" });
    } finally {
      setGeneratingPlan(false);
    }
  };

  const swapItem = async (dayIdx: number, mealIdx: number, itemIdx: number) => {
    if (!aiMealPlan) return;
    const key = `${dayIdx}-${mealIdx}-${itemIdx}`;
    setSwappingKey(key);
    try {
      const item = aiMealPlan[dayIdx].meals[mealIdx].items[itemIdx];
      const { data, error } = await supabase.functions.invoke("swap-meal-item", {
        body: {
          mode: "swap_item",
          currentItem: item,
          allergies: assessmentData?.allergies?.join(", ") || "None",
          language: lang,
        },
      });
      if (error) throw error;
      if (data?.result) {
        const updated = [...aiMealPlan];
        updated[dayIdx].meals[mealIdx].items[itemIdx] = data.result;
        updated[dayIdx].totalCalories = updated[dayIdx].meals.reduce(
          (s, m) => s + m.items.reduce((ss, it) => ss + it.calories, 0), 0
        );
        setAiMealPlan(updated);
        toast({ title: "✅", description: t("nutrition.swapItem") });
      }
    } catch (err: any) {
      toast({ title: t("nutritionPlan.error"), description: err.message, variant: "destructive" });
    } finally {
      setSwappingKey(null);
    }
  };

  const swapMeal = async (dayIdx: number, mealIdx: number) => {
    if (!aiMealPlan) return;
    const key = `meal-${dayIdx}-${mealIdx}`;
    setSwappingKey(key);
    try {
      const meal = aiMealPlan[dayIdx].meals[mealIdx];
      const { data, error } = await supabase.functions.invoke("swap-meal-item", {
        body: {
          mode: "swap_meal",
          currentMeal: meal,
          allergies: assessmentData?.allergies?.join(", ") || "None",
          language: lang,
        },
      });
      if (error) throw error;
      if (data?.result) {
        const updated = [...aiMealPlan];
        updated[dayIdx].meals[mealIdx] = data.result;
        updated[dayIdx].totalCalories = updated[dayIdx].meals.reduce(
          (s, m) => s + m.items.reduce((ss, it) => ss + it.calories, 0), 0
        );
        setAiMealPlan(updated);
        toast({ title: "✅", description: t("nutrition.swapMeal") });
      }
    } catch (err: any) {
      toast({ title: t("nutritionPlan.error"), description: err.message, variant: "destructive" });
    } finally {
      setSwappingKey(null);
    }
  };

  const adjustMealCount = async (newCount: number) => {
    if (!aiMealPlan) return;
    const key = `adjust-${selectedDayIdx}`;
    setSwappingKey(key);
    try {
      const day = aiMealPlan[selectedDayIdx];
      const { data, error } = await supabase.functions.invoke("swap-meal-item", {
        body: {
          mode: "adjust_meals",
          dailyCalories: day.totalCalories,
          mealCount: newCount,
          goal: assessmentData?.goal || "maintenance",
          allergies: assessmentData?.allergies?.join(", ") || "None",
          language: lang,
        },
      });
      if (error) throw error;
      if (data?.result?.meals) {
        const updated = [...aiMealPlan];
        updated[selectedDayIdx] = {
          ...updated[selectedDayIdx],
          meals: data.result.meals,
          totalCalories: data.result.totalCalories || day.totalCalories,
        };
        setAiMealPlan(updated);
        toast({ title: "✅", description: t("nutrition.adjustMeals") });
      }
    } catch (err: any) {
      toast({ title: t("nutritionPlan.error"), description: err.message, variant: "destructive" });
    } finally {
      setSwappingKey(null);
    }
  };

  const handleSaveGoal = () => {
    const val = parseInt(goalInput);
    if (val > 0) {
      setCalorieGoal(val);
      localStorage.setItem("fuelcore_calorie_goal", String(val));
      toast({ title: "✅", description: t("nutrition.calorieGoal") });
    }
    setEditingGoal(false);
    setGoalInput("");
  };

  // Manual meal CRUD
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editMeal) {
        const { error } = await supabase
          .from("user_nutrition")
          .update({
            food_name: form.food_name,
            calories: parseInt(form.calories) || 0,
            protein: parseFloat(form.protein) || 0,
            meal_time: form.meal_time,
          })
          .eq("id", editMeal.id);
        if (error) throw error;
        toast({ title: t("nutritionPlan.updated") });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { error } = await supabase
          .from("user_nutrition")
          .insert({
            user_id: user.id,
            food_name: form.food_name,
            calories: parseInt(form.calories) || 0,
            protein: parseFloat(form.protein) || 0,
            meal_time: form.meal_time,
          });
        if (error) throw error;
        toast({ title: t("nutritionPlan.added") });
      }
      setEditMeal(null);
      setShowAdd(false);
      setForm({ food_name: "", calories: "", protein: "", meal_time: "Breakfast" });
      fetchManualMeals();
    } catch (err: any) {
      toast({ title: t("nutritionPlan.error"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("user_nutrition").delete().eq("id", id);
    toast({ title: t("nutritionPlan.deleted") });
    fetchManualMeals();
  };

  const openEdit = (meal: ManualMeal) => {
    setEditMeal(meal);
    setForm({
      food_name: meal.food_name,
      calories: String(meal.calories),
      protein: String(meal.protein),
      meal_time: meal.meal_time,
    });
  };

  const totalCals = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const dialogOpen = !!editMeal || showAdd;
  const currentAiDay = aiMealPlan?.[selectedDayIdx];

  // Daily protein from AI plan
  const aiDayProtein = currentAiDay?.meals.reduce(
    (s, m) => s + m.items.reduce((ss, it) => ss + (it.protein || 0), 0), 0
  ) || 0;

  const getDayLabel = (day: MealPlanDay, idx: number) => {
    if (lang === "he") return DAYS_HE[idx] || day.day;
    return day.day;
  };

  const getMealColor = (mealName: string) => {
    const lower = mealName.toLowerCase();
    if (lower.includes("breakfast") || lower.includes("בוקר")) return "bg-cta-orange/15 text-cta-orange border-cta-orange/30";
    if (lower.includes("lunch") || lower.includes("צהריים")) return "bg-primary/15 text-primary border-primary/30";
    if (lower.includes("dinner") || lower.includes("ערב")) return "bg-accent/15 text-accent border-accent/30";
    return "bg-cta-green/15 text-cta-green border-cta-green/30";
  };

  return (
    <div className="pb-28">
      {/* Hero image */}
      <div className="relative h-40 overflow-hidden">
        <img src={nutritionHero} alt="Nutrition" className="w-full h-full object-cover" loading="lazy" width={1080} height={640} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2">
          <Apple className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
              {t("nutrition.title")}
            </h1>
            <p className="text-xs text-muted-foreground">{t("nutrition.dailyTargets")}</p>
          </div>
        </div>
      </div>
      <div className="px-5 pt-5">

      {/* ═══ AI WEEKLY MEAL PLAN ═══ */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cta-orange" />
            <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              {t("nutrition.weeklyPlan")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!aiMealPlan && (
              <Button
                onClick={generateAIMealPlan}
                disabled={generatingPlan}
                size="sm"
                className="h-8 text-xs bg-cta-orange hover:bg-cta-orange/90 text-black font-bold"
              >
                {generatingPlan ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                {generatingPlan ? t("assess.generating") : t("nutrition.generatePlan")}
              </Button>
            )}
            {aiMealPlan && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={generateAIMealPlan} disabled={generatingPlan} className="gap-2">
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t("nutrition.replacePlan")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setAiMealPlan(null); }} className="gap-2 text-destructive focus:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                    {t("nutrition.deletePlan")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Day selector */}
        {aiMealPlan && (
          <>
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {aiMealPlan.map((day, i) => {
                const shortLabel = lang === "he"
                  ? (DAYS_HE[i] || day.day).slice(0, 3)
                  : day.day.slice(0, 3);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDayIdx(i)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-display font-semibold tracking-wider transition-all duration-300 min-w-[48px] ${
                      selectedDayIdx === i
                        ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(180_80%_50%/0.4)]"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-[10px]">{shortLabel}</span>
                    <span className="text-[9px] mt-0.5 opacity-70">{day.totalCalories}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected day */}
            {currentAiDay && (
              <motion.div
                key={selectedDayIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Day header with meal count adjuster */}
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-display font-bold text-foreground text-sm">
                        {getDayLabel(currentAiDay, selectedDayIdx)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentAiDay.totalCalories} {t("nutrition.kcal")} • {Math.round(aiDayProtein)}g {t("nutrition.protein")}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedDayIdx(Math.max(0, selectedDayIdx - 1))}
                        disabled={selectedDayIdx === 0}
                        className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setSelectedDayIdx(Math.min((aiMealPlan?.length || 1) - 1, selectedDayIdx + 1))}
                        disabled={selectedDayIdx === (aiMealPlan?.length || 1) - 1}
                        className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Meal count selector */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("nutrition.mealsPerDay")}:</span>
                    <div className="flex gap-1">
                      {[3, 4, 5, 6].map(n => (
                        <button
                          key={n}
                          onClick={() => adjustMealCount(n)}
                          disabled={!!swappingKey || currentAiDay.meals.length === n}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            currentAiDay.meals.length === n
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          } disabled:opacity-40`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    {swappingKey?.startsWith("adjust") && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                  </div>
                </div>

                {/* Meal cards - NO timestamps, just meal names */}
                <div className="space-y-3">
                  {currentAiDay.meals.map((meal, mealIdx) => {
                    const colorClass = getMealColor(meal.mealName);
                    const mealCals = meal.items.reduce((s, it) => s + it.calories, 0);
                    const mealProtein = meal.items.reduce((s, it) => s + (it.protein || 0), 0);
                    const isMealSwapping = swappingKey === `meal-${selectedDayIdx}-${mealIdx}`;
                    const mealDone = isNutritionMealCompleted(nutritionCompletion, selectedDayIdx, mealIdx);

                    return (
                      <motion.div
                        key={mealIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: mealIdx * 0.08 }}
                        className={`glass-card rounded-xl p-3 overflow-hidden transition-all ${mealDone ? "border border-cta-green/30 bg-cta-green/5" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleMealComplete(selectedDayIdx, mealIdx, currentAiDay.meals.length)}
                              className={`flex-shrink-0 transition-colors ${mealDone ? "text-cta-green" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              {mealDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </button>
                            <span className={`text-[10px] font-display font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${colorClass} ${mealDone ? "opacity-60 line-through" : ""}`}>
                              {meal.mealName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {mealCals} {t("nutrition.kcal")} • {Math.round(mealProtein)}g
                            </span>
                            <button
                              onClick={() => swapMeal(selectedDayIdx, mealIdx)}
                              disabled={!!swappingKey}
                              className="p-1 rounded-md hover:bg-secondary transition-colors disabled:opacity-30"
                              title={t("nutrition.swapMeal")}
                            >
                              {isMealSwapping
                                ? <Loader2 className="w-3 h-3 animate-spin text-cta-orange" />
                                : <RefreshCw className="w-3 h-3 text-cta-orange" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {meal.items.map((item, itemIdx) => {
                            const isItemSwapping = swappingKey === `${selectedDayIdx}-${mealIdx}-${itemIdx}`;
                            return (
                              <div key={itemIdx} className="flex items-center justify-between text-xs group">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <Utensils className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                                  <span className="text-foreground truncate">{item.food}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                  <span className="text-[10px] text-muted-foreground">{item.amount}</span>
                                  <span className="text-[10px] text-primary font-mono">{item.calories}cal</span>
                                  {item.protein && (
                                    <span className="text-[10px] text-cta-green font-mono">{item.protein}g</span>
                                  )}
                                  <button
                                    onClick={() => swapItem(selectedDayIdx, mealIdx, itemIdx)}
                                    disabled={!!swappingKey}
                                    className="p-0.5 rounded hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                                    title={t("nutrition.swapItem")}
                                  >
                                    {isItemSwapping
                                      ? <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" />
                                      : <ArrowLeftRight className="w-2.5 h-2.5 text-primary" />}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Daily total footer with protein */}
                <div className="glass-card rounded-xl p-3 flex items-center justify-center gap-6 border border-primary/20">
                  <div className="text-center">
                    <span className="text-sm font-bold text-primary font-mono">{currentAiDay.totalCalories}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">{t("nutrition.kcal")}</span>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div className="text-center">
                    <span className="text-sm font-bold text-cta-green font-mono">{Math.round(aiDayProtein)}g</span>
                    <span className="text-[10px] text-muted-foreground ml-1">{t("nutrition.protein")}</span>
                  </div>
                  {calorieGoal > 0 && (
                    <>
                      <div className="w-px h-6 bg-border" />
                      <div className="text-center">
                        <span className={`text-sm font-bold font-mono ${currentAiDay.totalCalories > calorieGoal ? "text-destructive" : "text-cta-green"}`}>
                          {calorieGoal}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">{t("nutrition.calorieGoal")}</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Empty state */}
        {!aiMealPlan && !generatingPlan && (
          <div className="glass-card rounded-xl p-6 text-center">
            <Sparkles className="w-8 h-8 text-cta-orange/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("nutrition.emptyPlan")}
            </p>
          </div>
        )}

        {/* Generating state */}
        {generatingPlan && (
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-secondary rounded w-1/3 mb-2" />
                <div className="h-2 bg-secondary rounded w-2/3 mb-1" />
                <div className="h-2 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ CALORIE GOAL SETTER ═══ */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cta-orange" />
            <span className="text-xs font-display font-semibold tracking-wider uppercase text-muted-foreground">
              {t("nutrition.calorieGoal")}
            </span>
          </div>
          {!editingGoal ? (
            <button
              onClick={() => { setEditingGoal(true); setGoalInput(calorieGoal > 0 ? String(calorieGoal) : ""); }}
              className="text-xs text-primary hover:underline"
            >
              {calorieGoal > 0 ? `${calorieGoal} kcal ✏️` : t("nutrition.setGoal")}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. 2200"
                className="w-24 h-7 text-xs bg-secondary border-border"
              />
              <Button size="sm" onClick={handleSaveGoal} className="h-7 text-xs bg-primary">
                ✓
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MACROS OVERVIEW (if assessment done) ═══ */}
      {plan && (
        <div className="glass-card rounded-2xl p-5 space-y-4 mb-8">
          <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            {t("nutrition.macros")}
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: t("nutrition.kcal"), value: plan.calories, color: "text-primary" },
              { label: t("nutrition.protein"), value: `${plan.protein}g`, color: "text-cta-green" },
              { label: t("nutrition.carbs"), value: `${plan.carbs}g`, color: "text-accent" },
              { label: t("nutrition.fat"), value: `${plan.fat}g`, color: "text-cta-orange" },
            ].map(m => (
              <div key={m.label}>
                <p className={`text-lg font-display font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MANUAL MEAL TRACKING ═══ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-cta-green" />
            <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              {t("nutrition.manualLog")}
            </h2>
          </div>
        </div>

        {/* Summary with protein */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{totalCals}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("nutritionPlan.totalCals")}</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-cta-green">{totalProtein}g</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("nutrition.dailyProtein")}</p>
          </div>
        </div>

        <Button
          onClick={() => { setShowAdd(true); setForm({ food_name: "", calories: "", protein: "", meal_time: "Breakfast" }); }}
          className="w-full mb-4 bg-cta-green hover:bg-cta-green/90 text-black font-bold"
        >
          <Plus className="w-4 h-4" /> {t("nutritionPlan.addMeal")}
        </Button>

        {loadingMeals ? (
          <div className="flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : meals.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">{t("nutritionPlan.empty")}</p>
        ) : (
          <div className="space-y-2">
            {meals.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground text-sm">{meal.food_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {meal.meal_time} • {meal.calories} kcal • {meal.protein}g {t("nutrition.protein")}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(meal)} className="text-primary hover:text-primary/80 p-1">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(meal.id)} className="text-destructive hover:text-destructive/80 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditMeal(null); setShowAdd(false); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editMeal ? t("nutritionPlan.editMeal") : t("nutritionPlan.addMeal")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={form.meal_time} onValueChange={(v) => setForm({ ...form, meal_time: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {mealTimes.map(mt => (
                  <SelectItem key={mt} value={mt}>{mt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={t("nutritionPlan.foodName")}
              value={form.food_name}
              onChange={(e) => setForm({ ...form, food_name: e.target.value })}
            />
            <Input
              type="number"
              placeholder={t("nutritionPlan.calories")}
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
            />
            <Input
              type="number"
              placeholder={t("nutritionPlan.proteinG")}
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving || !form.food_name} className="bg-cta-green hover:bg-cta-green/90 text-black font-bold">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("nutritionPlan.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default NutritionDashboard;
