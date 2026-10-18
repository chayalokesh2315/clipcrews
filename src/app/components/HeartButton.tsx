import { Heart } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

export default function HeartButton({ id }: { id: string }) {
  const { ids, toggle } = useFavorites();
  const on = ids.has(id);
  return (
    <button aria-label={on ? "Remove from saved" : "Save creator"} aria-pressed={on} onClick={(e) => { e.stopPropagation(); toggle(id); }}
      className="absolute top-3 right-3 size-9 grid place-items-center rounded-full glass hover:scale-110 transition-transform">
      <Heart size={18} className={on ? "fill-pink-500 text-pink-500" : ""} />
    </button>
  );
}
