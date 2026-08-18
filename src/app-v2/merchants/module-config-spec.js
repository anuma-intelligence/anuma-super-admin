// Which per-module settings this tool can edit, and how to render them.
//
// A merchant's `MerchantModule.config` is free-form JSON on the backend, and the
// merchant's app reads keys out of it — the inbox reads `config.layout` to pick
// which shell that merchant gets (merchants-app `src/hooks/useInboxProfile.js`).
// Because the app falls back to its default on anything it doesn't recognise, a
// mistyped key saves cleanly and changes nothing, which reads as a frontend bug.
//
// So this file is the contract: the form only ever emits keys declared here, with
// values from the sets declared here. That's also why there's no raw-JSON
// escape hatch in the dialog — the backend accepts any object, so free text is
// the one way to silently write a config the app can't act on. Add a setting here
// (and read it in the app) rather than typing JSON.
//
// Keyed by `module_code`. A module absent from this map has no Configure button.

export const MODULE_CONFIG_SPECS = {
  inbox: {
    title: "Inbox settings",
    description:
      "Applies to this merchant only. Takes effect on their next page load.",
    fields: [
      {
        key: "layout",
        type: "enum",
        label: "Layout",
        default: "classic",
        options: [
          {
            value: "classic",
            label: "Classic",
            hint: "Channel list — Active / Inactive accounts.",
          },
          {
            value: "distributor_desk",
            label: "Distributor desk",
            hint: "WhatsApp-first desk: one channel, saved views (Geo / ASM / Segments), ordering panel.",
          },
        ],
      },
      {
        key: "slaHours",
        type: "number",
        label: "Reply target (hours)",
        placeholder: "8",
        hint: "When an unanswered conversation's clock turns amber. Blank = no target.",
        // Only meaningful on the desk, which is the only layout that shows the
        // clock. `showWhen` keeps the form from offering settings that do nothing.
        showWhen: (config) => config.layout === "distributor_desk",
      },
      {
        key: "views",
        type: "booleanGroup",
        label: "Saved view groups",
        showWhen: (config) => config.layout === "distributor_desk",
        children: [
          { key: "geo", label: "See by Geo" },
          { key: "asm", label: "By ASM" },
          { key: "segments", label: "Segments" },
        ],
      },
      {
        key: "mock",
        type: "boolean",
        label: "Show placeholder data",
        hint: "Fills the surfaces with no backend yet (view counts, price band, order totals) with sample figures. Demos only — never a live merchant.",
        showWhen: (config) => config.layout === "distributor_desk",
      },
    ],
  },
};

export function specFor(moduleCode) {
  return MODULE_CONFIG_SPECS[moduleCode] ?? null;
}

// Short read-out of a saved config for the module tile, so you can see which
// merchants are on a non-default setup without opening anything. Null when the
// config is empty or says nothing interesting.
export function summariseConfig(moduleCode, config) {
  if (!config || typeof config !== "object") return null;
  const spec = specFor(moduleCode);
  if (!spec) {
    const count = Object.keys(config).length;
    return count ? `${count} setting${count === 1 ? "" : "s"}` : null;
  }

  const enumField = spec.fields.find((f) => f.type === "enum");
  if (enumField && config[enumField.key] != null) {
    const option = enumField.options.find(
      (o) => o.value === config[enumField.key],
    );
    // The default value isn't worth a badge — it's what every other merchant has.
    if (config[enumField.key] !== enumField.default) {
      return option?.label ?? String(config[enumField.key]);
    }
  }

  return Object.keys(config).length ? "configured" : null;
}

// Strip keys the merchant's app would ignore: fields hidden by their `showWhen`
// (a reply target means nothing on the classic layout), and blanks. Keeps the
// stored JSON honest about what's actually in force, so reading a merchant's row
// tells you what they see.
export function pruneConfig(moduleCode, config) {
  const spec = specFor(moduleCode);
  if (!spec) return config;

  const out = {};
  for (const field of spec.fields) {
    if (field.showWhen && !field.showWhen(config)) continue;
    const value = config[field.key];
    if (value === undefined || value === "" || value === null) continue;
    if (field.type === "booleanGroup") {
      const group = {};
      for (const child of field.children ?? []) {
        if (typeof value?.[child.key] === "boolean") {
          group[child.key] = value[child.key];
        }
      }
      if (Object.keys(group).length) out[field.key] = group;
      continue;
    }
    out[field.key] = value;
  }
  return out;
}
