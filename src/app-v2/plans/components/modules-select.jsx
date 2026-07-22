import { useMemo, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useListModulesQuery } from "@/api/services/modules";

const readResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};

// The toufah-core `/api/merchants/modules/` endpoint returns junction rows
// shaped like { id, module, module_name, is_enabled, ... }. Older/simpler
// shapes ({ id, name, code }) are still supported as a fallback so this
// picker keeps working if the endpoint is ever swapped for the raw registry.
const moduleIdOf = (row) => {
  const v = row?.module ?? row?.id;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const moduleLabelOf = (row) =>
  row?.module_name || row?.name || row?.code || `Module ${moduleIdOf(row)}`;

// De-dupe by module ID — the junction endpoint can return the same module
// multiple times when queried across merchants.
const dedupeByModuleId = (rows) => {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const mid = moduleIdOf(r);
    if (mid == null || seen.has(mid)) continue;
    seen.add(mid);
    out.push({ id: mid, label: moduleLabelOf(r) });
  }
  return out;
};

// Multi-select opens in a shadcn Dialog with a search box + toggleable rows.
// Selected modules render as removable chips in the trigger row.
export default function ModulesSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Server-side search — mirrors planorama-admin's SelectCustomer pattern.
  const { data, isLoading, isFetching } = useListModulesQuery(
    { search: debouncedSearch || undefined },
    { skip: !open && !value?.length },
  );
  const options = useMemo(() => dedupeByModuleId(readResults(data)), [data]);

  const labelById = useMemo(() => {
    const map = new Map();
    for (const o of options) map.set(o.id, o.label);
    return map;
  }, [options]);

  const selectedIds = useMemo(
    () => new Set((value || []).map(Number).filter((n) => Number.isFinite(n))),
    [value],
  );

  const toggle = (moduleId) => {
    const next = new Set(selectedIds);
    if (next.has(moduleId)) next.delete(moduleId);
    else next.add(moduleId);
    onChange(Array.from(next));
  };

  const remove = (moduleId) => {
    onChange((value || []).filter((n) => Number(n) !== Number(moduleId)));
  };

  const selectedRows = (value || []).map((id) => ({
    id: Number(id),
    label: labelById.get(Number(id)) || `Module ${id}`,
  }));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {selectedRows.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            No modules selected.
          </span>
        ) : (
          selectedRows.map((row) => (
            <Badge
              key={row.id}
              variant="secondary"
              className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs"
            >
              {row.label}
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="rounded-full p-0.5 hover:bg-background/40"
                aria-label={`Remove ${row.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-1.5 h-3.5 w-3.5" />
        {selectedRows.length ? "Edit modules" : "Select modules"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select modules</DialogTitle>
            <DialogDescription>
              Choose the platform modules this plan grants. Search is powered by{" "}
              <code className="font-mono">/api/merchants/modules/?search=</code>.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search modules…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            {isFetching ? (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>

          <div className="-mx-2 max-h-[360px] overflow-y-auto">
            {isLoading && options.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading modules…
              </div>
            ) : options.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No modules match &ldquo;{debouncedSearch}&rdquo;.
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = selectedIds.has(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => toggle(opt.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-muted focus:bg-muted focus:outline-none",
                      isSelected && "bg-muted",
                    )}
                  >
                    <span className="truncate text-foreground">{opt.label}</span>
                    {isSelected ? (
                      <Check className="h-4 w-4 text-foreground" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          <DialogFooter className="justify-between sm:justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button type="button" onClick={() => setOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
