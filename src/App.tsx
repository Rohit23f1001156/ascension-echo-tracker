
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DailyQuests from "./pages/DailyQuests";
import SkillTree from "./pages/SkillTree";
import Stats from "./pages/Stats";
import Journal from "./pages/Journal";
import CalendarPage from "./pages/CalendarPage";
import BossFights from "./pages/BossFights";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PlayerProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRouter />
      </TooltipProvider>
    </PlayerProvider>
  </QueryClientProvider>
);

const AppRouter = () => {
  const { stats } = usePlayer();
  const onboardingComplete = localStorage.getItem("onboardingComplete") === "true" && stats.name;

  return (
    <BrowserRouter>
      <Routes>
        {onboardingComplete ? (
          <>
            <Route path="/" element={<Index />} />
            <Route path="/daily-quests" element={<DailyQuests />} />
            <Route path="/skill-tree" element={<SkillTree />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/boss-fights" element={<BossFights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/onboarding" element={<Navigate to="/" />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/onboarding" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};


export default App;
