import { Heart } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

export default function HeartButton({ id, inline }: { id: string; inline?: boolean }) {
  const { ids, toggle } = useFavorites();
  const on = ids.has(id);
  return (
    <button aria-label={on ? "Remove from saved" : "Save creator"} aria-pressed={on} onClick={(e) => { e.stopPropagation(); toggle(id); }}
      className={`${inline ? "ml-2 inline-grid align-middle" : "absolute top-3 right-3 grid"} size-9 place-items-center rounded-full glass hover:scale-110 transition-transform`}>
      <Heart size={18} className={on ? "fill-pink-500 text-pink-500" : ""} />
    </button>
  );
}
