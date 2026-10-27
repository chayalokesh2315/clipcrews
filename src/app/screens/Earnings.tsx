import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function Earnings() {
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u) return setRows([]);
    const s = await getDocs(query(collection(db, "transactions"), where("creatorId", "==", u.uid)));
    setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
  }), []);
  const sum = (k: string, f: (r: any) => boolean = () => true) => (rows ?? []).filter(f).reduce((a, r) => a + (Number(r[k]) || 0), 0);
  const card = (label: string, v: number) => <div className="rounded-3xl glass p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-extrabold text-grad">₹{v.toLocaleString()}</p></div>;
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-4xl font-extrabold">Earnings</h1>
      <p className="mt-2 text-muted-foreground">Clip Crew keeps a 5% platform fee on every payment. Your share is paid out by the admin.</p>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {card("Total earned (after fee)", sum("creatorNet"))}
        {card("Paid out to you", sum("creatorNet", (r) => r.payoutStatus === "paid"))}
        {card("Waiting for payout", sum("creatorNet", (r) => r.payoutStatus !== "paid"))}
        {card("Platform fees", sum("platformFee"))}
      </div>
      {rows?.length === 0 && <p className="mt-8 text-muted-foreground">No payments yet. They appear here when a customer pays. <Link to="/bookings" className="text-primary font-semibold">View bookings</Link></p>}
      <ul className="mt-8 grid gap-3">
        {(rows ?? []).map((r) => (
          <li key={r.id} className="rounded-2xl glass p-4 flex justify-between gap-3 text-sm">
            <div><p className="font-semibold capitalize">{r.kind} payment · {r.createdAt?.toDate?.().toLocaleDateString() ?? ""}</p><p className="text-muted-foreground">Paid ₹{r.gross} − fee ₹{r.platformFee}</p></div>
            <div className="text-right"><p className="font-bold">₹{r.creatorNet}</p><p className={r.payoutStatus === "paid" ? "text-primary" : "text-muted-foreground"}>{r.payoutStatus === "paid" ? "Paid out" : "Pending payout"}</p></div>
          </li>
        ))}
      </ul>
    </main>
  );
}
