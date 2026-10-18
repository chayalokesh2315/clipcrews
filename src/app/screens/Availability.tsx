import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "../../firebase";
import { Calendar } from "../components/ui/calendar";
import { iso } from "../lib/notify";

export default function Availability() {
  const [days, setDays] = useState<Date[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setUid(u?.uid ?? null);
    if (!u) return;
    const s = await getDoc(doc(db, "creators", u.uid));
    setDays((s.data()?.unavailable ?? []).map((d: string) => new Date(`${d}T00:00:00`)));
  }), []);
  const save = async () => {
    if (!uid) return toast("Log in as a creator first");
    try { await updateDoc(doc(db, "creators", uid), { unavailable: days.map(iso).sort() }); toast("Availability saved"); }
    catch { toast("Only creators can save availability."); }
  };
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-4xl font-extrabold">Availability</h1>
      <p className="mt-2 text-muted-foreground">Tap the days you can't work. Customers won't be able to book them.</p>
      <div className="mt-6 rounded-3xl glass p-3 flex justify-center">
        <Calendar mode="multiple" selected={days} onSelect={(d: any) => setDays(d ?? [])} disabled={{ before: new Date() }} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{days.length} day{days.length === 1 ? "" : "s"} blocked</p>
      <button onClick={save} className="mt-5 w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Save</button>
    </main>
  );
}
