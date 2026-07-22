import { useContext } from "react";
import { useLocation } from "react-router";
import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthContext } from "@/providers/AuthProvider";

import { titleFor } from "./nav";

export default function TopBar() {
  const { pathname } = useLocation();
  const { handleLogout } = useContext(AuthContext);
  const title = titleFor(pathname);

  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between rounded-t-[16px] border-b border-[#ececec] bg-white px-6">
      <div className="text-sm font-medium text-foreground">{title}</div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f3f3] text-xs font-medium text-foreground hover:bg-[#e8e8e8]">
          SA
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Super Admin</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
