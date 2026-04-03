import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NutritionPlan, AssessmentData } from "@/components/AssessmentForm";
import {
  Sparkles, Loader2, ChevronDown, ChevronLeft, ChevronRight,
  Apple, Plus, Pencil, Trash2, Clock, Utensils, MoreVertical, RefreshCw
} from "lucide-react";
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
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const mealTimes = ["Breakfast", "Lunch", "Dinner", "Snack"];

const NutritionDashboard = ({ plan, assessmentData }: NutritionDashboardProps) => {
  const { t, lang } = useLang();

  // AI plan state
  const [aiMealPlan, setAiMealPlan] = useState<MealPlanDay[] | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Manual meals state
  const [meals, setMeals] = useState<ManualMeal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [editMeal, setEditMeal] = useState<ManualMeal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ food_name: "", calories: "", protein: "", meal_time: "Breakfast" });
  const [saving, setSaving] = useState(false);

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
    if (!assessmentData) {
      toast({ title: t("nutritionPlan.error"), description: t("nutrition.noData"), variant: "destructive" });
      return;
    }
    setGeneratingPlan(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          goal: assessmentData.goal,
          weight: assessmentData.weight,
          height: assessmentData.height,
          age: assessmentData.age,
          activityLevel: assessmentData.activityLevel,
          allergies: assessmentData.allergies?.join(", ") || "None",
          mealFrequency: assessmentData.mealFrequency || 4,
          language: lang,
        },
      });

      if (error) throw error;
      if (data?.plan?.days) {
        setAiMealPlan(data.plan.days);
        setSelectedDayIdx(0);
        await supabase.from("ai_meal_plans").insert({
          user_id: user.id,
          plan_data: data.plan,
          goal: assessmentData.goal,
        });
        toast({ title: "🍽️", description: t("nutrition.planReady") });
      }
    } catch (err: any) {
      toast({ title: t("nutritionPlan.error"), description: err.message, variant: "destructive" });
    } finally {
      setGeneratingPlan(false);
    }
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

  // Get day label based on language
  const getDayLabel = (day: MealPlanDay, idx: number) => {
    if (lang === "he") return DAYS_HE[idx] || day.day;
    return day.day;
  };

  // Get meal time color
  const getMealColor = (mealName: string) => {
    const lower = mealName.toLowerCase();
    if (lower.includes("breakfast") || lower.includes("בוקר")) return "bg-cta-orange/15 text-cta-orange border-cta-orange/30";
    if (lower.includes("lunch") || lower.includes("צהריים")) return "bg-primary/15 text-primary border-primary/30";
    if (lower.includes("dinner") || lower.includes("ערב")) return "bg-accent/15 text-accent border-accent/30";
    return "bg-cta-green/15 text-cta-green border-cta-green/30";
  };

  return (
    <div className="px-5 pt-8 pb-28">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Apple className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
          {t("nutrition.title")}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t("nutrition.dailyTargets")}</p>

      {/* ═══════════════════════════════════════════ */}
      {/* AI WEEKLY MEAL PLAN - CALENDAR VIEW        */}
      {/* ═══════════════════════════════════════════ */}
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

        {/* Day selector row - weekly calendar tabs */}
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

            {/* Selected day - full schedule */}
            {currentAiDay && (
              <motion.div
                key={selectedDayIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Day header */}
                <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-foreground text-sm">
                      {getDayLabel(currentAiDay, selectedDayIdx)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentAiDay.totalCalories} {t("nutrition.kcal")} {t("nutrition.total")}
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

                {/* Meal schedule - timeline style */}
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute top-0 bottom-0 left-[22px] w-px bg-border" />

                  {currentAiDay.meals.map((meal, mealIdx) => {
                    const colorClass = getMealColor(meal.mealName);
                    const mealCals = meal.items.reduce((s, it) => s + it.calories, 0);

                    return (
                      <motion.div
                        key={mealIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: mealIdx * 0.08 }}
                        className="relative flex gap-3 mb-3"
                      >
                        {/* Timeline dot */}
                        <div className="flex-shrink-0 w-[45px] flex flex-col items-center pt-3">
                          <div className={`w-3 h-3 rounded-full border-2 z-10 ${colorClass}`} />
                          <span className="text-[9px] text-muted-foreground mt-1 font-mono">{meal.time}</span>
                        </div>

                        {/* Meal card */}
                        <div className="flex-1 glass-card rounded-xl p-3 overflow-hidden">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-display font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${colorClass}`}>
                              {meal.mealName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {mealCals} {t("nutrition.kcal")}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {meal.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <Utensils className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                                  <span className="text-foreground truncate">{item.food}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                  <span className="text-[10px] text-muted-foreground">{item.amount}</span>
                                  <span className="text-[10px] text-primary font-mono">{item.calories}cal</span>
                                  {item.protein && (
                                    <span className="text-[10px] text-cta-green font-mono">{item.protein}g</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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

      {/* ═══════════════════════════════════════════ */}
      {/* MACROS OVERVIEW (if assessment done)       */}
      {/* ═══════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════ */}
      {/* MANUAL MEAL TRACKING                       */}
      {/* ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-cta-green" />
            <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              {t("nutrition.manualLog")}
            </h2>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{totalCals}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("nutritionPlan.totalCals")}</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{totalProtein}g</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("nutritionPlan.totalProtein")}</p>
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
  );
};

export default NutritionDashboard;
