import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { Zap, ClipboardCheck, UserCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-gym.jpg";
import logo from "@/assets/fuelcore-logo.png";
import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";

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

  const articles = [
    { id: 1, title: t("home.article1.title"), summary: t("home.article1.summary"), image: article1, category: t("home.article1.category"), readTime: "4 min" },
    { id: 2, title: t("home.article2.title"), summary: t("home.article2.summary"), image: article2, category: t("home.article2.category"), readTime: "6 min" },
    { id: 3, title: t("home.article3.title"), summary: t("home.article3.summary"), image: article3, category: t("home.article3.category"), readTime: "5 min" },
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

      {/* Hero headline */}
      <div className="px-5 mt-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl sm:text-3xl font-display font-extrabold leading-tight text-cta-orange whitespace-pre-line"
          style={{ textShadow: "0 0 24px hsl(25 95% 55% / 0.4)" }}
        >
          {t("home.heroHeadline")}
        </motion.h2>

        {/* Limited time badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-sm font-semibold text-cta-orange animate-pulse-neon"
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
              transition={{ delay: 0.3 + i * 0.12 }}
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

      {/* CTA Button */}
      <div className="px-5 mt-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={onStartAssessment}
            className="w-full h-14 text-lg font-display font-bold tracking-wide bg-cta-green hover:bg-cta-green/90 text-white rounded-xl shadow-[0_0_30px_hsl(145_70%_40%/0.4)]"
          >
            <Zap className="w-5 h-5 mr-2" />
            {t("home.ctaButton")}
          </Button>
        </motion.div>
      </div>

      {/* Articles */}
      <div className="px-4 mt-10 space-y-4">
        <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          {t("home.latest")}
        </h2>
        {articles.map((article, i) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="glass-card rounded-xl overflow-hidden cursor-pointer hover:neon-border transition-shadow duration-300"
          >
            <img src={article.image} alt={article.title} className="w-full h-40 object-cover" loading="lazy" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-display font-semibold tracking-widest uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {article.category}
                </span>
                <span className="text-[10px] text-muted-foreground">{article.readTime}</span>
              </div>
              <h3 className="font-semibold text-foreground leading-tight">{article.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

export default HomeFeed;
