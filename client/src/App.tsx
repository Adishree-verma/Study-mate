import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import TimerPage from "@/pages/timer";
import SchedulePage from "@/pages/schedule";
import SubjectsPage from "@/pages/subjects";
import BacklogPage from "@/pages/backlog";
import RewardsPage from "@/pages/rewards";
import AssistantPage from "@/pages/assistant";
import { FloatingAiButton } from "@/components/floating-ai-button";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { recordNavigation } from "@/lib/behavior-tracker";

function NavTracker() {
  const [location] = useLocation();
  useEffect(() => { recordNavigation(location); }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <NavTracker />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/timer" component={TimerPage} />
        <Route path="/schedule" component={SchedulePage} />
        <Route path="/subjects" component={SubjectsPage} />
        <Route path="/backlog" component={BacklogPage} />
        <Route path="/rewards" component={RewardsPage} />
        <Route path="/assistant" component={AssistantPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between gap-2 border-b px-4 py-3 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
            <FloatingAiButton />
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
