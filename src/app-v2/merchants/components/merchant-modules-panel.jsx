import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToggleModuleMutation } from "@/api/services/merchants";
import { cn } from "@/lib/utils";

import ModuleConfigDialog from "./module-config-dialog";
import { specFor, summariseConfig } from "../module-config-spec";

const groupOf = (code) => {
  if (!code) return "other";
  const [first] = code.split(".");
  return first || code;
};

const groupTitle = (key) => key.replace(/_/g, " ").toUpperCase();

const compareMerchantModules = (a, b) => {
  const ga = groupOf(a.module_code);
  const gb = groupOf(b.module_code);
  if (ga !== gb) return ga.localeCompare(gb);
  if (a.is_core !== b.is_core) return a.is_core ? -1 : 1;
  return (a.module_code || "").localeCompare(b.module_code || "");
};

// A module with per-merchant settings (module-config-spec.js) gets a gear that
// opens ModuleConfigDialog, plus a badge naming the non-default setup so you can
// tell at a glance which merchants have been moved off the standard build. The
// gear is hidden while the module is off — configuring a shell nobody can open
// only invites confusion about why nothing changed.
function ModuleTile({ mod, busy, onToggle, merchantId }) {
  const [configOpen, setConfigOpen] = useState(false);
  const configurable = Boolean(specFor(mod.module_code));
  const summary = summariseConfig(mod.module_code, mod.config);

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-colors",
        !mod.is_enabled && "bg-muted/30",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {mod.module_name}
          </span>
          {mod.is_core ? (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              core
            </Badge>
          ) : null}
          {summary ? (
            <Badge className="shrink-0 text-[10px] font-normal">{summary}</Badge>
          ) : null}
        </div>
        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
          {mod.module_code}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : null}
        {configurable && mod.is_enabled ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title={`${mod.module_name} settings`}
              aria-label={`${mod.module_name} settings`}
              onClick={() => setConfigOpen(true)}
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
            <ModuleConfigDialog
              open={configOpen}
              onOpenChange={setConfigOpen}
              merchantId={merchantId}
              mod={mod}
            />
          </>
        ) : null}
        <Switch
          checked={Boolean(mod.is_enabled)}
          disabled={busy}
          onCheckedChange={(next) => onToggle(mod.module_id, next)}
          className="ml-1"
        />
      </div>
    </div>
  );
}

export default function MerchantModulesPanel({ merchantId, merchantModules }) {
  const [search, setSearch] = useState("");
  const [toggleModule, { isLoading: toggling, originalArgs }] =
    useToggleModuleMutation();

  const rows = useMemo(() => {
    const list = Array.isArray(merchantModules) ? [...merchantModules] : [];
    list.sort(compareMerchantModules);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        (m.module_name || "").toLowerCase().includes(q) ||
        (m.module_code || "").toLowerCase().includes(q),
    );
  }, [merchantModules, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const m of rows) {
      const g = groupOf(m.module_code);
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(m);
    }
    return Array.from(map.entries());
  }, [rows]);

  const onToggle = async (moduleId, nextEnabled) => {
    try {
      await toggleModule({ id: merchantId, module_id: moduleId }).unwrap();
      toast.success(nextEnabled ? "Module enabled" : "Module disabled");
    } catch (err) {
      toast.error(err?.data?.detail || "Toggle failed");
    }
  };

  const total = (merchantModules || []).length;
  const totalEnabled = (merchantModules || []).filter((m) => m.is_enabled).length;

  return (
    <section>
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Modules</h2>
          <p className="text-xs text-muted-foreground">
            {totalEnabled} of {total} enabled — toggle to update this merchant, or
            open the gear where a module has settings.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 pl-8"
          />
        </div>
      </header>

      {total === 0 ? (
        <div className="rounded-md border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          No modules on this merchant.
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          No modules match &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([group, items]) => (
            <div key={group}>
              <h3 className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {groupTitle(group)}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((mod) => (
                  <ModuleTile
                    key={mod.module_id}
                    mod={mod}
                    merchantId={merchantId}
                    busy={toggling && originalArgs?.module_id === mod.module_id}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
