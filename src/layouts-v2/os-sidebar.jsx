import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { NAV_ITEMS, isItemActive } from "./nav";

// Idle text is #a1a1a1; active pill fills #353535 and lifts to #fafafa.
// Collapsed variant (data-collapsible=icon) shrinks the pill to a 44x44 square.
function NavItem({ item, active }) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        asChild
        tooltip={item.label}
        className={cn(
          "!h-auto !gap-3 !rounded-[6.4px] !px-4 !py-3 text-[14px] font-normal text-[#a1a1a1] transition-colors",
          "hover:!bg-[#353535]/60 hover:!text-[#fafafa]",
          "data-[active=true]:!bg-[#353535] data-[active=true]:!font-normal data-[active=true]:!text-[#fafafa]",
          "[&>svg]:!size-[20px] [&>svg]:shrink-0",
          "group-data-[collapsible=icon]:!size-11 group-data-[collapsible=icon]:!p-3",
        )}
      >
        <Link to={item.url}>
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// Bottom-of-rail toggle — mirrors merchants-app OsSidebar. Points left when
// open (close me), rotates 180 degrees when collapsed (open me).
function RailToggle() {
  const { state, toggleSidebar } = useSidebar();
  const open = state === "expanded";
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      title={open ? "Collapse sidebar" : "Expand sidebar"}
      className="flex w-full items-center justify-center border-t border-[#a1a1a1] py-5 text-[#a1a1a1] transition-colors hover:text-[#fafafa]"
    >
      <ArrowLeft
        className={cn("h-5 w-5 transition-transform", !open && "rotate-180")}
      />
    </button>
  );
}

export default function OsSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      className="!border-r-0 [&>[data-sidebar=sidebar]]:bg-[#1e1e1e]"
    >
      <SidebarHeader className="px-4 pb-6 pt-5">
        <Link
          to="/"
          title="Anuma · Super Admin"
          className="flex items-center gap-2 self-start rounded-[12px] px-3 py-2 group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:self-center group-data-[collapsible=icon]:p-0"
        >
          <span
            className="text-[22px] leading-none text-[#fcfcfc] group-data-[collapsible=icon]:hidden"
            style={{
              fontFamily:
                '"Fraunces", "IBM Plex Serif", ui-serif, Georgia, serif',
            }}
          >
            anuma
          </span>
          <span className="rounded-full border border-white/25 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/70 group-data-[collapsible=icon]:hidden">
            super admin
          </span>
          <span
            className="hidden group-data-[collapsible=icon]:inline text-[18px] leading-none text-[#fcfcfc]"
            style={{
              fontFamily:
                '"Fraunces", "IBM Plex Serif", ui-serif, Georgia, serif',
            }}
          >
            a
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-4 py-0">
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.key}
                  item={item}
                  active={isItemActive(item, pathname)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 px-4 pb-3 pt-0">
        <RailToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
