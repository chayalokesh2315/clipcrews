import { Link, useLocation } from "react-router-dom";
import { Home, Search, Sparkles, CalendarCheck, Heart, User } from "lucide-react";
import { useAuthRole } from "../hooks/useAuthRole";

export default function BottomNav() {
  const { pathname } = useLocation();
  const { user, home } = useAuthRole();
  if (["/login", "/register", "/splash"].includes(pathname) || pathname.startsWith("/chat") || pathname.startsWith("/creator-chat")) return null;
  const tabs = (user
    ? [[home, "Home", Home], ["/categories", "Browse", Search], ["/match", "Match", Sparkles], ["/bookings", "Bookings", CalendarCheck], ["/favorites", "Saved", Heart]]
    : [["/", "Home", Home], ["/categories", "Browse", Search], ["/match", "Match", Sparkles], ["/login", "Log in", User]]) as [string, string, any][];
  return (
    <nav aria-label="Main" className="md:hidden fixed bottom-3 inset-x-3 z-40 glass rounded-full shadow-xl flex justify-around py-2">
      {tabs.map(([to, label, Icon]) => {
        const on = pathname === to;
        return (
          <Link key={label} to={to} aria-current={on ? "page" : undefined} className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${on ? "text-primary" : "text-muted-foreground"}`}>
            <Icon size={20} />{label}
          </Link>
        );
      })}
    </nav>
  );
}
