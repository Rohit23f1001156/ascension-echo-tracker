
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { PlayerProvider } from "@/context/PlayerContext";
import LevelUpConfetti from "@/components/LevelUpConfetti";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import Journal from "./pages/Journal";
import SkillTree from "./pages/SkillTree";
import CalendarPage from "./pages/CalendarPage";
import Stats from "./pages/Stats";
import DailyQuests from "./pages/DailyQuests";
import CustomTasks from "./pages/CustomTasks";
import BossFights from "./pages/BossFights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <PlayerProvider>
              <LevelUpConfetti />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/skill-tree" element={<SkillTree />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/daily-quests" element={<DailyQuests />} />
                <Route path="/custom-tasks" element={<CustomTasks />} />
                <Route path="/boss-fights" element={<BossFights />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PlayerProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
