import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

export const notify = (userId: string, title: string, body: string, link = "/bookings") =>
  addDoc(collection(db, "notifications"), { userId, title, body, link, read: false, createdAt: serverTimestamp() }).catch(() => {});

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
