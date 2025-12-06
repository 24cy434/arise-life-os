import { NavLink } from "react-router-dom";
import { Home, BookOpen, CheckSquare, Target, Calendar, BarChart3, User, Sparkles, X, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useStats } from "@/lib/store";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Habits", href: "/habits", icon: Repeat },
  { name: "Focus", href: "/focus", icon: Target },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const stats = useStats();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />}
      <aside className={cn("fixed top-0 left-0 z-40 h-screen w-56 bg-card border-r border-border transition-transform duration-300 ease-in-out md:translate-x-0", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-14 px-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center"><Sparkles className="w-4 h-4 text-primary-foreground" /></div>
              <span className="text-lg font-bold gradient-text">ARISE</span>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink key={item.name} to={item.href} onClick={onClose} className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-border">
            <div className="glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Level {stats.level}</span>
                <span className="text-xs font-medium">{stats.xp} XP</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${stats.xp % 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
