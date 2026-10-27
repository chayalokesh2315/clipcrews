import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDocs, query, updateDoc, where, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "../../firebase";
import BookingTimeline from "../components/BookingTimeline";
import NotificationBell from "../components/NotificationBell";
import { notify } from "../lib/notify";
import { payBooking } from "../lib/pay";
import { split, COMMISSION } from "../lib/fees";

export default function Bookings() {
  const navigate = useNavigate();
  const [uid, setUid] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState("");
  const load = async (u: string) => {
    const [a, b] = await Promise.all([
      getDocs(query(collection(db, "bookings"), where("customerId", "==", u))),
      getDocs(query(collection(db, "bookings"), where("creatorId", "==", u))),
    ]);
    const m = new Map<string, any>();
    [...a.docs, ...b.docs].forEach((d) => m.set(d.id, { id: d.id, ...d.data() }));
    setRows([...m.values()].sort((x, y) => (y.createdAt?.seconds ?? 0) - (x.createdAt?.seconds ?? 0)));
  };
  useEffect(() => onAuthStateChanged(auth, (u) => { setUid(u?.uid ?? null); if (u) load(u.uid); else navigate("/login"); }), []);

  const set = async (b: any, status: string, extra: object = {}, tell?: [string, string, string]) => {
    setBusy(b.id);
    try {
      await updateDoc(doc(db, "bookings", b.id), { status, ...extra });
      if (tell) await notify(tell[0], tell[1], tell[2]);
      await load(uid!);
    } catch { toast("Could not update the booking."); }
    setBusy("");
  };
  const dispute = (b: any) => {
    const reason = window.prompt("What went wrong? Describe the issue briefly.");
    if (reason?.trim()) set(b, "disputed", { dispute: { reason: reason.trim().slice(0, 500), at: new Date().toISOString() } }, [b.creatorId, "Booking disputed", `${b.customerName} reported an issue.`]);
  };
  const btn = "px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-60";

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between"><h1 className="text-4xl font-extrabold">Bookings</h1><NotificationBell /></div>
      <Link to="/availability" className="text-sm text-primary font-semibold">Creator? Set your availability</Link> · <Link to="/packages" className="text-sm text-primary font-semibold">Edit packages</Link> · <Link to="/verification" className="text-sm text-primary font-semibold">Get verified</Link>
      {rows.length === 0 && <p className="mt-8 text-muted-foreground">No bookings yet. <Link to="/categories" className="text-primary font-semibold">Find a creator</Link></p>}
      <ul className="mt-6 grid gap-4">
        {rows.map((b) => {
          const mine = b.creatorId === uid;
          const sp = split(Number(b.totalAmount) || 0);
          const advance = sp.advance;
          return (
            <li key={b.id} className="rounded-3xl glass p-5">
              <div className="flex justify-between gap-3">
                <div><h2 className="text-lg font-bold">{mine ? b.customerName : b.creatorName}</h2><p className="text-sm text-muted-foreground">{b.serviceType} · {b.date} · {b.startTime}–{b.endTime}</p></div>
                <p className="font-bold">₹{b.totalAmount}</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{mine ? `You receive ₹${sp.net} after the ${COMMISSION * 100}% platform fee (₹${sp.fee}).` : `Advance ₹${sp.advance} now, balance ₹${sp.balance} after delivery.`}</p>
              <div className="mt-4"><BookingTimeline status={b.status} /></div>
              {b.balancePaid && <p className="mt-2 text-sm font-semibold text-primary">Fully paid</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {mine && b.status === "pending" && <><button disabled={busy === b.id} className={`${btn} bg-primary text-primary-foreground`} onClick={() => set(b, "accepted", {}, [b.customerId, "Booking accepted", `${b.creatorName} accepted. Pay the advance to confirm.`])}>Accept</button><button disabled={busy === b.id} className={`${btn} border`} onClick={() => set(b, "rejected", {}, [b.customerId, "Booking declined", `${b.creatorName} can't take this one.`])}>Decline</button></>}
                {!mine && b.status === "accepted" && <button disabled={busy === b.id} className={`${btn} bg-primary text-primary-foreground`} onClick={async () => { setBusy(b.id); if (await payBooking(b.id, "advance", auth.currentUser?.email ?? undefined)) await load(uid!); setBusy(""); }}>Pay advance ₹{advance}</button>}
                {!mine && b.status === "completed" && !b.balancePaid && <button disabled={busy === b.id} className={`${btn} bg-primary text-primary-foreground`} onClick={async () => { setBusy(b.id); if (await payBooking(b.id, "balance", auth.currentUser?.email ?? undefined)) await load(uid!); setBusy(""); }}>Pay balance ₹{sp.balance}</button>}
                {mine && b.status === "paid" && <button disabled={busy === b.id} className={`${btn} bg-primary text-primary-foreground`} onClick={() => set(b, "completed", {}, [b.customerId, "Work delivered", `${b.creatorName} marked the job complete. Please leave a review.`])}>Mark completed</button>}
                {!mine && b.status === "completed" && <Link to={`/review/${b.creatorId}`} className={`${btn} bg-primary text-primary-foreground`}>Leave a review</Link>}
                {!mine && ["paid", "completed"].includes(b.status) && <button className={`${btn} border`} onClick={() => dispute(b)}>Report an issue</button>}
                {!mine && ["pending", "accepted"].includes(b.status) && <button disabled={busy === b.id} className={`${btn} border`} onClick={() => set(b, "cancelled")}>Cancel</button>}
                <button className={`${btn} border`} onClick={() => navigate(mine ? "/creator-messages" : `/chat/${b.creatorId}`)}>Message</button>
              </div>
              {b.dispute && <p className="mt-3 text-sm text-destructive">Issue reported: {b.dispute.reason}</p>}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
