import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Home, Search, Sparkles, CalendarCheck, User } from "lucide-react";
import { auth, db } from "../../firebase";

export default function BottomNav() {
  const { pathname } = useLocation();
  const [account, setAccount] = useState("/login");
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u) return setAccount("/login");
    const c = await getDoc(doc(db, "creators", u.uid));
    setAccount(c.exists() ? "/dashboard" : "/customer-dashboard");
  }), []);
  if (["/login", "/register", "/splash"].includes(pathname) || pathname.startsWith("/chat") || pathname.startsWith("/creator-chat")) return null;
  const tabs = [["/", "Home", Home], ["/categories", "Browse", Search], ["/match", "Match", Sparkles], ["/bookings", "Bookings", CalendarCheck], [account, "Account", User]] as const;
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
