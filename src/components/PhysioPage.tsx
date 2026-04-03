import { Heart } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const PhysioPage = () => {
  const { t } = useLang();

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center gap-2 mb-1">
        <Heart className="w-5 h-5 text-accent" />
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-accent">
          {t("physio.title")}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t("physio.subtitle")}</p>

      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-accent" />
        </div>
        <h2 className="font-display font-bold text-foreground text-lg mb-2">
          {t("physio.comingSoon")}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          {t("physio.comingSoonDesc")}
        </p>
      </div>
    </div>
  );
};

export default PhysioPage;
