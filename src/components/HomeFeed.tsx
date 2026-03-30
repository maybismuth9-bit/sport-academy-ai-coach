import { motion } from "framer-motion";
import heroImg from "@/assets/hero-gym.jpg";
import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";

const articles = [
  {
    id: 1,
    title: "5 Compound Movements That Build Real Strength",
    summary: "Master the deadlift, squat, bench press, overhead press and barbell row for maximum muscle activation.",
    image: article1,
    category: "Training",
    readTime: "4 min",
  },
  {
    id: 2,
    title: "Meal Prep Like a Pro: Weekly Nutrition Guide",
    summary: "Save time and stay on track with these simple high-protein meal prep strategies for busy athletes.",
    image: article2,
    category: "Nutrition",
    readTime: "6 min",
  },
  {
    id: 3,
    title: "Recovery Science: Why Rest Days Matter",
    summary: "Understanding muscle recovery, sleep optimization and active rest for better performance gains.",
    image: article3,
    category: "Recovery",
    readTime: "5 min",
  },
];

const HomeFeed = () => {
  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        <img src={heroImg} alt="Sport Academy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-display font-bold tracking-wider neon-text text-primary"
          >
            SPORT ACADEMY
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1">Your daily fitness & nutrition feed</p>
        </div>
      </div>

      {/* Articles */}
      <div className="px-4 mt-6 space-y-4">
        <h2 className="text-xs font-display font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          Latest Articles
        </h2>
        {articles.map((article, i) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl overflow-hidden cursor-pointer hover:neon-border transition-shadow duration-300"
          >
            <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
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
