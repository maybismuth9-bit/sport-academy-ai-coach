import { useLang } from "@/contexts/LangContext";

interface SectionDisclaimerProps {
  page: "academy" | "nutrition" | "workout" | "physio";
  className?: string;
}

const SectionDisclaimer = ({ page, className = "" }: SectionDisclaimerProps) => {
  const { t } = useLang();

  return (
    <p className={`mt-6 text-center text-[10px] leading-relaxed text-muted-foreground ${className}`}>
      {t(`disclaimer.${page}`)}
    </p>
  );
};

export default SectionDisclaimer;