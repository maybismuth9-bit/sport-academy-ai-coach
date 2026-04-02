import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Play, ChevronDown } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

interface PainPoint {
  id: string;
  labelKey: string;
  drills: { nameKey: string; durationKey: string; videoPlaceholder: string }[];
}

const painPoints: PainPoint[] = [
  {
    id: "shoulder",
    labelKey: "recovery.shoulder",
    drills: [
      { nameKey: "recovery.shoulder.drill1", durationKey: "recovery.duration.2min", videoPlaceholder: "🎥" },
      { nameKey: "recovery.shoulder.drill2", durationKey: "recovery.duration.3min", videoPlaceholder: "🎥" },
      { nameKey: "recovery.shoulder.drill3", durationKey: "recovery.duration.2min", videoPlaceholder: "🎥" },
    ],
  },
  {
    id: "back",
    labelKey: "recovery.back",
    drills: [
      { nameKey: "recovery.back.drill1", durationKey: "recovery.duration.3min", videoPlaceholder: "🎥" },
      { nameKey: "recovery.back.drill2", durationKey: "recovery.duration.2min", videoPlaceholder: "🎥" },
      { nameKey: "recovery.back.drill3", durationKey: "recovery.duration.5min", videoPlaceholder: "🎥" },
    ],
  },
  {
    id: "knee",
    labelKey: "recovery.knee",
    drills: [
      { nameKey: "recovery.knee.drill1", durationKey: "recovery.duration.3min", videoPlaceholder: "🎥" },
      { nameKey: "recovery.knee.drill2", durationKey: "recovery.duration.2min", videoPlaceholder: "🎥" },
      { nameKey: "recovery.knee.drill3", durationKey: "recovery.duration.3min", videoPlaceholder: "🎥" },
    ],
  },
  {
    id: "hip",
    labelKey: "recovery.hip",
    drills: [
      { nameKey: "recovery.hip.drill1", durationKey: "recovery.duration.3min", videoPlaceholder: "🎥" },
      { nameKey: "recovery.hip.drill2", durationKey: "recovery.duration.2min", videoPlaceholder: "🎥" },
    ],
  },
];

const RecoveryPage = () => {
  const { t } = useLang();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-accent" />
        <h1 className="text-lg font-display font-bold tracking-wider violet-text text-accent">
          {t("recovery.title")}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t("recovery.subtitle")}</p>

      <div className="space-y-3">
        {painPoints.map((pp, i) => (
          <motion.div
            key={pp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === pp.id ? null : pp.id)}
              className="w-full flex items-center justify-between p-4"
            >
              <span className="font-semibold text-foreground text-sm">{t(pp.labelKey)}</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${expandedId === pp.id ? "rotate-180" : ""}`}
              />
            </button>

            {expandedId === pp.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="px-4 pb-4 space-y-3"
              >
                {pp.drills.map((drill, j) => (
                  <div key={j} className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{t(drill.nameKey)}</span>
                      <span className="text-[10px] text-muted-foreground">{t(drill.durationKey)}</span>
                    </div>
                    <div className="w-full h-32 bg-background/50 rounded-lg flex items-center justify-center border border-border">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs">{t("recovery.videoPlaceholder")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecoveryPage;
