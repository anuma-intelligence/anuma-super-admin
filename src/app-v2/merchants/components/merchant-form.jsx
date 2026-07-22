import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { EMPTY_MERCHANT, MERCHANT_FIELD_GROUPS } from "../data";

function FieldRow({ field, value, onChange }) {
  return (
    <div>
      <Label htmlFor={field.key} className="text-xs font-medium">
        {field.label}
      </Label>
      <Input
        id={field.key}
        type={field.type || "text"}
        value={value || ""}
        onChange={onChange}
        placeholder={field.placeholder}
        required={field.required}
        className="mt-1.5"
      />
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="grid grid-cols-1 gap-6 border-b border-border pb-6 last:border-b-0 last:pb-0 md:grid-cols-[220px_1fr]">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function MerchantForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
  omitFields,
}) {
  const omitSet = new Set(omitFields || []);
  const [values, setValues] = useState(() => ({
    ...EMPTY_MERCHANT,
    ...(initial || {}),
  }));
  const [parentMerchant, setParentMerchant] = useState(
    initial?.parent_merchant == null ? "" : String(initial.parent_merchant),
  );
  const [planIdInput, setPlanIdInput] = useState(
    initial?.plan == null
      ? ""
      : typeof initial.plan === "object"
        ? String(initial.plan.id ?? "")
        : String(initial.plan),
  );

  const setField = (key) => (e) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...values,
      parent_merchant: parentMerchant === "" ? null : Number(parentMerchant),
      plan: planIdInput === "" ? null : Number(planIdInput),
    };
    // Drop any fields the caller explicitly hid — the backend either derives
    // them (e.g. `handle` from `name`) or won't accept an empty string.
    for (const key of omitSet) delete payload[key];
    try {
      await onSubmit(payload);
    } catch {
      // parent surfaces errors
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {MERCHANT_FIELD_GROUPS.map((group) => {
        const visible = group.fields.filter((f) => !omitSet.has(f.key));
        if (visible.length === 0) return null;
        return (
          <Section
            key={group.key}
            title={group.title}
            description={group.description}
          >
            {visible.map((f) => (
              <FieldRow
                key={f.key}
                field={f}
                value={values[f.key]}
                onChange={setField(f.key)}
              />
            ))}
          </Section>
        );
      })}

      <Section
        title="Hierarchy"
        description="Parent merchant + assigned plan."
      >
        <FieldRow
          field={{
            key: "parent_merchant",
            label: "Parent merchant ID",
            placeholder: "leave blank for top-level",
          }}
          value={parentMerchant}
          onChange={(e) => setParentMerchant(e.target.value)}
        />
        <FieldRow
          field={{
            key: "plan-id",
            label: "Plan ID",
            placeholder: "leave blank to skip",
          }}
          value={planIdInput}
          onChange={(e) => setPlanIdInput(e.target.value)}
        />
      </Section>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
