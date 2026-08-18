import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { merchantsApi } from "@/api/services/merchants";
import { useListModulesQuery, usePatchModuleMutation } from "@/api/services/modules";

import { pruneConfig, specFor } from "../module-config-spec";

// Per-merchant module settings — the write half of `MerchantModule.config`.
//
// This is how a single merchant is put on a different layout: saving
// `{"layout": "distributor_desk"}` on their inbox module switches that
// merchant's /inbox shell and nobody else's (the merchants-app reads the same
// field back through `Merchant.get_modules_summary()`).
//
// Two requests, no new backend:
//   1. GET  /api/merchants/modules/?merchant=<id>&module=<module_id>
//      The merchant detail payload carries `module_id`, not the MerchantModule
//      row's own pk, so the row has to be looked up before it can be addressed.
//   2. PATCH /api/merchants/modules/<row_id>/  { config }
//      MerchantModuleUpdateSerializer takes `config`; the ViewSet is
//      platform-only and sets `modified_by`, which is what the model's
//      platform-actor check requires.
//
// The fields come from module-config-spec.js, not from the module's
// `config_schema` — nothing populates that column today. When it is populated,
// build the fields from it and delete the spec file.

const readResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};

// DRF error bodies vary by failure: {detail}, {config: [...]}, {field: [...]}.
const errorText = (err, fallback) => {
  const data = err?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const first = Object.values(data)[0];
  if (Array.isArray(first) && first.length) return String(first[0]);
  return fallback;
};

function FieldShell({ label, hint, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium">
        {label}
      </Label>
      {children}
      {hint ? (
        <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function EnumField({ field, value, onChange }) {
  const current = value ?? field.default ?? "";
  const selected = field.options.find((o) => o.value === current);
  return (
    <FieldShell label={field.label} hint={selected?.hint}>
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
              {o.value === field.default ? " (default)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

function NumberField({ field, value, onChange }) {
  return (
    <FieldShell label={field.label} hint={field.hint} htmlFor={`cfg-${field.key}`}>
      <Input
        id={`cfg-${field.key}`}
        type="number"
        min="0"
        step="1"
        placeholder={field.placeholder}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          // "" clears the setting entirely rather than storing 0 — pruneConfig
          // drops it, and the app treats absent as "no target".
          onChange(raw === "" ? "" : Number(raw));
        }}
      />
    </FieldShell>
  );
}

function BooleanField({ field, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Label className="text-xs font-medium">{field.label}</Label>
        {field.hint ? (
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            {field.hint}
          </p>
        ) : null}
      </div>
      <Switch
        checked={Boolean(value)}
        onCheckedChange={onChange}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}

function BooleanGroupField({ field, value, onChange }) {
  const group = value ?? {};
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium">{field.label}</Label>
      <div className="rounded-md border border-border">
        {(field.children ?? []).map((child, i) => (
          <div
            key={child.key}
            className={
              "flex items-center justify-between gap-3 px-3 py-2" +
              (i === field.children.length - 1 ? "" : " border-b border-border")
            }
          >
            <span className="text-xs text-foreground">{child.label}</span>
            <Switch
              checked={Boolean(group[child.key])}
              onCheckedChange={(next) =>
                onChange({ ...group, [child.key]: next })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModuleConfigDialog({
  open,
  onOpenChange,
  merchantId,
  mod,
}) {
  const dispatch = useDispatch();
  const spec = specFor(mod?.module_code);
  const [draft, setDraft] = useState({});

  // Resolve the MerchantModule row this config lives on. Only while open — the
  // panel renders a dialog per tile and none of them should fetch until used.
  const { data, isFetching: rowLoading } = useListModulesQuery(
    { merchant: merchantId, module: mod?.module_id },
    { skip: !open || !merchantId || !mod?.module_id },
  );
  // Match on both ids rather than taking rows[0]. The endpoint does filter
  // (DjangoFilterBackend is a project-wide default and the ViewSet declares
  // `merchant`/`module` as filterset fields), but the failure mode if that ever
  // stops holding is patching a *different merchant's* config — too expensive a
  // mistake to leave resting on a query param.
  const rows = readResults(data);
  const row =
    rows.find(
      (r) =>
        String(r.merchant) === String(merchantId) &&
        String(r.module) === String(mod?.module_id),
    ) ?? null;
  const rowId = row?.id ?? null;

  const [patchModule, { isLoading: saving }] = usePatchModuleMutation();

  // Reload the draft from the server's copy each time it opens, so a cancelled
  // edit doesn't linger into the next open.
  useEffect(() => {
    if (open) setDraft({ ...(mod?.config ?? {}) });
  }, [open, mod?.config]);

  const visibleFields = useMemo(
    () =>
      (spec?.fields ?? []).filter(
        (f) => !f.showWhen || f.showWhen(draft),
      ),
    [spec, draft],
  );

  if (!spec) return null;

  const setField = (key, value) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const save = async (config) => {
    if (!rowId) {
      toast.error("Couldn't find this module on the merchant.");
      return;
    }
    try {
      await patchModule({ id: rowId, config }).unwrap();
      // The panel reads config off the *merchant detail* payload, which is a
      // different createApi instance — patchModule's own invalidation can't
      // reach it, so nudge that cache explicitly or the tile keeps showing the
      // old value until a reload.
      dispatch(
        merchantsApi.util.invalidateTags([
          { type: "Merchants", id: merchantId },
          { type: "Merchants", id: "ALL" },
        ]),
      );
      toast.success("Settings saved");
      onOpenChange(false);
    } catch (err) {
      toast.error(errorText(err, "Couldn't save settings"));
    }
  };

  const hasSaved = Boolean(mod?.config && Object.keys(mod.config).length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{spec.title}</DialogTitle>
          <DialogDescription>{spec.description}</DialogDescription>
        </DialogHeader>

        {rowLoading && !rowId ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading settings…
          </div>
        ) : !rowId ? (
          <p className="py-6 text-sm text-muted-foreground">
            This module isn&rsquo;t attached to the merchant, so it has nothing to
            configure.
          </p>
        ) : (
          <div className="flex flex-col gap-4 py-1">
            {visibleFields.map((field) => {
              const value = draft[field.key];
              const onChange = (next) => setField(field.key, next);
              if (field.type === "enum")
                return (
                  <EnumField
                    key={field.key}
                    field={field}
                    value={value}
                    onChange={onChange}
                  />
                );
              if (field.type === "number")
                return (
                  <NumberField
                    key={field.key}
                    field={field}
                    value={value}
                    onChange={onChange}
                  />
                );
              if (field.type === "boolean")
                return (
                  <BooleanField
                    key={field.key}
                    field={field}
                    value={value}
                    onChange={onChange}
                  />
                );
              if (field.type === "booleanGroup")
                return (
                  <BooleanGroupField
                    key={field.key}
                    field={field}
                    value={value}
                    onChange={onChange}
                  />
                );
              return null;
            })}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {/* Clearing beats setting layout back to "classic" by hand: an empty
              config is how every un-configured merchant reads, so resetting
              leaves no trace of the experiment behind. */}
          <Button
            variant="ghost"
            size="sm"
            disabled={!rowId || saving || !hasSaved}
            onClick={() => save({})}
          >
            Reset to default
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!rowId || saving}
              onClick={() => save(pruneConfig(mod.module_code, draft))}
            >
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
