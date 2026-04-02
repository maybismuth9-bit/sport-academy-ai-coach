import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { Zap, ClipboardCheck, UserCheck, Mail, Flame, TrendingUp, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-gym.jpg";
import logo from "@/assets/fuelcore-logo.png";

interface HomeFeedProps {
  onStartAssessment: () => void;
}

const HomeFeed = ({ onStartAssessment }: HomeFeedProps) => {
  const { t } = useLang();

  const steps = [
    { icon: ClipboardCheck, text: t("home.step1") },
    { icon: UserCheck, text: t("home.step2") },
    { icon: Mail, text: t("home.step3") },
  ];

  const tips = [
    { icon: Flame, titleKey: "home.tip1.title", descKey: "home.tip1.desc" },
    { icon: TrendingUp, titleKey: "home.tip2.title", descKey: "home.tip2.desc" },
    { icon: Dumbbell, titleKey: "home.tip3.title", descKey: "home.tip3.desc" },
  ];

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        <img src={heroImg} alt="FuelCore" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 flex items-end gap-3">
          <img src={logo} alt="FuelCore logo" width={48} height={48} className="drop-shadow-[0_0_12px_hsl(180_80%_50%/0.5)]" />
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-display font-bold tracking-wider neon-text text-primary"
            >
              {t("home.title")}
            </motion.h1>
            <p className="text-sm text-muted-foreground mt-1">{t("home.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Daily Motivation */}
      <div className="px-5 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 border-l-4 border-cta-orange"
        >
          <p className="text-sm font-semibold text-cta-orange mb-1">{t("home.dailyMotivation")}</p>
          <p className="text-foreground text-sm italic leading-relaxed">"{t("home.motivationQuote")}"</p>
        </motion.div>
      </div>

      {/* Quick Start Button */}
      <div className="px-5 mt-5">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Button
            onClick={onStartAssessment}
            className="w-full h-14 text-lg font-display font-bold tracking-wide bg-cta-green hover:bg-cta-green/90 text-white rounded-xl shadow-[0_0_30px_hsl(145_70%_40%/0.4)]"
          >
            <Zap className="w-5 h-5 mr-2" />
            {t("home.ctaButton")}
          </Button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-center text-xs font-semibold text-cta-orange animate-pulse-neon"
        >
          {t("home.limitedTime")}
        </motion.p>
      </div>

      {/* 3 Steps */}
      <div className="px-5 mt-8">
        <h3 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground text-center mb-4">
          {t("home.stepsTitle")}
        </h3>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fitness Tips Cards */}
      <div className="px-5 mt-8">
        <h3 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">
          {t("home.tipsTitle")}
        </h3>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-card rounded-xl p-4 flex items-start gap-3"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <tip.icon className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{t(tip.titleKey)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t(tip.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;
