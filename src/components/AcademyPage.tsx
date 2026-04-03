import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, Brain, ChevronDown, Heart, Sparkles, Loader2 } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: number;
  titleKey: string;
  category: string;
  source: string;
  sourceUrl: string;
  readTime: string;
}

const articles: Article[] = [
  { id: 1, titleKey: "academy.article1.title", category: "Strength", source: "PubMed", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov", readTime: "3 min" },
  { id: 2, titleKey: "academy.article2.title", category: "Nutrition", source: "Meta-Analysis", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov", readTime: "4 min" },
  { id: 3, titleKey: "academy.article3.title", category: "Recovery", source: "NSCA Journal", sourceUrl: "https://journals.lww.com/nsca-jscr", readTime: "3 min" },
  { id: 4, titleKey: "academy.article4.title", category: "Physiology", source: "PubMed", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov", readTime: "5 min" },
  { id: 5, titleKey: "academy.article5.title", category: "Performance", source: "Sports Medicine", sourceUrl: "https://link.springer.com/journal/40279", readTime: "4 min" },
];

const physioExercises = [
  { id: "p1", titleKey: "recovery.shoulder.drill1", category: "Shoulder", durationKey: "recovery.duration.2min", videoUrl: "" },
  { id: "p2", titleKey: "recovery.shoulder.drill2", category: "Shoulder", durationKey: "recovery.duration.3min", videoUrl: "" },
  { id: "p3", titleKey: "recovery.back.drill1", category: "Back", durationKey: "recovery.duration.3min", videoUrl: "" },
  { id: "p4", titleKey: "recovery.back.drill2", category: "Back", durationKey: "recovery.duration.2min", videoUrl: "" },
  { id: "p5", titleKey: "recovery.back.drill3", category: "Back", durationKey: "recovery.duration.5min", videoUrl: "" },
  { id: "p6", titleKey: "recovery.knee.drill1", category: "Knee", durationKey: "recovery.duration.3min", videoUrl: "" },
  { id: "p7", titleKey: "recovery.knee.drill2", category: "Knee", durationKey: "recovery.duration.2min", videoUrl: "" },
  { id: "p8", titleKey: "recovery.hip.drill1", category: "Hip", durationKey: "recovery.duration.3min", videoUrl: "" },
  { id: "p9", titleKey: "recovery.hip.drill2", category: "Hip", durationKey: "recovery.duration.2min", videoUrl: "" },
];

const categoryColors: Record<string, string> = {
  Strength: "bg-cta-orange/15 text-cta-orange",
  Nutrition: "bg-cta-green/15 text-cta-green",
  Recovery: "bg-accent/15 text-accent",
  Physiology: "bg-primary/15 text-primary",
  Performance: "bg-cta-orange/15 text-cta-orange",
  Shoulder: "bg-accent/15 text-accent",
  Back: "bg-primary/15 text-primary",
  Knee: "bg-cta-orange/15 text-cta-orange",
  Hip: "bg-cta-green/15 text-cta-green",
};

const AcademyPage = () => {
  const { t, lang } = useLang();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"articles" | "physio">("articles");
  const [physioFilter, setPhysioFilter] = useState<string>("All");
  const [aiSummaries, setAiSummaries] = useState<Record<number, string>>({});
  const [loadingSummary, setLoadingSummary] = useState<number | null>(null);

  const physioCategories = ["All", "Shoulder", "Back", "Knee", "Hip"];
  const filteredPhysio = physioFilter === "All"
    ? physioExercises
    : physioExercises.filter(e => e.category === physioFilter);

  const fetchAiSummary = useCallback(async (article: Article) => {
    // Check cache first
    const cacheKey = `fuelcore_summary_${article.id}_${lang}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setAiSummaries(prev => ({ ...prev, [article.id]: cached }));
      return;
    }

    setLoadingSummary(article.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-article-summary", {
        body: {
          title: t(article.titleKey),
          sourceUrl: article.sourceUrl,
          language: lang,
        },
      });

      if (error) throw error;
      const summary = data?.summary || t("academy.summaryError");
      setAiSummaries(prev => ({ ...prev, [article.id]: summary }));
      sessionStorage.setItem(cacheKey, summary);
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setAiSummaries(prev => ({ ...prev, [article.id]: t("academy.summaryError") }));
    } finally {
      setLoadingSummary(null);
    }
  }, [lang, t]);

  const handleArticleToggle = (article: Article) => {
    if (expandedId === article.id) {
      setExpandedId(null);
    } else {
      setExpandedId(article.id);
      if (!aiSummaries[article.id]) {
        fetchAiSummary(article);
      }
    }
  };

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
          {t("academy.title")}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t("academy.subtitle")}</p>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab("articles")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-display font-semibold tracking-wider transition-all ${
            activeTab === "articles"
              ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(180_80%_50%/0.4)]"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 inline mr-1" />
          {t("academy.title")}
        </button>
        <button
          onClick={() => setActiveTab("physio")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-display font-semibold tracking-wider transition-all ${
            activeTab === "physio"
              ? "bg-accent text-accent-foreground shadow-[0_0_12px_hsl(270_60%_60%/0.4)]"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <Heart className="w-3.5 h-3.5 inline mr-1" />
          {t("recovery.title")}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "articles" ? (
          <motion.div key="articles" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="flex items-center gap-2 mb-5 glass-card rounded-xl p-3">
              <Sparkles className="w-4 h-4 text-cta-orange flex-shrink-0" />
              <p className="text-xs text-muted-foreground">{t("academy.aiSummaryNote")}</p>
            </div>

            <div className="space-y-3">
              {articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => handleArticleToggle(article)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-display font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${categoryColors[article.category] || "bg-primary/10 text-primary"}`}>
                          {article.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{article.readTime}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === article.id ? "rotate-180" : ""}`} />
                    </div>
                    <h3 className="font-semibold text-foreground leading-tight text-sm">
                      {t(article.titleKey)}
                    </h3>
                  </button>

                  <AnimatePresence>
                    {expandedId === article.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        {loadingSummary === article.id ? (
                          <div className="flex items-center gap-2 py-4">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-xs text-muted-foreground">{t("academy.generatingSummary")}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Sparkles className="w-3 h-3 text-cta-orange" />
                              <span className="text-[10px] font-display font-semibold text-cta-orange tracking-wider uppercase">
                                {t("academy.aiSummary")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {aiSummaries[article.id] || ""}
                            </p>
                          </>
                        )}
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {t("knowledgeHub.readMore")} — {article.source}
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="physio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
              {physioCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPhysioFilter(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-display font-semibold tracking-wider transition-all ${
                    physioFilter === cat
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "All" ? t("knowledgeHub.all") : t(`recovery.${cat.toLowerCase()}`)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredPhysio.map((ex, i) => (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-display font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${categoryColors[ex.category]}`}>
                      {ex.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{t(ex.durationKey)}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mt-2">{t(ex.titleKey)}</h3>
                  <div className="mt-3 w-full h-28 bg-background/50 rounded-lg border border-border flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-[10px]">{t("recovery.videoPlaceholder")}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcademyPage;
