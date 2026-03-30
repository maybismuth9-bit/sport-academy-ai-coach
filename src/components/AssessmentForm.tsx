import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AssessmentData {
  age: string;
  weight: string;
  height: string;
  bodyFat: string;
  goal: string;
  activityLevel: string;
  allergies: string[];
  mealFrequency: string;
  workoutDays: string;
  workoutDuration: string;
  injuries: string;
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  summary: string;
}

interface AssessmentFormProps {
  onComplete: (data: AssessmentData, plan: NutritionPlan) => void;
}

const AssessmentForm = ({ onComplete }: AssessmentFormProps) => {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<AssessmentData>({
    age: "", weight: "", height: "", bodyFat: "", goal: "",
    activityLevel: "", allergies: [], mealFrequency: "3",
    workoutDays: "", workoutDuration: "", injuries: "",
  });

  const numericSteps = [
    { key: "age", label: t("assess.age"), placeholder: "e.g. 28", unit: t("assess.years") },
    { key: "weight", label: t("assess.weight"), placeholder: "e.g. 75", unit: t("assess.kg") },
    { key: "height", label: t("assess.height"), placeholder: "e.g. 178", unit: t("assess.cm") },
    { key: "bodyFat", label: t("assess.bodyFat"), placeholder: "e.g. 18", unit: "%" },
  ];

  const goals = [
    t("assess.goalMuscle"),
    t("assess.goalLoss"),
    t("assess.goalMaintenance"),
  ];

  const activityLevels = [
    { value: "1", label: t("assess.activity1") },
    { value: "2", label: t("assess.activity2") },
    { value: "3", label: t("assess.activity3") },
    { value: "4", label: t("assess.activity4") },
    { value: "5", label: t("assess.activity5") },
  ];

  const allergyOptions = [
    t("assess.allergyGluten"),
    t("assess.allergyLactose"),
    t("assess.allergyNone"),
  ];

  // Steps: 0-3 numeric, 4 goal, 5 activity, 6 allergies, 7 meal frequency, 8 workout duration, 9 injuries
  const totalSteps = 10;
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleAllergy = (allergy: string) => {
    const noneLabel = t("assess.allergyNone");
    if (allergy === noneLabel) {
      setData({ ...data, allergies: [noneLabel] });
    } else {
      const filtered = data.allergies.filter(a => a !== noneLabel);
      if (filtered.includes(allergy)) {
        setData({ ...data, allergies: filtered.filter(a => a !== allergy) });
      } else {
        setData({ ...data, allergies: [...filtered, allergy] });
      }
    }
  };

  const handleSubmit = async () => {
    setGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-nutrition", {
        body: { assessmentData: data },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      onComplete(data, result.plan);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate plan. Please try again.");
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => { if (step > 0) setStep(step - 1); };

  const canProceed = () => true;

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h2 className="text-xl font-display font-bold text-foreground">{t("assess.generating")}</h2>
      </div>
    );
  }

  const renderStep = () => {
    if (step < 4) {
      const s = numericSteps[step];
      return (
        <div className="space-y-4">
          <Label className="text-xl font-semibold text-foreground">{s.label}</Label>
          <div className="relative">
            <Input type="number" placeholder={s.placeholder} value={data[s.key as keyof AssessmentData] as string}
              onChange={(e) => setData({ ...data, [s.key]: e.target.value })}
              className="text-lg h-14 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border pr-12" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{s.unit}</span>
          </div>
        </div>
      );
    }
    if (step === 4) {
      return (
        <div className="space-y-4">
          <Label className="text-xl font-semibold text-foreground">{t("assess.goal")}</Label>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {goals.map((goal) => (
              <button key={goal} onClick={() => setData({ ...data, goal })}
                className={`p-4 rounded-xl text-left font-semibold transition-all duration-300 border ${data.goal === goal ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                {goal}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (step === 5) {
      return (
        <div className="space-y-4">
          <Label className="text-xl font-semibold text-foreground">{t("assess.activityLevel")}</Label>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {activityLevels.map((level) => (
              <button key={level.value} onClick={() => setData({ ...data, activityLevel: level.value })}
                className={`p-4 rounded-xl text-left font-semibold transition-all duration-300 border ${data.activityLevel === level.value ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                <span className="text-accent mr-2">{level.value}</span> {level.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (step === 6) {
      return (
        <div className="space-y-4">
          <Label className="text-xl font-semibold text-foreground">{t("assess.allergies")}</Label>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {allergyOptions.map((allergy) => (
              <button key={allergy} onClick={() => toggleAllergy(allergy)}
                className={`p-4 rounded-xl text-left font-semibold transition-all duration-300 border ${data.allergies.includes(allergy) ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                {allergy}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (step === 7) {
      return (
        <div className="space-y-4">
          <Label className="text-xl font-semibold text-foreground">{t("assess.mealFrequency")}</Label>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {[2, 3, 4, 5, 6].map((n) => (
              <button key={n} onClick={() => setData({ ...data, mealFrequency: String(n) })}
                className={`p-4 rounded-xl text-center text-lg font-bold transition-all duration-300 border ${data.mealFrequency === String(n) ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (step === 8) {
      return (
        <div className="space-y-4">
          <Label className="text-xl font-semibold text-foreground">{t("assess.workoutDays")}</Label>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <button key={n} onClick={() => setData({ ...data, workoutDays: String(n) })}
                className={`p-3 rounded-xl text-center text-lg font-bold transition-all duration-300 border ${data.workoutDays === String(n) ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (step === 9) {
      return (
        <div className="space-y-4">
          <Label className="text-xl font-semibold text-foreground">{t("assess.workoutDuration")}</Label>
          <div className="relative">
            <Input type="number" placeholder="e.g. 60" value={data.workoutDuration}
              onChange={(e) => setData({ ...data, workoutDuration: e.target.value })}
              className="text-lg h-14 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border pr-16" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">min</span>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <Label className="text-xl font-semibold text-foreground">{t("assess.injuries")}</Label>
        <Input placeholder={t("assess.injuriesPlaceholder")} value={data.injuries}
          onChange={(e) => setData({ ...data, injuries: e.target.value })}
          className="text-lg h-14 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border" />
      </div>
    );
  };

  return (
    <div className="px-5 pt-8 pb-28">
      <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">{t("assess.title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("assess.step")} {step + 1} {t("assess.of")} {totalSteps}</p>

      <div className="h-1 bg-secondary rounded-full mb-10 overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ boxShadow: "0 0 10px hsl(180 80% 50% / 0.5)" }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-10">
        {step > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1 h-12 border-border text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> {t("assess.back")}
          </Button>
        )}
        <Button onClick={handleNext} disabled={!canProceed()}
          className="flex-1 h-12 bg-primary text-primary-foreground font-display font-semibold tracking-wider hover:bg-primary/90 disabled:opacity-30">
          {step === totalSteps - 1 ? t("assess.complete") : t("assess.next")} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default AssessmentForm;
