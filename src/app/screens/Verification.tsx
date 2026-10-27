import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { auth, db, storage } from "../../firebase";
import VerifiedBadge from "../components/VerifiedBadge";

const ID_TYPES = ["Aadhaar", "PAN card", "Driving licence", "Passport", "Voter ID"];

export default function Verification() {
  const [uid, setUid] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(true);
  const [v, setV] = useState<any>(null);
  const [verified, setVerified] = useState(false);
  const [f, setF] = useState({ legalName: "", idType: ID_TYPES[0], link: "", note: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setUid(u?.uid ?? null);
    if (!u) return;
    const [c, s] = await Promise.all([getDoc(doc(db, "creators", u.uid)), getDoc(doc(db, "verifications", u.uid))]);
    setHasProfile(c.exists());
    setVerified(!!c.data()?.verified);
    setV(s.exists() ? s.data() : null);
  }), []);

  const submit = async () => {
    if (!uid) return toast("Log in first");
    if (!f.legalName.trim() || !f.link.trim() || !file) return toast("Add your name, a portfolio link and an ID photo.");
    if (file.size > 10 * 1024 * 1024) return toast("ID file must be under 10 MB.");
    setBusy(true);
    try {
      const path = `verification/${uid}/id-${Date.now()}`;
      await uploadBytes(ref(storage, path), file);
      await setDoc(doc(db, "verifications", uid), {
        uid, legalName: f.legalName.trim(), idType: f.idType, link: f.link.trim(), note: f.note.trim().slice(0, 500),
        idPath: path, status: "pending", submittedAt: serverTimestamp(),
      });
      setV({ status: "pending" });
      toast("Submitted. We'll review it shortly.");
    } catch { toast("Could not submit. Please try again."); }
    setBusy(false);
  };

  const input = "w-full rounded-xl border bg-card p-3 outline-none focus:ring-2 ring-ring";
  const status = verified ? "approved" : v?.status;
  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <h1 className="text-4xl font-extrabold flex items-center gap-2"><ShieldCheck className="text-primary" /> Get verified</h1>
      <p className="mt-2 text-muted-foreground">Submit proof that you are a real professional. After an admin approves it, a verified badge appears on your profile and cards.</p>

      {!uid && <p className="mt-6">Please <Link to="/login" className="text-primary font-semibold">log in</Link> as a creator.</p>}
      {uid && !hasProfile && <p className="mt-6">Set up your creator profile first. <Link to="/creator-setup" className="text-primary font-semibold">Create profile</Link></p>}

      {status === "approved" && <p className="mt-6 rounded-2xl glass p-4 font-semibold">You are verified <VerifiedBadge /></p>}
      {status === "pending" && <p className="mt-6 rounded-2xl glass p-4">Your submission is under review. You'll get a notification when it is decided.</p>}
      {status === "rejected" && <p className="mt-6 rounded-2xl border border-destructive p-4 text-destructive">Not approved{v?.reviewNote ? `: ${v.reviewNote}` : "."} You can fix the issue and submit again below.</p>}

      {uid && hasProfile && (status === undefined || status === "rejected") && (
        <div className="mt-6 grid gap-3">
          <input className={input} aria-label="Full legal name" placeholder="Full legal name" value={f.legalName} onChange={(e) => setF({ ...f, legalName: e.target.value })} />
          <select className={input} aria-label="ID type" value={f.idType} onChange={(e) => setF({ ...f, idType: e.target.value })}>{ID_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <label className="rounded-xl border-2 border-dashed p-4 cursor-pointer hover:bg-secondary">
            <span className="font-semibold">{file ? file.name : "Upload a photo or PDF of your ID"}</span>
            <span className="block text-xs text-muted-foreground">Stored privately. Only you and admins can see it. Do not type your ID number anywhere.</span>
            <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <input className={input} aria-label="Portfolio or social link" placeholder="Portfolio, Instagram or website link" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} />
          <textarea className={input} rows={3} aria-label="Notes" placeholder="Anything that proves your work (clients, years of experience)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
          <button disabled={busy} onClick={submit} className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-60">{busy ? "Submitting…" : "Submit for review"}</button>
        </div>
      )}
    </main>
  );
}
