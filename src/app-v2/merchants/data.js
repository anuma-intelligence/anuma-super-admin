export const EMPTY_MERCHANT = {
  name: "",
  handle: "",
  email: "",
  phone: "",
  domain: "",
  currency: "USD",
  timezone: "America/New_York",
  money_format: "${{amount}}",
  weight_unit: "kg",
  customer_email: "",
  parent_merchant: null,
  config: {},
  plan: null,
};

// Field groups drive both create + detail forms. Each section becomes a
// visually separate block with its own heading + description.
export const MERCHANT_FIELD_GROUPS = [
  {
    key: "identity",
    title: "Identity",
    description: "Public-facing store name and how the platform addresses it.",
    fields: [
      { key: "name", label: "Name", placeholder: "My Store", required: true },
      { key: "handle", label: "Handle", placeholder: "my-store", required: true },
      { key: "domain", label: "Domain", placeholder: "mystore.com" },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    description: "How Anuma reaches this merchant.",
    fields: [
      {
        key: "email",
        label: "Owner email",
        placeholder: "owner@mystore.com",
        type: "email",
        required: true,
      },
      { key: "phone", label: "Phone", placeholder: "+1-555-0123" },
      {
        key: "customer_email",
        label: "Customer support email",
        placeholder: "support@mystore.com",
      },
    ],
  },
  {
    key: "locale",
    title: "Locale & format",
    description: "Currency, timezone and formatting defaults.",
    fields: [
      { key: "currency", label: "Currency", placeholder: "USD" },
      { key: "timezone", label: "Timezone", placeholder: "America/New_York" },
      { key: "money_format", label: "Money format", placeholder: "${{amount}}" },
      { key: "weight_unit", label: "Weight unit", placeholder: "kg" },
    ],
  },
];

// Kept for backwards-compat with anything still importing MERCHANT_FIELDS.
export const MERCHANT_FIELDS = MERCHANT_FIELD_GROUPS.flatMap((g) => g.fields);

export const planLabel = (plan) => {
  if (!plan) return "—";
  if (typeof plan === "object") return plan.name || plan.code || String(plan.id);
  return String(plan);
};

export const planId = (plan) => {
  if (!plan) return null;
  if (typeof plan === "object") return plan.id ?? null;
  const n = Number(plan);
  return Number.isFinite(n) ? n : null;
};
