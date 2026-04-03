import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import { Apple, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Meal {
  id: string;
  meal_time: string;
  food_name: string;
  calories: number;
  protein: number;
}

const mealTimes = ["Breakfast", "Lunch", "Dinner", "Snack"];

const NutritionPlanPage = () => {
  const { t } = useLang();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ food_name: "", calories: "", protein: "", meal_time: "Breakfast" });
  const [saving, setSaving] = useState(false);

  const fetchMeals = async () => {
    const { data } = await supabase
      .from("user_nutrition")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setMeals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMeals();

    const channel = supabase
      .channel("user_nutrition_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_nutrition" }, () => {
        fetchMeals();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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
    } catch (err: any) {
      toast({ title: t("nutritionPlan.error"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("user_nutrition").delete().eq("id", id);
    toast({ title: t("nutritionPlan.deleted") });
  };

  const openEdit = (meal: Meal) => {
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

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center gap-2 mb-1">
        <Apple className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
          {t("nutritionPlan.title")}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t("nutritionPlan.subtitle")}</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalCals}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("nutritionPlan.totalCals")}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalProtein}g</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("nutritionPlan.totalProtein")}</p>
        </div>
      </div>

      <Button
        onClick={() => { setShowAdd(true); setForm({ food_name: "", calories: "", protein: "", meal_time: "Breakfast" }); }}
        className="w-full mb-6 bg-cta-green hover:bg-cta-green/90 text-black font-bold"
      >
        <Plus className="w-4 h-4" /> {t("nutritionPlan.addMeal")}
      </Button>

      {loading ? (
        <div className="flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : meals.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm">{t("nutritionPlan.empty")}</p>
      ) : (
        <div className="space-y-3">
          {meals.map((meal, i) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-foreground text-sm">{meal.food_name}</p>
                <p className="text-xs text-muted-foreground">
                  {meal.meal_time} • {meal.calories} kcal • {meal.protein}g {t("nutrition.protein")}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(meal)} className="text-primary hover:text-primary/80 p-1">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(meal.id)} className="text-destructive hover:text-destructive/80 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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

export default NutritionPlanPage;
