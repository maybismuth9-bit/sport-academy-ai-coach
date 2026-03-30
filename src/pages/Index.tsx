import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeFeed from "@/components/HomeFeed";
import AssessmentForm from "@/components/AssessmentForm";
import WorkoutGenerator from "@/components/WorkoutGenerator";
import NutritionDashboard from "@/components/NutritionDashboard";

const Index = () => {
  const [page, setPage] = useState("home");

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {page === "home" && <HomeFeed />}
      {page === "assessment" && <AssessmentForm onComplete={() => setPage("nutrition")} />}
      {page === "workout" && <WorkoutGenerator />}
      {page === "nutrition" && <NutritionDashboard />}
      <BottomNav active={page} onNavigate={setPage} />
    </div>
  );
};

export default Index;
