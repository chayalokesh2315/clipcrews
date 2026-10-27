import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { Sparkles, Star, MapPin } from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import app, { db } from "../../firebase";
import ThemeToggle from "../components/ThemeToggle";

type Creator = { id: string; name?: string; category?: string; subCategory?: string; location?: string; price?: number; rating?: number; totalReviews?: number; experience?: number; about?: string; profileImage?: string };
type Match = Creator & { score: number; reasons: string[] };

const KEYWORDS: Record<string, string[]> = {
  Photography: ["photo", "photographer", "wedding", "portrait", "shoot", "candid", "product shoot"],
  Videography: ["video", "videographer", "reel", "film", "edit", "youtube", "event video"],
  Design: ["design", "designer", "logo", "poster", "brand", "banner", "ui", "graphic"],
  Makeup: ["makeup", "make-up", "bridal", "mua", "hair", "beauty", "party look"],
};

function parse(text: string) {
  const t = text.toLowerCase();
  const category = Object.entries(KEYWORDS).find(([, ks]) => ks.some((k) => t.includes(k)))?.[0];
  const m = t.match(/(?:under|below|budget|within|upto|up to|max)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(k)?/) || t.match(/(?:₹|rs\.?)\s*([\d,]+)\s*(k)?/);
  let budget = m ? Number(m[1].replace(/,/g, "")) : undefined;
  if (budget && m?.[2]) budget *= 1000;
  return { t, category, budget };
}

function rank(list: Creator[], text: string): Match[] {
  const { t, category, budget } = parse(text);
  const words = t.split(/\W+/).filter((w) => w.length > 3);
  return list
    .map((c) => {
      let score = 0;
      const reasons: string[] = [];
      if (category && c.category === category) { score += 40; reasons.push(`${category} specialist`); }
      else if (category) score -= 30;
      const hay = `${c.subCategory ?? ""} ${c.about ?? ""}`.toLowerCase();
      const hits = words.filter((w) => hay.includes(w)).length;
      if (hits) { score += Math.min(hits, 4) * 6; reasons.push("matches your description"); }
      if (c.location && t.includes(c.location.toLowerCase())) { score += 20; reasons.push(`in ${c.location}`); }
      if (budget && c.price) {
        if (c.price <= budget) { score += 15; reasons.push("within budget"); } else score -= 15 + Math.min(20, ((c.price - budget) / budget) * 20);
      }
      if (c.totalReviews) { score += (c.rating ?? 0) * 4 + Math.min(c.totalReviews, 20) * 0.5; if ((c.rating ?? 0) >= 4.5) reasons.push("highly rated"); }
      score += Math.min(c.experience ?? 0, 10);
      return { ...c, score, reasons };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

const IDEAS = ["Wedding photographer in Bengaluru under 20000", "Logo designer for my startup, budget 5k", "Bridal makeup artist highly rated", "Reel editor for my brand"];

export default function Recommend() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [results, setResults] = useState<Match[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState(false);

  const run = async (q = text) => {
    if (!q.trim()) return;
    setBusy(true);
    try {
      const snap = await getDocs(collection(db, "creators"));
      const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as Creator));
      try {
        const res: any = await httpsCallable(getFunctions(app, "asia-south1"), "aiMatch")({ request: q });
        const picks: { id: string; reason: string }[] = res.data.matches ?? [];
        const found = picks.map((p) => { const c = all.find((x) => x.id === p.id); return c && { ...c, score: 1, reasons: [p.reason] }; }).filter(Boolean) as Match[];
        if (found.length) { setAi(true); setResults(found); return; }
      } catch { /* function not deployed: use local ranking */ }
      setAi(false);
      setResults(rank(all, q));
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <nav className="mx-auto max-w-4xl h-16 px-5 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-extrabold">Clip Crew</Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold flex items-center gap-3"><Sparkles className="text-accent" /> Smart match</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">Describe the job in your own words: what you need, where, and your budget. We rank creators on category, skills, location, price and reviews.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="e.g. I need a candid wedding photographer in Bengaluru, budget 25k" className="mt-6 w-full rounded-2xl border bg-card p-4 outline-none focus:ring-2 ring-ring" />
        <div className="mt-3 flex flex-wrap gap-2">
          {IDEAS.map((i) => <button key={i} onClick={() => { setText(i); run(i); }} className="text-sm px-3 py-1.5 rounded-full border hover:bg-secondary">{i}</button>)}
        </div>
        <button onClick={() => run()} disabled={busy} className="mt-5 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-60">{busy ? "Matching…" : "Find my match"}</button>

        {results && (
          <section className="mt-10" aria-live="polite">
            {ai && <p className="mb-3 text-sm font-semibold text-primary">AI-ranked for your request</p>}
            {results.length === 0 ? <p className="text-muted-foreground">No close matches yet. Try a different category or a higher budget.</p> : (
              <ul className="grid gap-4">
                {results.map((c, i) => (
                  <li key={c.id}>
                    <button onClick={() => navigate(`/creator/${c.id}`)} className="w-full text-left flex gap-4 rounded-3xl border bg-card p-4 hover:shadow-lg transition-shadow">
                      <div className="size-24 shrink-0 rounded-2xl overflow-hidden bg-muted">{c.profileImage && <img src={c.profileImage} alt={c.name} className="size-full object-cover" />}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-primary">{i === 0 ? "Best match" : `Match #${i + 1}`}</p>
                        <h3 className="text-xl font-bold truncate">{c.name}</h3>
                        <p className="text-sm text-muted-foreground flex flex-wrap gap-x-3">
                          <span>{c.category}</span>
                          {c.location && <span className="flex items-center gap-1"><MapPin size={13} />{c.location}</span>}
                          {c.price ? <span>from ₹{c.price}</span> : null}
                          <span className="flex items-center gap-1"><Star size={13} className="fill-accent text-accent" />{c.totalReviews ? (c.rating ?? 0).toFixed(1) : "New"}</span>
                        </p>
                        {c.reasons.length > 0 && <p className="mt-2 text-sm">Why: {c.reasons.join(", ")}</p>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
