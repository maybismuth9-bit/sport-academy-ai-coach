import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeFeed from "@/components/HomeFeed";
import AssessmentForm from "@/components/AssessmentForm";
import WorkoutGenerator from "@/components/WorkoutGenerator";
import NutritionDashboard from "@/components/NutritionDashboard";
import AcademyPage from "@/components/AcademyPage";
import RecoveryPage from "@/components/RecoveryPage";
import LangToggle from "@/components/LangToggle";
import { LangProvider, useLang } from "@/contexts/LangContext";
import { NutritionPlan, AssessmentData } from "@/components/AssessmentForm";

const AppContent = () => {
  const [page, setPage] = useState("home");
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const { dir } = useLang();

  const handleStartAssessment = () => setPage("assessment");

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative" dir={dir}>
      <LangToggle />
      {page === "home" && <HomeFeed onStartAssessment={handleStartAssessment} />}
      {page === "assessment" && (
        <AssessmentForm onComplete={(data, plan) => {
          setAssessmentData(data);
          setNutritionPlan(plan);
          setHasCompletedAssessment(true);
          setPage("nutrition");
        }} />
      )}
      {page === "academy" && <AcademyPage />}
      {page === "workout" && <WorkoutGenerator />}
      {page === "nutrition" && <NutritionDashboard plan={nutritionPlan} assessmentData={assessmentData} />}
      {page === "recovery" && <RecoveryPage />}
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
