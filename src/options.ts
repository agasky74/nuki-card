import type { CardLanguage, Finish, NukiCardConfig, ViewConfig } from "./types";

export const DEFAULTS = {
  body_color: "#c5cad1",
  body_finish: "brushed" as Finish,
  base_color: "#16171a",
  ring_color: "#ffffff",
  warning_color: "#ff3b30",
  low_battery: 20,
  language: "es" as CardLanguage,
  confirm_open: true,
  show_name: true,
  show_state: true,
  show_battery: true,
  show_door: true,
  show_buttons: true,
};

const FINISHES: readonly Finish[] = ["brushed", "matte", "gloss"];

export function normalizeColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return v.toLowerCase();
  if (/^(rgb|hsl)a?\(\s*[\d.%\s,/+-]+\)$/.test(v)) return v;
  if (/^[a-zA-Z]{3,20}$/.test(v)) return v.toLowerCase();
  return fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function languageOf(value: unknown): CardLanguage {
  return value === "en" || value === "es" || value === "auto" ? value : "es";
}

function finishOf(value: unknown): Finish {
  return FINISHES.includes(value as Finish) ? (value as Finish) : "brushed";
}

function thresholdOf(value: unknown): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return DEFAULTS.low_battery;
  return Math.min(100, Math.max(0, n));
}

function optionalId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const id = value.trim();
  return id.length > 0 ? id : undefined;
}

export function viewConfig(config: Partial<NukiCardConfig> | undefined): ViewConfig {
  const c = config ?? {};
  return {
    entity: optionalId(c.entity),
    name: typeof c.name === "string" && c.name.trim() ? c.name.trim() : undefined,
    battery_entity: optionalId(c.battery_entity),
    door_entity: optionalId(c.door_entity),
    jammed_entity: optionalId(c.jammed_entity),
    show_name: bool(c.show_name, DEFAULTS.show_name),
    show_state: bool(c.show_state, DEFAULTS.show_state),
    show_battery: bool(c.show_battery, DEFAULTS.show_battery),
    show_door: bool(c.show_door, DEFAULTS.show_door),
    show_buttons: bool(c.show_buttons, DEFAULTS.show_buttons),
    confirm_open: bool(c.confirm_open, DEFAULTS.confirm_open),
    language: languageOf(c.language),
    body_color: normalizeColor(c.body_color, DEFAULTS.body_color),
    body_finish: finishOf(c.body_finish),
    base_color: normalizeColor(c.base_color, DEFAULTS.base_color),
    ring_color: normalizeColor(c.ring_color, DEFAULTS.ring_color),
    warning_color: normalizeColor(c.warning_color, DEFAULTS.warning_color),
    low_battery: thresholdOf(c.low_battery),
  };
}

/** Drop a value when it matches the default so the stored YAML stays short. */
export function cleanConfigValue(key: keyof NukiCardConfig, value: unknown): unknown {
  if (value == null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;

  switch (key) {
    case "entity":
    case "battery_entity":
    case "door_entity":
    case "jammed_entity":
      return optionalId(value);
    case "name": {
      const name = typeof value === "string" ? value.trim() : "";
      return name || undefined;
    }
    case "language": {
      const lang = languageOf(value);
      return lang === DEFAULTS.language ? undefined : lang;
    }
    case "body_finish": {
      const finish = finishOf(value);
      return finish === DEFAULTS.body_finish ? undefined : finish;
    }
    case "body_color":
    case "base_color":
    case "ring_color":
    case "warning_color": {
      const color = normalizeColor(value, "");
      if (!color) return undefined;
      return color === DEFAULTS[key] ? undefined : color;
    }
    case "low_battery": {
      const n = thresholdOf(value);
      return n === DEFAULTS.low_battery ? undefined : n;
    }
    case "show_name":
    case "show_state":
    case "show_battery":
    case "show_door":
    case "show_buttons":
    case "confirm_open": {
      const flag = Boolean(value);
      return flag === DEFAULTS[key] ? undefined : flag;
    }
    default:
      return undefined;
  }
}
