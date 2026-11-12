import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export function useAuthRole() {
  const [s, setS] = useState<{ ready: boolean; user: User | null; role: "creator" | "customer" | null }>({ ready: false, user: null, role: null });
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u) return setS({ ready: true, user: null, role: null });
    let creator = false;
    try { creator = (await getDoc(doc(db, "creators", u.uid))).exists(); } catch { /* treat as customer */ }
    setS({ ready: true, user: u, role: creator ? "creator" : "customer" });
  }), []);
  const home = s.role === "creator" ? "/dashboard" : s.role === "customer" ? "/customer-dashboard" : "/login";
  return { ...s, home };
}
