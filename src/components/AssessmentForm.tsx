import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2, Sparkles, Upload, Camera, FileVideo, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AssessmentData {
  age: string;
  weight: string;
  height: string;
  bodyFat: string;
  goal: string;
  goalDetail: string;
  activityLevel: string;
  allergies: string[];
  mealFrequency: string;
  workoutDuration: string;
  injuries: string;
  experience: string;
  sleepHours: string;
  stressLevel: string;
  waterIntake: string;
  supplements: string;
  medicalConditions: string;
  uploadedFileUrl: string;
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
  const [planReady, setPlanReady] = useState<{ data: AssessmentData; plan: NutritionPlan } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<AssessmentData>({
    age: "", weight: "", height: "", bodyFat: "", goal: "", goalDetail: "",
    activityLevel: "", allergies: [], mealFrequency: "3",
    workoutDuration: "", injuries: "", experience: "",
    sleepHours: "", stressLevel: "", waterIntake: "",
    supplements: "", medicalConditions: "", uploadedFileUrl: "",
  });

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

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

  const experienceLevels = [
    { value: "beginner", label: t("assess.expBeginner") },
    { value: "intermediate", label: t("assess.expIntermediate") },
    { value: "advanced", label: t("assess.expAdvanced") },
  ];

  const stressLevels = [
    { value: "low", label: t("assess.stressLow") },
    { value: "medium", label: t("assess.stressMedium") },
    { value: "high", label: t("assess.stressHigh") },
  ];

  const allergyOptions = [
    t("assess.allergyGluten"),
    t("assess.allergyLactose"),
    t("assess.allergyVegan"),
    t("assess.allergyVegetarian"),
    t("assess.allergyNone"),
  ];

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

  const canProceed = () => {
    switch (step) {
      case 0: return !!data.goal;
      case 1: return !!data.age && !!data.weight && !!data.height;
      case 2: return !!data.activityLevel && !!data.experience;
      case 3: return !!data.stressLevel && !!data.sleepHours;
      case 4: return data.allergies.length > 0;
      case 5: return true; // photo upload is optional
      default: return true;
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const ext = file.name.split(".").pop();
      const path = `assessments/${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("progress-photos").upload(path, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from("progress-photos").getPublicUrl(path);
      setData(prev => ({ ...prev, uploadedFileUrl: urlData.publicUrl }));
      toast.success(t("assess.uploadSuccess"));
    } catch (e: any) {
      toast.error(e.message);
      setUploadedFile(null);
    } finally {
      setUploading(false);
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
      setPlanReady({ data, plan: result.plan });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => { if (step > 0) setStep(step - 1); };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h2 className="text-xl font-display font-bold text-foreground">{t("assess.generating")}</h2>
      </div>
    );
  }

  if (planReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-2xl font-display font-bold text-foreground mb-2 text-center">
          {t("assess.planReady")}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-muted-foreground text-center mb-8">
          {t("assess.planReadyDesc")}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Button onClick={() => onComplete(planReady.data, planReady.plan)}
            className="h-14 px-8 bg-primary text-primary-foreground font-display font-bold tracking-wider text-lg">
            <Sparkles className="w-5 h-5 mr-2" /> {t("assess.seePlan")}
          </Button>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 0:
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
            <div className="mt-4 space-y-2">
              <Label className="text-base font-semibold text-foreground">{t("assess.trainingGoalDetail")}</Label>
              <Textarea
                placeholder={t("assess.goalDetailPlaceholder")}
                value={data.goalDetail}
                onChange={(e) => setData({ ...data, goalDetail: e.target.value })}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <Label className="text-xl font-semibold text-foreground">{t("assess.physicalStats")}</Label>
            {[
              { key: "age", label: t("assess.age"), placeholder: "e.g. 28", unit: t("assess.years") },
              { key: "weight", label: t("assess.weight"), placeholder: "e.g. 75", unit: t("assess.kg") },
              { key: "height", label: t("assess.height"), placeholder: "e.g. 178", unit: t("assess.cm") },
              { key: "bodyFat", label: t("assess.bodyFat"), placeholder: "e.g. 18", unit: "%" },
            ].map((field) => (
              <div key={field.key} className="space-y-1">
                <span className="text-sm text-muted-foreground">{field.label}</span>
                <div className="relative">
                  <Input type="number" placeholder={field.placeholder}
                    value={data[field.key as keyof AssessmentData] as string}
                    onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                    className="text-lg h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border pr-12" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{field.unit}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-xl font-semibold text-foreground">{t("assess.activityLevel")}</Label>
              <div className="grid grid-cols-1 gap-3">
                {activityLevels.map((level) => (
                  <button key={level.value} onClick={() => setData({ ...data, activityLevel: level.value })}
                    className={`p-3 rounded-xl text-left font-semibold transition-all duration-300 border text-sm ${data.activityLevel === level.value ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                    <span className="text-accent mr-2">{level.value}</span> {level.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-base font-semibold text-foreground">{t("assess.experience")}</Label>
              <div className="grid grid-cols-1 gap-3">
                {experienceLevels.map((level) => (
                  <button key={level.value} onClick={() => setData({ ...data, experience: level.value })}
                    className={`p-3 rounded-xl text-left font-semibold transition-all duration-300 border text-sm ${data.experience === level.value ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">{t("assess.injuries")}</Label>
              <Input placeholder={t("assess.injuriesPlaceholder")} value={data.injuries}
                onChange={(e) => setData({ ...data, injuries: e.target.value })}
                className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">{t("assess.workoutDuration")}</Label>
              <div className="relative">
                <Input type="number" placeholder="e.g. 60" value={data.workoutDuration}
                  onChange={(e) => setData({ ...data, workoutDuration: e.target.value })}
                  className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border pr-16" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">min</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-xl font-semibold text-foreground">{t("assess.stressLevel")}</Label>
              <div className="grid grid-cols-1 gap-3">
                {stressLevels.map((level) => (
                  <button key={level.value} onClick={() => setData({ ...data, stressLevel: level.value })}
                    className={`p-3 rounded-xl text-left font-semibold transition-all duration-300 border text-sm ${data.stressLevel === level.value ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">{t("assess.sleepHours")}</Label>
              <div className="relative">
                <Input type="number" placeholder="e.g. 7" value={data.sleepHours}
                  onChange={(e) => setData({ ...data, sleepHours: e.target.value })}
                  className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border pr-16" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{t("assess.hours")}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">{t("assess.waterIntake")}</Label>
              <div className="relative">
                <Input type="number" placeholder="e.g. 2.5" value={data.waterIntake}
                  onChange={(e) => setData({ ...data, waterIntake: e.target.value })}
                  className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border pr-16" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{t("assess.liters")}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">{t("assess.medicalConditions")}</Label>
              <Input placeholder={t("assess.medicalPlaceholder")} value={data.medicalConditions}
                onChange={(e) => setData({ ...data, medicalConditions: e.target.value })}
                className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">{t("assess.supplements")}</Label>
              <Input placeholder={t("assess.supplementsPlaceholder")} value={data.supplements}
                onChange={(e) => setData({ ...data, supplements: e.target.value })}
                className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border" />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-xl font-semibold text-foreground">{t("assess.allergies")}</Label>
              <div className="grid grid-cols-1 gap-3">
                {allergyOptions.map((allergy) => (
                  <button key={allergy} onClick={() => toggleAllergy(allergy)}
                    className={`p-4 rounded-xl text-left font-semibold transition-all duration-300 border ${data.allergies.includes(allergy) ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                    {allergy}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">{t("assess.mealFrequency")}</Label>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button key={n} onClick={() => setData({ ...data, mealFrequency: String(n) })}
                    className={`p-3 rounded-xl text-center text-lg font-bold transition-all duration-300 border ${data.mealFrequency === String(n) ? "border-primary bg-primary/10 text-primary neon-border" : "border-border bg-secondary text-foreground hover:border-primary/30"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Label className="text-xl font-semibold text-foreground">{t("assess.uploadTitle")}</Label>
              <p className="text-sm text-muted-foreground">{t("assess.uploadDesc")}</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            {!uploadedFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-4 hover:border-primary/40 transition-colors bg-secondary/30"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Camera className="w-5 h-5" />
                  <span className="text-sm font-medium">{t("assess.uploadButton")}</span>
                  <FileVideo className="w-5 h-5" />
                </div>
              </button>
            ) : (
              <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-cta-green/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-cta-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button onClick={() => { setUploadedFile(null); setData(prev => ({ ...prev, uploadedFileUrl: "" })); }}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const stepLabels = [
    t("assess.stepGoal"),
    t("assess.stepStats"),
    t("assess.stepActivity"),
    t("assess.stepExperience"),
    t("assess.stepDiet"),
    t("assess.stepPhoto"),
  ];

  return (
    <div className="px-5 pt-8 pb-28">
      <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">{t("assess.title")}</h1>
      <p className="text-sm text-muted-foreground mb-2">{t("assess.step")} {step + 1} {t("assess.of")} {totalSteps} — {stepLabels[step]}</p>

      <div className="h-1 bg-secondary rounded-full mb-8 overflow-hidden">
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
        <Button onClick={handleNext} disabled={!canProceed() || uploading}
          className="flex-1 h-12 bg-primary text-primary-foreground font-display font-semibold tracking-wider hover:bg-primary/90 disabled:opacity-50">
          {step === totalSteps - 1 ? t("assess.complete") : t("assess.next")} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default AssessmentForm;