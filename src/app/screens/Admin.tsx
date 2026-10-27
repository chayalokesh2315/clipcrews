import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { toast } from "sonner";
import { auth, db, storage } from "../../firebase";
import { notify } from "../lib/notify";
import AdminBands from "../components/AdminBands";
import AdminEarnings from "../components/AdminEarnings";

const TABS = ["pending", "approved", "rejected"] as const;

export default function Admin() {
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [rows, setRows] = useState<any[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [adminId, setAdminId] = useState("");
  const [section, setSection] = useState<"verify" | "pricing" | "earnings">("verify");

  const load = async () => {
    const s = await getDocs(collection(db, "verifications"));
    setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.submittedAt?.seconds ?? 0) - (a.submittedAt?.seconds ?? 0)));
  };
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u) return setState("denied");
    const a = await getDoc(doc(db, "admins", u.uid));
    if (!a.exists()) return setState("denied");
    setAdminId(u.uid);
    setState("ok");
    load().catch(() => toast("Could not load submissions."));
  }), []);

  const decide = async (r: any, approve: boolean) => {
    let reviewNote = "";
    if (!approve) {
      reviewNote = (window.prompt("Reason for rejecting (shown to the creator):") ?? "").trim();
      if (!reviewNote) return;
    }
    try {
      const b = writeBatch(db);
      b.update(doc(db, "verifications", r.id), { status: approve ? "approved" : "rejected", reviewNote, reviewedAt: serverTimestamp(), reviewedBy: adminId });
      b.update(doc(db, "creators", r.id), { verified: approve });
      await b.commit();
      await notify(r.id, approve ? "You're verified" : "Verification not approved", approve ? "Your verified badge is now live." : reviewNote, "/verification");
      toast(approve ? "Approved" : "Rejected");
      load();
    } catch { toast("Could not save the decision."); }
  };
  const openId = async (path: string) => {
    try { window.open(await getDownloadURL(ref(storage, path)), "_blank", "noopener"); } catch { toast("Could not open the document."); }
  };

  if (state === "loading") return <p className="p-10">Loading…</p>;
  if (state === "denied") return <main className="p-10 max-w-md mx-auto"><h1 className="text-3xl font-extrabold">Admins only</h1><p className="mt-2 text-muted-foreground">This area is restricted. <Link to="/" className="text-primary font-semibold">Back home</Link></p></main>;

  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const list = rows.filter((r) => r.status === tab);
  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-4xl font-extrabold">Admin</h1>
      <div className="mt-4 flex gap-2" role="tablist" aria-label="Admin sections">
        {([["verify", "Verification"], ["pricing", "Rate ranges"], ["earnings", "Earnings"]] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={section === k} onClick={() => setSection(k)} className={`px-4 py-2 rounded-full text-sm font-semibold ${section === k ? "bg-primary text-primary-foreground" : "border bg-card"}`}>{l}</button>)}
      </div>
      {section === "pricing" && <AdminBands />}
      {section === "earnings" && <AdminEarnings />}
      {section === "verify" && (<>
      <div className="mt-6 flex gap-2" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${tab === t ? "bg-primary text-primary-foreground" : "border bg-card"}`}>{t} ({count(t)})</button>)}
      </div>
      {list.length === 0 && <p className="mt-8 text-muted-foreground">Nothing here.</p>}
      <ul className="mt-6 grid gap-4">
        {list.map((r) => (
          <li key={r.id} className="rounded-3xl glass p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <div><h2 className="text-lg font-bold">{r.legalName}</h2><p className="text-sm text-muted-foreground">{r.idType} · submitted {r.submittedAt?.toDate?.().toLocaleDateString() ?? ""}</p></div>
              <Link to={`/creator/${r.id}`} className="text-sm text-primary font-semibold">View profile</Link>
            </div>
            <p className="mt-3 text-sm break-all">Link: <a className="text-primary underline" href={/^https?:\/\//.test(r.link) ? r.link : `https://${r.link}`} target="_blank" rel="noopener noreferrer">{r.link}</a></p>
            {r.note && <p className="mt-1 text-sm">Note: {r.note}</p>}
            {r.reviewNote && <p className="mt-1 text-sm text-muted-foreground">Review note: {r.reviewNote}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => openId(r.idPath)} className="px-4 py-2 rounded-full border text-sm font-semibold">View ID document</button>
              {r.status !== "approved" && <button onClick={() => decide(r, true)} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Approve</button>}
              {r.status !== "rejected" && <button onClick={() => decide(r, false)} className="px-4 py-2 rounded-full border text-sm font-semibold text-destructive">{r.status === "approved" ? "Revoke" : "Reject"}</button>}
            </div>
          </li>
        ))}
      </ul>
      </>)}
    </main>
  );
}
