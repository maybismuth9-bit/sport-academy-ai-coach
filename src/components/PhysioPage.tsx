import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, Loader2, AlertTriangle, CheckCircle, ArrowRight, RotateCcw, Stethoscope, Activity } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import physioHero from "@/assets/physio-hero.jpg";
import SectionDisclaimer from "@/components/SectionDisclaimer";

interface Exercise {
  name: string;
  duration: string;
  instruction: string;
  difficulty: string;
  bodyPart: string;
}

interface Assessment {
  possibleCauses: string[];
  riskLevel: string;
  shouldSeeDoctor: boolean;
  doctorNote?: string;
}

interface DiagnosisResult {
  assessment: Assessment;
  exercises: Exercise[];
  generalAdvice: string;
}

const BODY_AREAS = [
  { key: "neck", emoji: "🦴" },
  { key: "shoulders", emoji: "💪" },
  { key: "upperBack", emoji: "🔙" },
  { key: "lowerBack", emoji: "⬇️" },
  { key: "chest", emoji: "🫁" },
  { key: "elbows", emoji: "🦾" },
  { key: "wrists", emoji: "✋" },
  { key: "hips", emoji: "🦵" },
  { key: "knees", emoji: "🦿" },
  { key: "ankles", emoji: "🦶" },
];

const PhysioPage = () => {
  const { t, lang } = useLang();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  const handleDiagnosis = async () => {
    if (!selectedArea) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("physio-diagnosis", {
        body: {
          painArea: t(`physio.area.${selectedArea}`),
          description,
          language: lang,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      toast({ title: t("physio.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedArea(null);
    setDescription("");
    setExpandedExercise(null);
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low": return "text-cta-green bg-cta-green/10 border-cta-green/30";
      case "medium": return "text-cta-orange bg-cta-orange/10 border-cta-orange/30";
      case "high": return "text-destructive bg-destructive/10 border-destructive/30";
      default: return "text-muted-foreground bg-secondary";
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "beginner": return "bg-cta-green/15 text-cta-green";
      case "intermediate": return "bg-cta-orange/15 text-cta-orange";
      case "advanced": return "bg-destructive/15 text-destructive";
      default: return "bg-primary/15 text-primary";
    }
  };

  // ─── RESULTS VIEW ───
  if (result) {
    return (
      <div className="pb-28">
        {/* Hero */}
        <div className="relative h-40 overflow-hidden">
          <img src={physioHero} alt="Physio" className="w-full h-full object-cover" loading="lazy" width={1080} height={640} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-accent" />
              <h1 className="text-lg font-display font-bold neon-text text-accent">{t("physio.results")}</h1>
            </div>
          </div>
        </div>

        <div className="px-5 pt-4 space-y-4">
          {/* Assessment Card */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-display font-bold text-foreground">{t("physio.assessment")}</h2>
              <span className={`text-[10px] font-display font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${getRiskColor(result.assessment.riskLevel)}`}>
                {result.assessment.riskLevel}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {result.assessment.possibleCauses.map((cause, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-cta-orange flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-snug">{cause}</p>
                </div>
              ))}
            </div>

            {result.assessment.shouldSeeDoctor && result.assessment.doctorNote && (
              <div className="bg-destructive/10 rounded-xl p-3 border border-destructive/20">
                <p className="text-xs text-destructive font-medium">{result.assessment.doctorNote}</p>
              </div>
            )}
          </motion.div>

          {/* Exercises */}
          <div>
            <h2 className="text-[10px] font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">
              {t("physio.recommendedExercises")}
            </h2>
            <div className="space-y-2.5">
              {result.exercises.map((ex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedExercise(expandedExercise === i ? null : i)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-display font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${getDifficultyColor(ex.difficulty)}`}>
                            {ex.difficulty}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{ex.duration}</span>
                        </div>
                        <p className="font-semibold text-foreground text-sm">{ex.name}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedExercise === i ? "rotate-90" : ""}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedExercise === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border px-4 py-3 bg-accent/5"
                      >
                        <p className="text-xs text-foreground leading-relaxed">{ex.instruction}</p>
                        {ex.bodyPart && (
                          <span className="inline-block mt-2 text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                            {ex.bodyPart}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* General Advice */}
          {result.generalAdvice && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="glass-card rounded-xl p-4 border-l-4 border-accent">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">{result.generalAdvice}</p>
              </div>
            </motion.div>
          )}

          {/* Reset button */}
          <Button onClick={handleReset} variant="outline" className="w-full h-11 border-accent/30 text-accent font-display font-semibold tracking-wider">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("physio.newDiagnosis")}
          </Button>

          <SectionDisclaimer page="physio" />
        </div>
      </div>
    );
  }

  // ─── INPUT VIEW ───
  return (
    <div className="pb-28">
      {/* Hero */}
      <div className="relative h-44 overflow-hidden">
        <img src={physioHero} alt="Physio" className="w-full h-full object-cover" width={1080} height={640} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-accent" />
            <h1 className="text-lg font-display font-bold neon-text text-accent">{t("physio.title")}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{t("physio.subtitle")}</p>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Body area selector */}
        <div>
          <h2 className="text-[10px] font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">
            {t("physio.selectArea")}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {BODY_AREAS.map((area) => (
              <button
                key={area.key}
                onClick={() => setSelectedArea(area.key)}
                className={`p-3 rounded-xl text-left transition-all duration-300 border ${
                  selectedArea === area.key
                    ? "border-accent bg-accent/10 text-accent shadow-[0_0_15px_hsl(270_60%_60%/0.2)]"
                    : "border-border bg-secondary/50 text-foreground hover:border-accent/30"
                }`}
              >
                <span className="text-lg mr-2">{area.emoji}</span>
                <span className="text-sm font-semibold">{t(`physio.area.${area.key}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-[10px] font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
            {t("physio.describeIssue")}
          </h2>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("physio.describePlaceholder")}
            className="bg-secondary/50 border-border min-h-[80px] text-sm resize-none"
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleDiagnosis}
          disabled={!selectedArea || loading}
          className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-display font-bold tracking-wider"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t("physio.analyzing")}
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              {t("physio.diagnose")}
            </>
          )}
        </Button>

        {/* Info note */}
        <div className="glass-card rounded-xl p-3 flex items-start gap-2">
          <Activity className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">{t("physio.disclaimer")}</p>
        </div>

        <SectionDisclaimer page="physio" className="mt-1" />
      </div>
    </div>
  );
};

export default PhysioPage;
