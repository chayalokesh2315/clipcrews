import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { Bell } from "lucide-react";
import { auth, db } from "../../firebase";

export default function NotificationBell() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let off = () => {};
    const a = onAuthStateChanged(auth, (u) => {
      off();
      if (!u) return setItems([]);
      off = onSnapshot(query(collection(db, "notifications"), where("userId", "==", u.uid)), (s) =>
        setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((x: any, y: any) => (y.createdAt?.seconds ?? 0) - (x.createdAt?.seconds ?? 0)).slice(0, 15)));
    });
    return () => { a(); off(); };
  }, []);
  const unread = items.filter((i) => !i.read).length;
  const openItem = async (n: any) => { setOpen(false); if (!n.read) await updateDoc(doc(db, "notifications", n.id), { read: true }); navigate(n.link || "/bookings"); };
  if (!auth.currentUser && items.length === 0) return null;
  return (
    <div className="relative">
      <button aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} onClick={() => setOpen(!open)} className="relative size-10 grid place-items-center rounded-full border bg-card hover:bg-secondary">
        <Bell size={18} />{unread > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-pink-500 text-white text-[11px] grid place-items-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[85vw] rounded-2xl glass shadow-xl p-2 z-50">
          {items.length === 0 ? <p className="p-4 text-sm text-muted-foreground">You're all caught up.</p> : items.map((n) => (
            <button key={n.id} onClick={() => openItem(n)} className="w-full text-left p-3 rounded-xl hover:bg-secondary">
              <p className={`text-sm ${n.read ? "" : "font-semibold"}`}>{n.title}</p><p className="text-xs text-muted-foreground">{n.body}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
