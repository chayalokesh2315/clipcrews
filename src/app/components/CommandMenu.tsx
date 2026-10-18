import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const go = (to: string) => { setOpen(false); navigate(to); };
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and crafts…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Crafts">
          {["Photography", "Videography", "Design", "Makeup"].map((c) => <CommandItem key={c} onSelect={() => go(`/categories?category=${c}`)}>{c}</CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Go to">
          {[["Home", "/"], ["Smart match", "/match"], ["Saved creators", "/favorites"], ["My bookings", "/bookings"], ["Availability", "/availability"], ["Packages", "/packages"], ["About", "/about"], ["Contact", "/contact"]].map(([l, t]) => <CommandItem key={t} onSelect={() => go(t)}>{l}</CommandItem>)}
          <CommandItem onSelect={() => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); setOpen(false); }}>Toggle dark mode</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
