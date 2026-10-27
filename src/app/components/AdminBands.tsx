import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "../../firebase";

export default function AdminBands() {
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ role: "", min: "", max: "", unit: "per project" });
  const load = () => getDocs(collection(db, "rateBands")).then((s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })))).catch(() => {});
  useEffect(() => { load(); }, []);
  const save = async () => {
    const key = f.role.trim().toLowerCase(), min = Number(f.min), max = Number(f.max);
    if (!key || !(min > 0) || !(max >= min)) return toast("Enter a role, a minimum, and a maximum that is not lower than the minimum.");
    try { await setDoc(doc(db, "rateBands", key), { role: f.role.trim(), min, max, unit: f.unit.trim() || "per project" }); toast("Saved"); setF({ ...f, role: "", min: "", max: "" }); load(); }
    catch { toast("Could not save."); }
  };
  const input = "rounded-xl border bg-card p-3 outline-none focus:ring-2 ring-ring w-full";
  return (
    <section className="mt-6">
      <p className="text-muted-foreground">Set the allowed lump-sum rate for each role. Creators must price inside their role's range. The role name must match what creators type as their category.</p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <input className={input} aria-label="Role" placeholder="Role (e.g. Video Editor)" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} />
        <input className={input} aria-label="Minimum" type="number" placeholder="Min ₹" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} />
        <input className={input} aria-label="Maximum" type="number" placeholder="Max ₹" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} />
        <input className={input} aria-label="Unit" placeholder="per video / session…" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} />
        <button onClick={save} className="px-4 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Save</button>
      </div>
      <ul className="mt-6 grid gap-2">
        {rows.length === 0 && <li className="text-muted-foreground">No rate ranges yet. Creators can price freely until you add one.</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-2xl glass px-4 py-3">
            <span><b>{r.role}</b>: ₹{r.min} to ₹{r.max} {r.unit}</span>
            <button onClick={async () => { await deleteDoc(doc(db, "rateBands", r.id)); load(); }} className="text-sm text-destructive font-semibold">Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
