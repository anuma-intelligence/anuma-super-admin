import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DURATION_OPTIONS,
  EMPTY_PLAN,
  QUOTA_KEYS,
  QUOTA_LABELS,
  VISIBILITY_OPTIONS,
} from "../data";
import ModulesSelect from "./modules-select";

const toNumberOrZero = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Normalises whatever the API returns for `modules` — sometimes an array of
// numeric IDs, sometimes an array of `{ id, name, ... }` objects — into a flat
// numeric[] we can drive the combobox with.
const normaliseModuleIds = (modules) => {
  if (!Array.isArray(modules)) return [];
  return modules
    .map((m) => (typeof m === "object" ? m?.id : m))
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
};

function QuotaGrid({ title, values, onChange, step }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {QUOTA_KEYS.map((k) => (
          <div key={k}>
            <Label htmlFor={`${title}-${k}`} className="text-xs">
              {QUOTA_LABELS[k]}
            </Label>
            <Input
              id={`${title}-${k}`}
              type="number"
              step={step}
              value={values[k] ?? 0}
              onChange={(e) => onChange(k, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlanForm({ initial, submitLabel, submitting, onSubmit }) {
  const [code, setCode] = useState(initial.code || "");
  const [name, setName] = useState(initial.name || "");
  const [visibility, setVisibility] = useState(initial.visibility || "public");
  const [durationType, setDurationType] = useState(initial.duration_type || "monthly");
  const [customDays, setCustomDays] = useState(
    initial.custom_duration_days == null ? "" : String(initial.custom_duration_days),
  );
  const [modules, setModules] = useState(() => normaliseModuleIds(initial.modules));
  const [owningMerchant, setOwningMerchant] = useState(
    initial.owning_merchant == null ? "" : String(initial.owning_merchant),
  );
  const [quotas, setQuotas] = useState(
    initial.snapshot?.quotas || EMPTY_PLAN.snapshot.quotas,
  );
  const [overageRate, setOverageRate] = useState(
    initial.snapshot?.overage_rate || EMPTY_PLAN.snapshot.overage_rate,
  );

  const updateQuota = (k, v) => setQuotas((prev) => ({ ...prev, [k]: v }));
  const updateOverage = (k, v) => setOverageRate((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code,
      name,
      visibility,
      owning_merchant: owningMerchant === "" ? null : Number(owningMerchant),
      modules,
      duration_type: durationType,
      custom_duration_days:
        durationType === "custom" && customDays !== "" ? Number(customDays) : null,
      snapshot: {
        quotas: Object.fromEntries(
          QUOTA_KEYS.map((k) => [k, toNumberOrZero(quotas[k])]),
        ),
        overage_rate: Object.fromEntries(
          QUOTA_KEYS.map((k) => [k, toNumberOrZero(overageRate[k])]),
        ),
      },
    };
    try {
      await onSubmit(payload);
    } catch {
      // parent surfaces errors via toast
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="growth"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Growth"
            required
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duration</Label>
          <Select value={durationType} onValueChange={setDurationType}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {durationType === "custom" ? (
        <div>
          <Label htmlFor="custom-days">Custom duration (days)</Label>
          <Input
            id="custom-days"
            type="number"
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value)}
            placeholder="90"
            className="mt-1.5"
          />
        </div>
      ) : null}

      <div>
        <Label>Modules</Label>
        <div className="mt-1.5">
          <ModulesSelect value={modules} onChange={setModules} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Searchable multi-select — options come from{" "}
          <code className="font-mono">/api/merchants/modules/</code>.
        </p>
      </div>

      <div>
        <Label htmlFor="owning-merchant">Owning merchant ID</Label>
        <Input
          id="owning-merchant"
          value={owningMerchant}
          onChange={(e) => setOwningMerchant(e.target.value)}
          placeholder="leave blank for platform-wide"
          className="mt-1.5"
        />
      </div>

      <QuotaGrid title="Quotas" values={quotas} onChange={updateQuota} step="1" />
      <QuotaGrid
        title="Overage rates"
        values={overageRate}
        onChange={updateOverage}
        step="0.000001"
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
