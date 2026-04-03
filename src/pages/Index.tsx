import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import HomeFeed from "@/components/HomeFeed";
import AssessmentForm from "@/components/AssessmentForm";
import WorkoutGenerator from "@/components/WorkoutGenerator";
import NutritionDashboard from "@/components/NutritionDashboard";
import AcademyPage from "@/components/AcademyPage";
import RecoveryPage from "@/components/RecoveryPage";
import ProgressTracker from "@/components/ProgressTracker";
import DailyWorkout from "@/components/DailyWorkout";
import NutritionPlanPage from "@/components/NutritionPlanPage";
import KnowledgeHub from "@/components/KnowledgeHub";
import AuthPage from "@/components/AuthPage";
import LangToggle from "@/components/LangToggle";
import { LangProvider, useLang } from "@/contexts/LangContext";
import { NutritionPlan, AssessmentData } from "@/components/AssessmentForm";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AppContent = () => {
  const [page, setPage] = useState("home");
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { dir, t } = useLang();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage("home");
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <LangToggle />
        <AuthPage onAuth={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative" dir={dir}>
      <div className="flex items-center justify-between px-4 pt-2">
        <LangToggle />
        <Button variant="ghost" size="icon" onClick={handleLogout} title={t("auth.logout")}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
      {page === "home" && <HomeFeed onStartAssessment={() => setPage("assessment")} />}
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
      {page === "progress" && <ProgressTracker />}
      {page === "dailyWorkout" && <DailyWorkout />}
      {page === "nutritionPlan" && <NutritionPlanPage />}
      {page === "knowledgeHub" && <KnowledgeHub />}
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
