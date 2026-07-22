import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import OsSidebar from "./os-sidebar";
import TopBar from "./topbar";

// Merchants-app aesthetic: black outer ground, white rounded panel butting up
// against the rail. Rail widths come from SidebarProvider style vars.
// Toggle via the RailToggle in OsSidebar footer, or Cmd/Ctrl+B (handled inside
// SidebarProvider).
export default function MainLayout() {
  return (
    <SidebarProvider
      defaultOpen={false}
      className="bg-[#1E1E1E]"
      style={{
        "--sidebar-width-icon": "72px",
        "--sidebar-width": "210px",
      }}
    >
      <OsSidebar />
      <SidebarInset className="my-2 ml-0 mr-2 h-[calc(100svh-theme(spacing.4))] min-h-0 overflow-hidden rounded-[16px] bg-white ring-1 ring-white/10">
        <TopBar />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
