import { Users, Package } from "lucide-react";

export const NAV_ITEMS = [
  {
    key: "merchants",
    url: "/merchants",
    label: "Merchants",
    icon: Users,
    matchPrefix: "/merchants",
  },
  {
    key: "plans",
    url: "/plans",
    label: "Plans",
    icon: Package,
    matchPrefix: "/plans",
  },
];

export const isItemActive = (item, pathname) => {
  if (!item.matchPrefix) return false;
  return pathname === item.matchPrefix || pathname.startsWith(item.matchPrefix + "/");
};

export const titleFor = (pathname) => {
  const active = NAV_ITEMS.find((it) => isItemActive(it, pathname));
  return active?.label || "";
};
