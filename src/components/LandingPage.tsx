import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { Zap, Shield, Brain, Dumbbell, Apple, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const { t } = useLang();

  const features = [
    { icon: Brain, titleKey: "landing.feat1.title", descKey: "landing.feat1.desc" },
    { icon: Dumbbell, titleKey: "landing.feat2.title", descKey: "landing.feat2.desc" },
    { icon: Apple, titleKey: "landing.feat3.title", descKey: "landing.feat3.desc" },
    { icon: TrendingUp, titleKey: "landing.feat4.title", descKey: "landing.feat4.desc" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-48 h-48 rounded-full bg-accent/10 blur-[80px] animate-pulse" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center mb-6"
        >
          <Shield className="w-10 h-10 text-primary drop-shadow-[0_0_12px_hsl(180_80%_50%/0.6)]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight"
        >
          <span className="neon-text text-primary">FUELCORE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-lg md:text-xl text-muted-foreground mt-3 max-w-md leading-relaxed"
        >
          {t("landing.tagline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 w-full max-w-xs"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="w-full h-14 text-lg font-display font-bold tracking-wide bg-cta-green hover:bg-cta-green/90 text-white rounded-xl shadow-[0_0_40px_hsl(145_70%_40%/0.5)] transition-all hover:shadow-[0_0_60px_hsl(145_70%_40%/0.6)] hover:scale-[1.02]"
          >
            <Zap className="w-5 h-5 mr-2" />
            {t("landing.cta")}
          </Button>
          <p className="mt-3 text-xs font-semibold text-cta-orange animate-pulse">
            {t("landing.limitedPilot")}
          </p>
        </motion.div>
      </div>

      {/* Features grid */}
      <div className="px-6 pb-12">
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-card rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
            >
              <feat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">{t(feat.titleKey)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t(feat.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pb-8 px-6"
      >
        <p className="text-xs text-muted-foreground">
          {t("landing.socialProof")}
        </p>
      </motion.div>
    </div>
  );
};

export default LandingPage;
