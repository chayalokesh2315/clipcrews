import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "../../firebase";

const blank = (name: string) => ({ name, price: 0, description: "", deliverables: "" });
export default function Packages() {
  const [pk, setPk] = useState([blank("Basic"), blank("Standard"), blank("Premium")]);
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setUid(u?.uid ?? null);
    if (!u) return;
    const p = (await getDoc(doc(db, "creators", u.uid))).data()?.packages;
    if (p?.length) setPk(p);
  }), []);
  const edit = (i: number, k: string, v: string) => setPk(pk.map((p, j) => (j === i ? { ...p, [k]: k === "price" ? Number(v) || 0 : v } : p)));
  const save = async () => {
    if (!uid) return toast("Log in as a creator first");
    try { await updateDoc(doc(db, "creators", uid), { packages: pk.filter((p) => p.price > 0) }); toast("Packages saved"); }
    catch { toast("Only creators can save packages."); }
  };
  const f = "w-full rounded-xl border bg-card p-3 outline-none focus:ring-2 ring-ring";
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-4xl font-extrabold">Your packages</h1>
      <p className="mt-2 text-muted-foreground">Set up to three tiers. Tiers with a price of 0 are hidden.</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {pk.map((p, i) => (
          <div key={i} className="rounded-3xl glass p-5 grid gap-3">
            <input aria-label="Package name" className={f} value={p.name} onChange={(e) => edit(i, "name", e.target.value)} />
            <input aria-label="Price in rupees" type="number" min={0} className={f} value={p.price || ""} placeholder="Price (₹)" onChange={(e) => edit(i, "price", e.target.value)} />
            <input aria-label="Short description" className={f} value={p.description} placeholder="Short description" onChange={(e) => edit(i, "description", e.target.value)} />
            <textarea aria-label="Deliverables, one per line" rows={4} className={f} value={p.deliverables} placeholder={"One deliverable per line\n2 hours coverage\n50 edited photos"} onChange={(e) => edit(i, "deliverables", e.target.value)} />
          </div>
        ))}
      </div>
      <button onClick={save} className="mt-6 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Save packages</button>
    </main>
  );
}
