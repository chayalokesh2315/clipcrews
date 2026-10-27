import { Check } from "lucide-react";
type Pkg = { name: string; price: number; description: string; deliverables: string };
export default function PackagesList({ packages }: { packages?: Pkg[] }) {
  if (!packages?.length) return null;
  return (
    <section className="my-8" aria-labelledby="pk">
      <h2 id="pk" className="text-2xl font-bold mb-4">Packages</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {packages.map((p, i) => (
          <div key={i} className={`rounded-3xl border bg-card p-5 ${i === 1 ? "ring-2 ring-primary" : ""}`}>
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="text-3xl font-extrabold text-grad">₹{p.price}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {p.deliverables.split("\n").filter(Boolean).map((d) => <li key={d} className="flex gap-2"><Check size={16} className="text-primary shrink-0 mt-0.5" />{d}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
