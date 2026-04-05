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
import PhysioPage from "@/components/PhysioPage";
import AuthPage from "@/components/AuthPage";
import WeeklyPhotoReminder from "@/components/WeeklyPhotoReminder";
import LandingPage from "@/components/LandingPage";
import DashboardGreeting from "@/components/DashboardGreeting";
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
  const [showAuth, setShowAuth] = useState(false);
  const { dir, t } = useLang();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setShowAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowAuth(false);
    setPage("home");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guest experience: Landing page or Auth
  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <div className="absolute top-4 right-4 z-50">
          <LangToggle />
        </div>
        {showAuth ? (
          <div>
            <div className="pt-4 px-4">
              <button
                type="button"
                onClick={() => setShowAuth(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← {t("auth.login") === "Log In" ? "Back" : "חזרה"}
              </button>
            </div>
            <AuthPage onAuth={() => {}} />
          </div>
        ) : (
          <LandingPage onGetStarted={() => setShowAuth(true)} />
        )}
      </div>
    );
  }

  // Authenticated experience
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative" dir={dir}>
      <div className="flex items-center justify-between px-4 pt-2">
        <LangToggle />
        <Button variant="ghost" size="icon" onClick={handleLogout} title={t("auth.logout")}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Personalized greeting on home */}
      {page === "home" && <DashboardGreeting />}

      {page === "home" && <HomeFeed onStartAssessment={() => setPage("assessment")} onNavigate={setPage} />}
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
      {page === "recovery" && <PhysioPage />}
      {page === "progress" && <ProgressTracker />}
      {page === "dailyWorkout" && <DailyWorkout />}
      {page === "nutritionPlan" && <NutritionPlanPage />}
      {page === "knowledgeHub" && <KnowledgeHub />}
      <WeeklyPhotoReminder />
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
