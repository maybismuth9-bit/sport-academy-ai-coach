import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import { BookOpen, ExternalLink, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface Article {
  id: string;
  title: string;
  link: string | null;
  category: string;
}

const categoryColors: Record<string, string> = {
  Strength: "bg-cta-orange/15 text-cta-orange",
  Nutrition: "bg-cta-green/15 text-cta-green",
  Recovery: "bg-accent/15 text-accent",
  General: "bg-primary/15 text-primary",
  Science: "bg-primary/15 text-primary",
};

const KnowledgeHub = () => {
  const { t } = useLang();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
      if (data) setArticles(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const categories = [...new Set(articles.map(a => a.category))];

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || a.category === filterCategory;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
          {t("knowledgeHub.title")}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t("knowledgeHub.subtitle")}</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("knowledgeHub.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary/50"
        />
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCategory(null)}
            className={`text-[10px] font-display font-semibold tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              !filterCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {t("knowledgeHub.all")}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat === filterCategory ? null : cat)}
              className={`text-[10px] font-display font-semibold tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t("knowledgeHub.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4"
            >
              <span className={`text-[10px] font-display font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${categoryColors[article.category] || "bg-primary/10 text-primary"}`}>
                {article.category}
              </span>
              <h3 className="font-semibold text-foreground text-sm mt-2">{article.title}</h3>
              {article.link && (
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t("knowledgeHub.readMore")}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeHub;
