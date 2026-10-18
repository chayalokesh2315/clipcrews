const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
admin.initializeApp();
const KEY = defineSecret("ANTHROPIC_API_KEY");

exports.aiMatch = onCall({ region: "asia-south1", secrets: [KEY], timeoutSeconds: 30, maxInstances: 5 }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Log in first");
  const request = String(req.data?.request ?? "").slice(0, 500);
  if (!request.trim()) throw new HttpsError("invalid-argument", "Describe what you need");

  const snap = await admin.firestore().collection("creators").limit(80).get();
  const creators = snap.docs.map((d) => {
    const c = d.data();
    return { id: d.id, name: c.name, category: c.category, sub: c.subCategory, city: c.location, price: c.price, rating: c.totalReviews ? c.rating : null, reviews: c.totalReviews, years: c.experience, about: String(c.about ?? "").slice(0, 160) };
  });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY.value(), "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: "You match customers to creative professionals. Use only the creators provided. Prefer a matching category, city, budget fit and good reviews. Reply with JSON only: {\"matches\":[{\"id\":\"...\",\"reason\":\"one short sentence\"}]} with at most 5 items, best first.",
      messages: [{ role: "user", content: `Customer request: ${request}\n\nCreators:\n${JSON.stringify(creators)}` }],
    }),
  });
  if (!res.ok) throw new HttpsError("internal", "AI service unavailable");
  const text = (await res.json()).content?.[0]?.text ?? "{}";
  try {
    const ids = new Set(creators.map((c) => c.id));
    const matches = (JSON.parse(text.replace(/```json|```/g, "").trim()).matches ?? []).filter((m) => ids.has(m.id)).slice(0, 5);
    return { matches };
  } catch {
    return { matches: [] };
  }
});

// ---------- Razorpay payments ----------
const crypto = require("crypto");
const RZ_ID = defineSecret("RAZORPAY_KEY_ID");
const RZ_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const ADVANCE = 0.3;

exports.createOrder = onCall({ region: "asia-south1", secrets: [RZ_ID, RZ_SECRET] }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Log in first");
  const ref = admin.firestore().doc(`bookings/${req.data?.bookingId}`);
  const b = (await ref.get()).data();
  if (!b || b.customerId !== req.auth.uid) throw new HttpsError("permission-denied", "Not your booking");
  if (b.status !== "accepted") throw new HttpsError("failed-precondition", "Booking is not awaiting payment");
  const amount = Math.round(Number(b.totalAmount) * ADVANCE * 100); // paise, computed on the server
  if (!(amount >= 100)) throw new HttpsError("failed-precondition", "Invalid amount");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Basic " + Buffer.from(`${RZ_ID.value()}:${RZ_SECRET.value()}`).toString("base64") },
    body: JSON.stringify({ amount, currency: "INR", receipt: String(req.data.bookingId).slice(0, 40) }),
  });
  if (!res.ok) throw new HttpsError("internal", "Payment provider error");
  const order = await res.json();
  await ref.update({ orderId: order.id });
  return { orderId: order.id, amount };
});

exports.verifyPayment = onCall({ region: "asia-south1", secrets: [RZ_SECRET] }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Log in first");
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.data ?? {};
  const ref = admin.firestore().doc(`bookings/${bookingId}`);
  const b = (await ref.get()).data();
  if (!b || b.customerId !== req.auth.uid || b.orderId !== razorpay_order_id) throw new HttpsError("permission-denied", "Mismatch");
  const expected = crypto.createHmac("sha256", RZ_SECRET.value()).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) throw new HttpsError("permission-denied", "Bad signature");
  await ref.update({ status: "paid", paymentId: razorpay_payment_id, paidAt: admin.firestore.FieldValue.serverTimestamp() });
  await admin.firestore().collection("notifications").add({ userId: b.creatorId, title: "Advance received", body: `${b.customerName} paid the advance.`, link: "/bookings", read: false, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true };
});
