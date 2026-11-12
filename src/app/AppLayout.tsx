import { Outlet } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import CommandMenu from "./components/CommandMenu";
import { Toaster } from "./components/ui/sonner";

export default function AppLayout() {
  return (
    <>
      <Outlet />
      <CommandMenu />
      <BottomNav />
      <Toaster richColors position="top-center" />
    </>
  );
}
