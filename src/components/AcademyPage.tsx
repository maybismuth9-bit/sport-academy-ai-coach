import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Brain, Loader2 } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { Button } from "@/components/ui/button";

interface Article {
  id: number;
  titleKey: string;
  summaryKey: string;
  category: string;
  source: string;
  sourceUrl: string;
  readTime: string;
}

const articles: Article[] = [
  {
    id: 1,
    titleKey: "academy.article1.title",
    summaryKey: "academy.article1.summary",
    category: "Strength",
    source: "PubMed",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov",
    readTime: "3 min",
  },
  {
    id: 2,
    titleKey: "academy.article2.title",
    summaryKey: "academy.article2.summary",
    category: "Nutrition",
    source: "Meta-Analysis",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov",
    readTime: "4 min",
  },
  {
    id: 3,
    titleKey: "academy.article3.title",
    summaryKey: "academy.article3.summary",
    category: "Recovery",
    source: "NSCA Journal",
    sourceUrl: "https://journals.lww.com/nsca-jscr",
    readTime: "3 min",
  },
  {
    id: 4,
    titleKey: "academy.article4.title",
    summaryKey: "academy.article4.summary",
    category: "Physiology",
    source: "PubMed",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov",
    readTime: "5 min",
  },
  {
    id: 5,
    titleKey: "academy.article5.title",
    summaryKey: "academy.article5.summary",
    category: "Performance",
    source: "Sports Medicine",
    sourceUrl: "https://link.springer.com/journal/40279",
    readTime: "4 min",
  },
];

const categoryColors: Record<string, string> = {
  Strength: "bg-cta-orange/15 text-cta-orange",
  Nutrition: "bg-cta-green/15 text-cta-green",
  Recovery: "bg-accent/15 text-accent",
  Physiology: "bg-primary/15 text-primary",
  Performance: "bg-cta-orange/15 text-cta-orange",
};

const AcademyPage = () => {
  const { t } = useLang();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
          {t("academy.title")}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t("academy.subtitle")}</p>

      <div className="flex items-center gap-2 mb-5 glass-card rounded-xl p-3">
        <Brain className="w-4 h-4 text-accent flex-shrink-0" />
        <p className="text-xs text-muted-foreground">{t("academy.aiNote")}</p>
      </div>

      <div className="space-y-4">
        {articles.map((article, i) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
              className="w-full text-left p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-display font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${categoryColors[article.category] || "bg-primary/10 text-primary"}`}>
                  {article.category}
                </span>
                <span className="text-[10px] text-muted-foreground">{article.readTime}</span>
              </div>
              <h3 className="font-semibold text-foreground leading-tight text-sm">
                {t(article.titleKey)}
              </h3>
            </button>

            {expandedId === article.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4"
              >
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {t(article.summaryKey)}
                </p>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t("academy.source")}: {article.source}
                </a>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AcademyPage;
