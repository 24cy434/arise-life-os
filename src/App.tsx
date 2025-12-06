import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppProvider } from "@/lib/store";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import Tasks from "@/pages/Tasks";
import Focus from "@/pages/Focus";
import Calendar from "@/pages/Calendar";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import Habits from "@/pages/Habits";
import NotFound from "@/pages/NotFound";
import AIChat from "@/components/AIChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="arise-theme">
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="journal" element={<Journal />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="focus" element={<Focus />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
                <Route path="habits" element={<Habits />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIChat />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
