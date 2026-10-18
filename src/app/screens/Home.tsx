import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Camera, Palette, Sparkles, Clapperboard, Search, Star, MapPin, ArrowRight } from "lucide-react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import HeartButton from "../components/HeartButton";
import VerifiedBadge from "../components/VerifiedBadge";
import NotificationBell from "../components/NotificationBell";
import ThemeToggle from "../components/ThemeToggle";

const CATEGORIES = [
  { name: "Photography", icon: Camera, blurb: "Weddings, portraits, product shoots", span: "md:col-span-3 md:row-span-2", tone: "bg-primary text-primary-foreground" },
  { name: "Videography", icon: Clapperboard, blurb: "Reels, events, edits", span: "md:col-span-3", tone: "bg-accent text-accent-foreground" },
  { name: "Design", icon: Palette, blurb: "Logos, posters, social kits", span: "md:col-span-2", tone: "bg-secondary text-secondary-foreground" },
  { name: "Makeup", icon: Sparkles, blurb: "Bridal, party, editorial", span: "md:col-span-1", tone: "bg-card text-card-foreground border" },
];

const STEPS = [
  ["Find", "Filter by category, city, price and rating."],
  ["Book", "Pick a date, send your request, chat with the creator."],
  ["Review", "Rate the work so the next person books with confidence."],
];

type Creator = { id: string; name?: string; category?: string; location?: string; price?: number | string; rating?: number; totalReviews?: number; profileImage?: string };

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [featured, setFeatured] = useState<Creator[] | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, "creators"), orderBy("rating", "desc"), limit(4)))
      .then((s) => setFeatured(s.docs.map((d) => ({ id: d.id, ...(d.data() as object) }))))
      .catch(() => setFeatured([]));
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/categories?search=${encodeURIComponent(q.trim())}` : "/categories");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b">
        <nav className="mx-auto max-w-6xl flex items-center justify-between px-5 h-16">
          <Link to="/" className="font-display text-xl font-extrabold">Clip Crew</Link>
          <div className="flex items-center gap-2 sm:gap-5 text-sm">
            <Link to="/about" className="hidden sm:inline hover:text-primary">About</Link>
            <Link to="/contact" className="hidden sm:inline hover:text-primary">Contact</Link>
            <NotificationBell />
            <ThemeToggle />
            <Link to="/login" className="px-4 py-2 rounded-full border hover:bg-secondary">Log in</Link>
            <Link to="/register" className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium">Join</Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        <section className="hero-in py-16 md:py-24 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.02]">Book the <span className="text-grad">creative</span> who gets your vision.</h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl">Photographers, videographers, designers and makeup artists, with real portfolios, clear prices and chat built in.</p>
          <form onSubmit={search} className="mt-8 flex items-center gap-2 p-2 pl-5 rounded-full border glass shadow-lg max-w-xl focus-within:ring-2 ring-ring">
            <Search size={18} className="text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search creators" placeholder="Wedding photographer, logo designer…" className="flex-1 bg-transparent outline-none py-2" />
            <button className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium">Search</button>
          </form>
          <Link to="/match" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><Sparkles size={16} /> Not sure who to book? Try smart match</Link>
        </section>

        <section aria-labelledby="cats" className="pb-20">
          <h2 id="cats" className="text-2xl md:text-3xl font-bold mb-6">Browse by craft</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 md:auto-rows-[10rem] gap-4">
            {CATEGORIES.map(({ name, icon: Icon, blurb, span, tone }) => (
              <button key={name} onClick={() => navigate(`/categories?category=${name}`)} className={`${span} ${tone} group text-left rounded-3xl p-6 flex flex-col justify-between min-h-40 transition-transform hover:-translate-y-1`}>
                <Icon size={30} />
                <div>
                  <h3 className="text-2xl font-bold">{name}</h3>
                  <p className="text-sm opacity-80">{blurb}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {(featured === null || featured.length > 0) && (
          <section aria-labelledby="top" className="pb-20">
            <h2 id="top" className="text-2xl md:text-3xl font-bold mb-6">Top rated right now</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured === null
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 rounded-3xl bg-muted animate-pulse" />)
                : featured.map((c) => (
                    <div key={c.id} className="relative"><button onClick={() => navigate(`/creator/${c.id}`)} className="text-left w-full rounded-3xl overflow-hidden border bg-card hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="aspect-[4/5] bg-muted">
                        {c.profileImage && <img src={c.profileImage} alt={c.name} loading="lazy" className="size-full object-cover" />}
                      </div>
                      <div className="p-4">
                        <p className="font-semibold truncate">{c.name}{(c as any).verified && <VerifiedBadge />}</p>
                        <p className="text-sm text-muted-foreground truncate">{c.category}</p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1"><Star size={14} className="fill-accent text-accent" />{c.totalReviews ? (c.rating ?? 0).toFixed(1) : "New"}</span>
                          {c.location && <span className="flex items-center gap-1 text-muted-foreground truncate"><MapPin size={14} />{c.location}</span>}
                        </div>
                      </div>
                    </button><HeartButton id={c.id} /></div>
                  ))}
            </div>
          </section>
        )}

        <section aria-labelledby="how" className="pb-20">
          <h2 id="how" className="text-2xl md:text-3xl font-bold mb-6">How booking works</h2>
          <ol className="grid md:grid-cols-3 gap-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-3xl glass p-6">
                <span className="font-display text-4xl font-extrabold text-primary">{i + 1}</span>
                <h3 className="mt-3 text-xl font-bold">{t}</h3>
                <p className="mt-1 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pb-24">
          <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Are you a creator?</h2>
              <p className="mt-2 opacity-90">Set up your profile, show your work and start getting booked.</p>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background text-foreground font-semibold self-start">List your work <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}
