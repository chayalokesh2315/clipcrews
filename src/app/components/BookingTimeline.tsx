import { Check } from "lucide-react";
const STEPS = ["pending", "accepted", "paid", "completed"];
const LABEL: Record<string, string> = { pending: "Requested", accepted: "Accepted", paid: "Advance paid", completed: "Completed" };
export default function BookingTimeline({ status }: { status: string }) {
  const bad = ["rejected", "cancelled", "disputed"].includes(status);
  const at = STEPS.indexOf(status);
  return (
    <div>
      <ol className="flex items-center gap-1 text-xs" aria-label="Booking progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-1 flex-1 last:flex-none">
            <span className={`size-6 shrink-0 grid place-items-center rounded-full text-[11px] ${!bad && i <= at ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{!bad && i < at ? <Check size={13} /> : i + 1}</span>
            <span className={`hidden sm:inline ${!bad && i === at ? "font-semibold" : "text-muted-foreground"}`}>{LABEL[s]}</span>
            {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 rounded ${!bad && i < at ? "bg-primary" : "bg-muted"}`} />}
          </li>
        ))}
      </ol>
      {bad && <p className="mt-2 text-sm font-semibold text-destructive capitalize">{status}</p>}
    </div>
  );
}
