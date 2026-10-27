import { useEffect, useState } from "react";
import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "../../firebase";
import { notify } from "../lib/notify";

export default function AdminEarnings() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => getDocs(collection(db, "transactions")).then((s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })))).catch(() => toast("Could not load earnings."));
  useEffect(() => { load(); }, []);
  const sum = (list: any[], k: string) => list.reduce((a, r) => a + (Number(r[k]) || 0), 0);

  const months = new Map<string, number>();
  rows.forEach((r) => { const d = r.createdAt?.toDate?.(); if (d) { const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; months.set(k, (months.get(k) ?? 0) + (Number(r.platformFee) || 0)); } });

  const owed = new Map<string, { name: string; amount: number; ids: string[] }>();
  rows.filter((r) => r.payoutStatus !== "paid").forEach((r) => {
    const e = owed.get(r.creatorId) ?? { name: r.creatorName, amount: 0, ids: [] };
    e.amount += Number(r.creatorNet) || 0; e.ids.push(r.id); owed.set(r.creatorId, e);
  });

  const payout = async (creatorId: string, e: { name: string; amount: number; ids: string[] }) => {
    const ref = window.prompt(`Enter the transfer reference (UTR) for paying ₹${e.amount} to ${e.name}:`)?.trim();
    if (!ref) return;
    try {
      const b = writeBatch(db);
      e.ids.forEach((id) => b.update(doc(db, "transactions", id), { payoutStatus: "paid", payoutRef: ref, paidOutAt: serverTimestamp() }));
      await b.commit();
      await notify(creatorId, "Payout sent", `₹${e.amount} was paid out. Ref: ${ref}`, "/earnings");
      toast("Marked as paid"); load();
    } catch { toast("Could not save the payout."); }
  };

  const card = (label: string, v: number) => <div className="rounded-3xl glass p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-extrabold text-grad">₹{v.toLocaleString()}</p></div>;
  return (
    <section className="mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {card("Total collected", sum(rows, "gross"))}
        {card("Your commission (5%)", sum(rows, "platformFee"))}
        {card("Owed to creators", [...owed.values()].reduce((a, e) => a + e.amount, 0))}
        {card("Paid to creators", sum(rows.filter((r) => r.payoutStatus === "paid"), "creatorNet"))}
      </div>
      <h2 className="mt-8 text-xl font-bold">Creator payouts due</h2>
      {owed.size === 0 && <p className="mt-2 text-muted-foreground">Nothing to pay out.</p>}
      <ul className="mt-3 grid gap-3">
        {[...owed.entries()].map(([id, e]) => (
          <li key={id} className="rounded-2xl glass p-4 flex items-center justify-between gap-3">
            <div><p className="font-semibold">{e.name}</p><p className="text-sm text-muted-foreground">{e.ids.length} payment(s)</p></div>
            <div className="flex items-center gap-3"><span className="font-bold">₹{e.amount}</span><button onClick={() => payout(id, e)} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Mark paid</button></div>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-xl font-bold">Commission by month</h2>
      <ul className="mt-3 grid gap-2 text-sm">
        {[...months.entries()].sort().reverse().map(([m, v]) => <li key={m} className="flex justify-between rounded-xl glass px-4 py-2"><span>{m}</span><span className="font-semibold">₹{v}</span></li>)}
        {months.size === 0 && <li className="text-muted-foreground">No payments yet.</li>}
      </ul>
    </section>
  );
}
