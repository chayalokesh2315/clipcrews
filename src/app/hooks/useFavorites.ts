import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "../../firebase";

export function useFavorites() {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    let unsub = () => {};
    const off = onAuthStateChanged(auth, (u) => {
      unsub();
      setUid(u?.uid ?? null);
      if (!u) return setIds(new Set());
      unsub = onSnapshot(collection(db, "users", u.uid, "favorites"), (s) => setIds(new Set(s.docs.map((d) => d.id))));
    });
    return () => { off(); unsub(); };
  }, []);
  const toggle = async (id: string) => {
    if (!uid) return toast("Log in to save creators");
    const ref = doc(db, "users", uid, "favorites", id);
    if (ids.has(id)) await deleteDoc(ref); else await setDoc(ref, { savedAt: serverTimestamp() });
  };
  return { ids, toggle };
}
