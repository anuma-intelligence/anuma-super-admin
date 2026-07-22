export const QUOTA_KEYS = ["ai_action", "ai_token", "whatsapp_convo", "email_send"];

export const QUOTA_LABELS = {
  ai_action: "AI actions",
  ai_token: "AI tokens",
  whatsapp_convo: "WhatsApp convos",
  email_send: "Email sends",
};

export const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export const DURATION_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

export const EMPTY_PLAN = {
  code: "",
  name: "",
  visibility: "public",
  owning_merchant: null,
  modules: [],
  duration_type: "monthly",
  custom_duration_days: null,
  snapshot: {
    quotas: Object.fromEntries(QUOTA_KEYS.map((k) => [k, 0])),
    overage_rate: Object.fromEntries(QUOTA_KEYS.map((k) => [k, 0])),
  },
};

export const badgeVariantForVisibility = (visibility) =>
  visibility === "public" ? "default" : "secondary";

export const durationLabel = (plan) => {
  if (plan.duration_type === "custom" && plan.custom_duration_days) {
    return `${plan.custom_duration_days}d`;
  }
  return plan.duration_type || "—";
};
