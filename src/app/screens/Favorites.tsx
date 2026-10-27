import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Star } from "lucide-react";
import { db } from "../../firebase";
import { useFavorites } from "../hooks/useFavorites";
import HeartButton from "../components/HeartButton";

export default function Favorites() {
  const navigate = useNavigate();
  const { ids } = useFavorites();
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([...ids].map((id) => getDoc(doc(db, "creators", id)))).then((s) =>
      setList(s.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() }))));
  }, [ids]);
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-4xl font-extrabold">Saved creators</h1>
      {list.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Nothing saved yet. Tap the heart on a creator to keep them here. <Link to="/categories" className="text-primary font-semibold">Browse creators</Link></p>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {list.map((c) => (
            <div key={c.id} className="relative">
              <button onClick={() => navigate(`/creator/${c.id}`)} className="w-full text-left rounded-3xl overflow-hidden border bg-card hover:shadow-xl transition-shadow">
                <div className="aspect-[4/5] bg-muted">{c.profileImage && <img src={c.profileImage} alt={c.name} loading="lazy" className="size-full object-cover" />}</div>
                <div className="p-4"><p className="font-semibold truncate">{c.name}</p><p className="text-sm text-muted-foreground flex items-center gap-1">{c.category} · <Star size={13} className="fill-accent text-accent" />{c.totalReviews ? c.rating?.toFixed(1) : "New"}</p></div>
              </button>
              <HeartButton id={c.id} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
