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

// ---------- Razorpay payments with 5% platform commission ----------
const crypto = require("crypto");
const logger = require("firebase-functions/logger");
const RZ_ID = defineSecret("RAZORPAY_KEY_ID");
const RZ_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const ADVANCE = 0.3;     // keep identical to src/app/lib/fees.ts
const COMMISSION = 0.05; // platform keeps 5% of what the creator earns

const split = (total) => {
  const advance = Math.round(total * ADVANCE);
  const fee = Math.round(total * COMMISSION);
  const advanceFee = Math.round(advance * COMMISSION);
  return { advance, balance: total - advance, fee, advanceFee, balanceFee: fee - advanceFee };
};
const kindOf = (d) => (d?.kind === "balance" ? "balance" : "advance");

exports.createOrder = onCall({ region: "asia-south1", secrets: [RZ_ID, RZ_SECRET] }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Log in first");
  const kind = kindOf(req.data);
  const ref = admin.firestore().doc(`bookings/${req.data?.bookingId}`);
  const b = (await ref.get()).data();
  if (!b || b.customerId !== req.auth.uid) throw new HttpsError("permission-denied", "Not your booking");
  if (kind === "advance" && b.status !== "accepted") throw new HttpsError("failed-precondition", "Booking is not awaiting payment");
  if (kind === "balance" && !(b.status === "completed" && !b.balancePaid)) throw new HttpsError("failed-precondition", "Nothing left to pay");
  const total = Number(b.totalAmount);
  const s = split(total);
  const rupees = kind === "advance" ? s.advance : s.balance;
  if (!(rupees >= 1)) throw new HttpsError("failed-precondition", "Invalid amount");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Basic " + Buffer.from(`${RZ_ID.value()}:${RZ_SECRET.value()}`).toString("base64") },
    body: JSON.stringify({ amount: rupees * 100, currency: "INR", receipt: `${String(req.data.bookingId).slice(0, 30)}-${kind[0]}` }),
  });
  if (!res.ok) {
    logger.error("Razorpay order failed", res.status, await res.text());
    throw new HttpsError("internal", res.status === 401 ? "Payment keys are wrong or missing. Check the Razorpay secrets." : "Payment provider error");
  }
  const order = await res.json();
  await ref.update(kind === "advance"
    ? { orderId: order.id, commissionRate: COMMISSION, platformFee: s.fee, creatorNet: total - s.fee }
    : { balanceOrderId: order.id });
  return { orderId: order.id, amount: rupees * 100 };
});

exports.verifyPayment = onCall({ region: "asia-south1", secrets: [RZ_SECRET] }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Log in first");
  const kind = kindOf(req.data);
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.data ?? {};
  const db = admin.firestore();
  const ref = db.doc(`bookings/${bookingId}`);
  const b = (await ref.get()).data();
  const orderField = kind === "advance" ? "orderId" : "balanceOrderId";
  const doneField = kind === "advance" ? "paymentId" : "balancePaymentId";
  if (!b || b.customerId !== req.auth.uid || b[orderField] !== razorpay_order_id) throw new HttpsError("permission-denied", "Mismatch");
  if (b[doneField]) return { ok: true }; // already verified, do nothing twice
  const expected = crypto.createHmac("sha256", RZ_SECRET.value()).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) throw new HttpsError("permission-denied", "Bad signature");

  const s = split(Number(b.totalAmount));
  const gross = kind === "advance" ? s.advance : s.balance;
  const fee = kind === "advance" ? s.advanceFee : s.balanceFee;
  const ts = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.update(ref, kind === "advance"
    ? { status: "paid", paymentId: razorpay_payment_id, paidAt: ts }
    : { balancePaid: true, balancePaymentId: razorpay_payment_id, balancePaidAt: ts });
  // ledger entry: one per payment, keyed by Razorpay payment id so it can never be written twice
  batch.set(db.doc(`transactions/${razorpay_payment_id}`), {
    bookingId, kind, creatorId: b.creatorId, creatorName: b.creatorName, customerId: b.customerId,
    gross, platformFee: fee, creatorNet: gross - fee, commissionRate: COMMISSION, payoutStatus: "pending", createdAt: ts,
  });
  batch.set(db.collection("notifications").doc(), {
    userId: b.creatorId, title: kind === "advance" ? "Advance received" : "Balance received",
    body: `${b.customerName} paid ₹${gross}. You earn ₹${gross - fee} after the platform fee.`, link: "/earnings", read: false, createdAt: ts,
  });
  await batch.commit();
  return { ok: true };
});
