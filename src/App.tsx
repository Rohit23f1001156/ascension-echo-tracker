
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { PlayerProvider } from "@/context/PlayerContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                } />
                <Route path="/skill-tree" element={
                  <ProtectedRoute>
                    <SkillTree />
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                } />
                <Route path="/stats" element={
                  <ProtectedRoute>
                    <Stats />
                  </ProtectedRoute>
                } />
                <Route path="/daily-quests" element={
                  <ProtectedRoute>
                    <DailyQuests />
                  </ProtectedRoute>
                } />
                <Route path="/custom-tasks" element={
                  <ProtectedRoute>
                    <CustomTasks />
                  </ProtectedRoute>
                } />
                <Route path="/boss-fights" element={
                  <ProtectedRoute>
                    <BossFights />
                  </ProtectedRoute>
                } />
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
