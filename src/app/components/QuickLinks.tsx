import { Link } from "react-router-dom";
const SETS = {
  creator: [["Bookings", "/bookings"], ["Earnings", "/earnings"], ["Availability", "/availability"], ["Packages", "/packages"], ["Get verified", "/verification"], ["Portfolio", "/portfolio-upload"]],
  customer: [["Bookings", "/bookings"], ["Saved", "/favorites"], ["Smart match", "/match"], ["Browse", "/categories"]],
} as const;
export default function QuickLinks({ role }: { role: keyof typeof SETS }) {
  return (
    <nav aria-label="Quick links" className="flex gap-2 overflow-x-auto px-4 py-3 border-b bg-background/80 backdrop-blur">
      {SETS[role].map(([l, t]) => <Link key={t} to={t} className="whitespace-nowrap px-4 py-1.5 rounded-full border bg-card text-sm font-medium hover:bg-secondary">{l}</Link>)}
    </nav>
  );
}
