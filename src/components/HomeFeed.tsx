import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import heroImg from "@/assets/hero-gym.jpg";
import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";

const HomeFeed = () => {
  const { t } = useLang();

  const articles = [
    { id: 1, title: t("home.article1.title"), summary: t("home.article1.summary"), image: article1, category: t("home.article1.category"), readTime: "4 min" },
    { id: 2, title: t("home.article2.title"), summary: t("home.article2.summary"), image: article2, category: t("home.article2.category"), readTime: "6 min" },
    { id: 3, title: t("home.article3.title"), summary: t("home.article3.summary"), image: article3, category: t("home.article3.category"), readTime: "5 min" },
  ];

  return (
    <div className="pb-24">
      <div className="relative h-64 overflow-hidden">
        <img src={heroImg} alt="Sport Academy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5">
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

      <div className="px-4 mt-6 space-y-4">
        <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          {t("home.latest")}
        </h2>
        {articles.map((article, i) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
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
