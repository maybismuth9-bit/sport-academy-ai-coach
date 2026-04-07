import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, ChevronDown, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

interface DBArticle {
  id: string;
  title: string;
  category: string;
  summary: string | null;
  link: string | null;
  created_at: string;
}

const categoryColorMap: Record<string, string> = {
  "Strength": "bg-cta-orange/15 text-cta-orange",
  "Nutrition": "bg-cta-green/15 text-cta-green",
  "Recovery": "bg-accent/15 text-accent",
  "Physiology": "bg-primary/15 text-primary",
  "Performance": "bg-cta-orange/15 text-cta-orange",
  "Science": "bg-primary/15 text-primary",
  "General": "bg-muted text-muted-foreground",
};

const AcademyPage = () => {
  const { t, lang } = useLang();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);
  const [articles, setArticles] = useState<DBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [translatedStatic, setTranslatedStatic] = useState<Record<string, { title: string; summary: string }>>({});

  useEffect(() => {
    fetchArticles();
  }, []);

  // Translate static titles & summaries for non-Hebrew users
  useEffect(() => {
    if (lang === "he" || articles.length === 0) return;
    
    articles.forEach(async (article) => {
      const cacheKey = `fuelcore_static_${article.id}_${lang}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setTranslatedStatic(prev => ({ ...prev, [article.id]: parsed }));
        return;
      }

      try {
        const langMap: Record<string, string> = {
          en: "English", es: "Spanish", zh: "Chinese", ar: "Arabic", de: "German",
        };
        const targetLang = langMap[lang] || "English";
        
        const { data, error } = await supabase.functions.invoke("generate-article-summary", {
          body: {
            title: `Translate the following Hebrew title and summary to ${targetLang}. Return ONLY a JSON object with "title" and "summary" keys. Title: "${article.title}" Summary: "${article.summary || ""}"`,
            sourceUrl: "",
            language: lang,
          },
        });

        // Try to parse as JSON, fallback to just using the text
        if (!error && data?.summary) {
          try {
            const parsed = JSON.parse(data.summary);
            const result = { title: parsed.title || article.title, summary: parsed.summary || article.summary || "" };
            setTranslatedStatic(prev => ({ ...prev, [article.id]: result }));
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
          } catch {
            // If not JSON, just use as translated summary
            const result = { title: article.title, summary: data.summary };
            setTranslatedStatic(prev => ({ ...prev, [article.id]: result }));
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
          }
        }
      } catch (err) {
        console.error("Failed to translate article:", err);
      }
    });
  }, [lang, articles]);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setArticles(data as DBArticle[]);
    }
    setLoading(false);
  };

  const fetchAiSummary = useCallback(async (article: DBArticle) => {
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
          title: article.title,
          sourceUrl: article.link || "",
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

  const handleArticleToggle = (article: DBArticle) => {
    if (expandedId === article.id) {
      setExpandedId(null);
    } else {
      setExpandedId(article.id);
      if (!aiSummaries[article.id]) {
        fetchAiSummary(article);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "he" ? "he-IL" : lang === "ar" ? "ar" : lang === "de" ? "de-DE" : lang === "es" ? "es-ES" : lang === "zh" ? "zh-CN" : "en-US", {
      day: "numeric",
      month: "short",
    });
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article, i) => {
            const isExpanded = expandedId === article.id;
            const translated = translatedStatic[article.id];
            const displayTitle = (lang !== "he" && translated?.title) ? translated.title : article.title;
            const displaySummary = (lang !== "he" && translated?.summary) ? translated.summary : (article.summary || "");

            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => handleArticleToggle(article)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-display font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${categoryColorMap[article.category] || "bg-primary/10 text-primary"}`}>
                        {t(`academy.cat.${article.category}`)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(article.created_at)}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                  <h3 className="font-semibold text-foreground leading-tight text-sm mb-2">
                    {displayTitle}
                  </h3>
                  {displaySummary && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {displaySummary}
                    </p>
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <div className="border-t border-border pt-3 mt-1">
                        {loadingSummary === article.id ? (
                          <div className="flex items-center gap-2 py-3">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-xs text-muted-foreground">{t("academy.generatingSummary")}</span>
                          </div>
                        ) : aiSummaries[article.id] ? (
                          <>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Sparkles className="w-3 h-3 text-cta-orange" />
                              <span className="text-[10px] font-display font-semibold text-cta-orange tracking-wider uppercase">
                                {t("academy.aiSummary")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {aiSummaries[article.id]}
                            </p>
                          </>
                        ) : null}
                      </div>

                      {article.link && (
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {t("academy.source")}
                        </a>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AcademyPage;
