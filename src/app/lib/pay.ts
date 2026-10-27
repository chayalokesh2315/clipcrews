import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "sonner";
import app from "../../firebase";

const fn = getFunctions(app, "asia-south1");
const KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

function loadCheckout() {
  return new Promise<boolean>((ok) => {
    if ((window as any).Razorpay) return ok(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => ok(true);
    s.onerror = () => ok(false);
    document.body.appendChild(s);
  });
}

// Pays the advance (30%) for a booking. Amount is computed on the server from the booking, never from the browser.
export async function payBooking(bookingId: string, kind: "advance" | "balance", email?: string): Promise<boolean> {
  if (!KEY) { toast("Payments are not set up yet. Add VITE_RAZORPAY_KEY_ID."); return false; }
  if (!(await loadCheckout())) { toast("Could not load the payment window."); return false; }
  try {
    const { data }: any = await httpsCallable(fn, "createOrder")({ bookingId });
    return await new Promise<boolean>((done) => {
      const rz = new (window as any).Razorpay({
        key: KEY, order_id: data.orderId, amount: data.amount, currency: "INR", name: "Clip Crew", description: kind === "advance" ? "Advance payment" : "Balance payment", prefill: { email },
        theme: { color: "#7c3aed" },
        handler: async (r: any) => {
          try { await httpsCallable(fn, "verifyPayment")({ bookingId, ...r }); toast("Payment received"); done(true); }
          catch { toast("Payment could not be verified. Contact support if you were charged."); done(false); }
        },
        modal: { ondismiss: () => done(false) },
      });
      rz.on("payment.failed", (r: any) => toast(r?.error?.description ?? "Payment failed. You can try again."));
      rz.open();
    });
  } catch (err: any) { toast(err?.message && err.message !== "internal" ? err.message : "Could not start payment. Please try again."); return false; }
}

export const payAdvance = (id: string, email?: string) => payBooking(id, "advance", email);
