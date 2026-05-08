import { Home, Clock, Calendar, BookOpen, Trophy, Sparkles, GraduationCap, Bot } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "AI Assistant", url: "/assistant", icon: Bot, color: "text-teal-500", bg: "bg-teal-500/10" },
  { title: "Pomodoro Timer", url: "/timer", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
  { title: "AI Schedule", url: "/schedule", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
  { title: "Subjects", url: "/subjects", icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
  { title: "Backlog", url: "/backlog", icon: Calendar, color: "text-red-500", bg: "bg-red-500/10" },
  { title: "Rewards", url: "/rewards", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-md">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">StudyFlow</h1>
            <p className="text-xs text-muted-foreground">Your Smart Study Assistant</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      className="h-10 rounded-lg"
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${isActive ? "bg-primary text-primary-foreground" : item.bg}`}>
                          <item.icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : item.color}`} />
                        </div>
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 p-3 text-center">
          <p className="text-xs font-medium text-foreground">Kota Study Companion</p>
          <p className="text-xs text-muted-foreground mt-0.5">Stay focused. Ace exams.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
