import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: number;
  titleKey: string;
  categoryKey: string;
  source: string;
  sourceUrl: string;
  readTime: string;
}

const articles: Article[] = [
  { id: 1, titleKey: "academy.article1.title", categoryKey: "academy.cat.strength", source: "PubMed", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov", readTime: "3 min" },
  { id: 2, titleKey: "academy.article2.title", categoryKey: "academy.cat.nutrition", source: "Meta-Analysis", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov", readTime: "4 min" },
  { id: 3, titleKey: "academy.article3.title", categoryKey: "academy.cat.recovery", source: "NSCA Journal", sourceUrl: "https://journals.lww.com/nsca-jscr", readTime: "3 min" },
  { id: 4, titleKey: "academy.article4.title", categoryKey: "academy.cat.physiology", source: "PubMed", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov", readTime: "5 min" },
  { id: 5, titleKey: "academy.article5.title", categoryKey: "academy.cat.performance", source: "Sports Medicine", sourceUrl: "https://link.springer.com/journal/40279", readTime: "4 min" },
  { id: 6, titleKey: "academy.article6.title", categoryKey: "academy.cat.nutrition", source: "JISSN", sourceUrl: "https://jissn.biomedcentral.com", readTime: "5 min" },
  { id: 7, titleKey: "academy.article7.title", categoryKey: "academy.cat.strength", source: "NSCA", sourceUrl: "https://journals.lww.com/nsca-jscr", readTime: "4 min" },
  { id: 8, titleKey: "academy.article8.title", categoryKey: "academy.cat.recovery", source: "Sports Medicine", sourceUrl: "https://link.springer.com/journal/40279", readTime: "3 min" },
];

const categoryColorMap: Record<string, string> = {
  "academy.cat.strength": "bg-cta-orange/15 text-cta-orange",
  "academy.cat.nutrition": "bg-cta-green/15 text-cta-green",
  "academy.cat.recovery": "bg-accent/15 text-accent",
  "academy.cat.physiology": "bg-primary/15 text-primary",
  "academy.cat.performance": "bg-cta-orange/15 text-cta-orange",
};

const AcademyPage = () => {
  const { t, lang } = useLang();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [aiSummaries, setAiSummaries] = useState<Record<number, string>>({});
  const [loadingSummary, setLoadingSummary] = useState<number | null>(null);

  const fetchAiSummary = useCallback(async (article: Article) => {
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
                  <span className={`text-[10px] font-display font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${categoryColorMap[article.categoryKey] || "bg-primary/10 text-primary"}`}>
                    {t(article.categoryKey)}
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
    </div>
  );
};

export default AcademyPage;
