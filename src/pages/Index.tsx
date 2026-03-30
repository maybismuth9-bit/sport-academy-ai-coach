import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeFeed from "@/components/HomeFeed";
import AssessmentForm from "@/components/AssessmentForm";
import WorkoutGenerator from "@/components/WorkoutGenerator";
import NutritionDashboard from "@/components/NutritionDashboard";
import LangToggle from "@/components/LangToggle";
import { LangProvider, useLang } from "@/contexts/LangContext";
import { NutritionPlan } from "@/components/AssessmentForm";

const AppContent = () => {
  const [page, setPage] = useState("home");
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const { dir } = useLang();

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative" dir={dir}>
      <LangToggle />
      {page === "home" && <HomeFeed />}
      {page === "assessment" && (
        <AssessmentForm onComplete={(_, plan) => {
          setNutritionPlan(plan);
          setPage("nutrition");
        }} />
      )}
      {page === "workout" && <WorkoutGenerator />}
      {page === "nutrition" && <NutritionDashboard plan={nutritionPlan} />}
      <BottomNav active={page} onNavigate={setPage} />
    </div>
  );
};

const Index = () => (
  <LangProvider>
    <AppContent />
  </LangProvider>
);

export default Index;
