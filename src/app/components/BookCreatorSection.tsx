import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { MapPin, Search, Sparkles, Star } from "lucide-react";
import { db } from "../../firebase";
import HeartButton from "./HeartButton";
import VerifiedBadge from "./VerifiedBadge";

const norm = (s: any) => String(s ?? "").trim().toLowerCase();
const title = (s: string) => s.trim().replace(/\b\w/g, (m) => m.toUpperCase());

export default function BookCreatorSection() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [shown, setShown] = useState(8);

  useEffect(() => {
    Promise.all([getDocs(collection(db, "creators")), getDocs(collection(db, "reviews")).catch(() => null)])
      .then(([c, r]) => {
        const st = new Map<string, { sum: number; n: number }>();
        r?.docs.forEach((d) => { const x = d.data(); const e = st.get(x.creatorId) ?? { sum: 0, n: 0 }; e.sum += Number(x.rating) || 0; e.n++; st.set(x.creatorId, e); });
        setList(c.docs.map((d) => { const s = st.get(d.id); return { id: d.id, ...d.data(), rating: s ? s.sum / s.n : 0, totalReviews: s?.n ?? 0 }; })
          .sort((a: any, b: any) => b.rating - a.rating || b.totalReviews - a.totalReviews));
      })
      .catch(() => setList([]));
  }, []);

  const roles = useMemo(() => {
    const m = new Map<string, string>();
    (list ?? []).forEach((c) => { const k = norm(c.category); if (k && !m.has(k)) m.set(k, title(String(c.category))); });
    return [...m.entries()];
  }, [list]);

  const rows = (list ?? []).filter((c) => (role === "all" || norm(c.category) === role) &&
    `${c.name} ${c.category} ${c.subCategory} ${c.location}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <section aria-labelledby="book" className="rounded-3xl glass p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="book" className="text-2xl font-bold">Book a creator</h2>
        <div className="flex gap-3 text-sm font-semibold">
          <Link to="/match" className="flex items-center gap-1 text-primary"><Sparkles size={15} /> Smart match</Link>
          <Link to="/bookings" className="text-primary">My bookings</Link>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-full border bg-card px-4 py-2 focus-within:ring-2 ring-ring">
        <Search size={16} className="text-muted-foreground" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setShown(8); }} aria-label="Search creators" placeholder="Search by name, role or city" className="flex-1 bg-transparent outline-none" />
      </div>
      {roles.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {[["all", "All"], ...roles].map(([k, l]) => (
            <button key={k} aria-pressed={role === k} onClick={() => { setRole(k); setShown(8); }} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${role === k ? "bg-primary text-primary-foreground" : "border bg-card"}`}>{l}</button>
          ))}
        </div>
      )}
      {list === null && <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />)}</div>}
      {list !== null && rows.length === 0 && <p className="mt-6 text-muted-foreground">{list.length === 0 ? "No creators have joined yet." : "No creators match your search."}</p>}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {rows.slice(0, shown).map((c) => (
          <div key={c.id} className="relative rounded-3xl overflow-hidden border bg-card">
            <button onClick={() => navigate(`/creator/${c.id}`)} className="block w-full text-left">
              <div className="aspect-[4/5] bg-muted">{c.profileImage && <img src={c.profileImage} alt={c.name} loading="lazy" className="size-full object-cover" />}</div>
              <div className="p-3 pb-2">
                <p className="font-semibold truncate">{c.name}{c.verified && <VerifiedBadge />}</p>
                <p className="text-sm text-muted-foreground truncate">{c.subCategory || c.category}</p>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><Star size={13} className="fill-accent text-accent" />{c.totalReviews ? c.rating.toFixed(1) : "New"}</span>
                  <span className="font-semibold">₹{Number(c.price || 0).toLocaleString()}</span>
                </div>
                {c.location && <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1 truncate"><MapPin size={12} />{c.location}</p>}
              </div>
            </button>
            <HeartButton id={c.id} />
            <div className="px-3 pb-3"><Link to={`/booking/${c.id}`} className="block text-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Book now</Link></div>
          </div>
        ))}
      </div>
      {rows.length > shown && <button onClick={() => setShown(shown + 8)} className="mt-5 mx-auto block px-6 py-2 rounded-full border bg-card font-semibold">Show more</button>}
    </section>
  );
}
