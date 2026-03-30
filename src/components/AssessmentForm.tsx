import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AssessmentData {
  age: string;
  weight: string;
  height: string;
  bodyFat: string;
  goal: string;
  injuries: string;
}

interface AssessmentFormProps {
  onComplete: (data: AssessmentData) => void;
}

const steps = [
  { key: "age", label: "How old are you?", placeholder: "e.g. 28", type: "number", unit: "years" },
  { key: "weight", label: "What's your weight?", placeholder: "e.g. 75", type: "number", unit: "kg" },
  { key: "height", label: "What's your height?", placeholder: "e.g. 178", type: "number", unit: "cm" },
  { key: "bodyFat", label: "Body fat percentage?", placeholder: "e.g. 18", type: "number", unit: "%" },
];

const goals = ["Muscle Mass", "Weight Loss"];

const AssessmentForm = ({ onComplete }: AssessmentFormProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<AssessmentData>({
    age: "", weight: "", height: "", bodyFat: "", goal: "", injuries: "",
  });
  const [completed, setCompleted] = useState(false);

  const totalSteps = steps.length + 2; // + goal + injuries
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else {
      setCompleted(true);
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const canProceed = () => {
    if (step < steps.length) return data[steps[step].key as keyof AssessmentData] !== "";
    if (step === steps.length) return data.goal !== "";
    return true; // injuries optional
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
          <CheckCircle2 className="w-20 h-20 text-primary drop-shadow-[0_0_20px_hsl(142_72%_50%/0.5)]" />
        </motion.div>
        <h2 className="text-xl font-display font-bold text-foreground">Assessment Complete</h2>
        <p className="text-muted-foreground text-center mt-2">Your personalized plan is ready. Check the Nutrition tab!</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-28">
      <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary mb-1">ASSESSMENT</h1>
      <p className="text-sm text-muted-foreground mb-8">Step {step + 1} of {totalSteps}</p>

      {/* Progress bar */}
      <div className="h-1 bg-secondary rounded-full mb-10 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ boxShadow: "0 0 10px hsl(142 72% 50% / 0.5)" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {step < steps.length ? (
            <div className="space-y-4">
              <Label className="text-xl font-semibold text-foreground">{steps[step].label}</Label>
              <div className="relative">
                <Input
                  type={steps[step].type}
                  placeholder={steps[step].placeholder}
                  value={data[steps[step].key as keyof AssessmentData]}
                  onChange={(e) => setData({ ...data, [steps[step].key]: e.target.value })}
                  className="text-lg h-14 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {steps[step].unit}
                </span>
              </div>
            </div>
          ) : step === steps.length ? (
            <div className="space-y-4">
              <Label className="text-xl font-semibold text-foreground">What's your training goal?</Label>
              <div className="grid grid-cols-1 gap-3 mt-4">
                {goals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setData({ ...data, goal })}
                    className={`p-4 rounded-xl text-left font-semibold transition-all duration-300 border ${
                      data.goal === goal
                        ? "border-primary bg-primary/10 text-primary neon-border"
                        : "border-border bg-secondary text-foreground hover:border-primary/30"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="text-xl font-semibold text-foreground">Any physical injuries?</Label>
              <Input
                placeholder="e.g. Lower back pain, knee issues (optional)"
                value={data.injuries}
                onChange={(e) => setData({ ...data, injuries: e.target.value })}
                className="text-lg h-14 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:neon-border"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-10">
        {step > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1 h-12 border-border text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex-1 h-12 bg-primary text-primary-foreground font-display font-semibold tracking-wider hover:bg-primary/90 disabled:opacity-30"
        >
          {step === totalSteps - 1 ? "Complete" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default AssessmentForm;
