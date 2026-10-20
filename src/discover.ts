import type { HassEntity, HomeAssistant, NukiCardConfig, ResolvedEntities } from "./types";

interface Sibling {
  id: string;
  domain: string;
  deviceClass: string;
  unit?: string;
  haystack: string;
  category?: string;
}

const BATTERY_MIN = 40;

function domainOf(entityId: string): string {
  return entityId.split(".", 1)[0] ?? "";
}

function listLocks(hass: HomeAssistant): string[] {
  return Object.keys(hass.states ?? {})
    .filter((id) => domainOf(id) === "lock")
    .sort();
}

function siblingsOf(hass: HomeAssistant, deviceId: string, lockId: string): Sibling[] {
  const registry = hass.entities;
  if (!registry) return [];
  const out: Sibling[] = [];
  for (const [key, entry] of Object.entries(registry)) {
    if (!entry || entry.device_id !== deviceId) continue;
    const id = entry.entity_id || key;
    if (id === lockId) continue;
    const state: HassEntity | undefined = hass.states?.[id];
    const attrs = state?.attributes ?? {};
    const deviceClass = typeof attrs.device_class === "string" ? attrs.device_class : "";
    const unit = typeof attrs.unit_of_measurement === "string" ? attrs.unit_of_measurement : undefined;
    const friendly = typeof attrs.friendly_name === "string" ? attrs.friendly_name : "";
    const haystack = `${id} ${friendly} ${entry.name ?? ""} ${entry.translation_key ?? ""}`.toLowerCase();
    out.push({
      id,
      domain: domainOf(id),
      deviceClass,
      unit,
      haystack,
      category: entry.entity_category,
    });
  }
  return out;
}

function pickBest(items: Sibling[], score: (item: Sibling) => number, minimum: number): Sibling | undefined {
  let best: Sibling | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const item of items) {
    const value = score(item);
    if (value >= minimum && value > bestScore) {
      best = item;
      bestScore = value;
    }
  }
  return best;
}

function batteryScore(item: Sibling): number {
  if (item.domain !== "sensor") return -1;
  const classHit = item.deviceClass === "battery";
  const nameHit = /(battery|bater)/.test(item.haystack);
  if (!classHit && !(item.unit === "%" && nameHit)) return -1;
  let score = 0;
  if (classHit) score += 50;
  if (item.unit === "%") score += 30;
  if (nameHit) score += 10;
  if (/(keypad|teclado|door sensor|sensor de puerta|doorsensor)/.test(item.haystack)) score -= 40;
  if (item.category === "diagnostic") score -= 5;
  return score;
}

function doorScore(item: Sibling): number {
  if (item.domain !== "binary_sensor" || item.deviceClass !== "door") return -1;
  return 10;
}

function jammedScore(item: Sibling): number {
  if (item.domain !== "binary_sensor") return -1;
  const named = /(jam|blocked|atas|bloqueo)/.test(item.haystack);
  if (item.deviceClass === "problem" || item.deviceClass === "safety") {
    return named ? 20 : 10;
  }
  return named ? 8 : -1;
}

function criticalScore(item: Sibling): number {
  if (item.domain !== "binary_sensor" || item.deviceClass !== "battery") return -1;
  let score = 10;
  if (/(critical|critic|crít|baja)/.test(item.haystack)) score += 15;
  // Penalise accessory packs only. A lock named "Puerta" must still match.
  if (/(keypad|teclado|door sensor|sensor de puerta|doorsensor)/.test(item.haystack)) score -= 25;
  return score;
}

function chargingScore(item: Sibling): number {
  return item.domain === "binary_sensor" && item.deviceClass === "battery_charging" ? 10 : -1;
}

function overrideId(value: string | undefined): string | undefined {
  const id = value?.trim();
  return id ? id : undefined;
}

/**
 * Resolve the lock plus sibling sensors.
 * `entity` may be omitted when the home has exactly one `lock.*` entity.
 * Battery, door and jammed indicators come from `hass.entities` entries that
 * share the lock's `device_id`, classified with each state's `device_class`.
 * Manual `battery_entity` / `door_entity` / `jammed_entity` always win.
 */
export function resolveEntities(hass: HomeAssistant, config: Partial<NukiCardConfig> | undefined): ResolvedEntities {
  const cfg = config ?? {};
  const locks = listLocks(hass);
  let lock = overrideId(cfg.entity);
  let missing: ResolvedEntities["missing"];
  if (!lock) {
    if (locks.length === 1) lock = locks[0];
    else if (locks.length === 0) missing = "none";
    else missing = "many";
  }

  const resolved: ResolvedEntities = { lock, missing };

  const batteryOverride = overrideId(cfg.battery_entity);
  const doorOverride = overrideId(cfg.door_entity);
  const jammedOverride = overrideId(cfg.jammed_entity);
  if (batteryOverride) resolved.battery = batteryOverride;
  if (doorOverride) resolved.door = doorOverride;
  if (jammedOverride) resolved.jammed = jammedOverride;

  if (!lock) return resolved;

  const deviceId = hass.entities?.[lock]?.device_id;
  if (!deviceId) return resolved;

  const siblings = siblingsOf(hass, deviceId, lock);
  if (!resolved.battery) resolved.battery = pickBest(siblings, batteryScore, BATTERY_MIN)?.id;
  if (!resolved.door) resolved.door = pickBest(siblings, doorScore, 1)?.id;
  if (!resolved.jammed) resolved.jammed = pickBest(siblings, jammedScore, 8)?.id;
  resolved.batteryCritical = pickBest(siblings, criticalScore, 1)?.id;
  resolved.charging = pickBest(siblings, chargingScore, 1)?.id;
  return resolved;
}

export function batteryPercent(state: string | undefined): number | null {
  if (state == null || state === "" || state === "unknown" || state === "unavailable") return null;
  const value = Number(state);
  if (!Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, value));
}

export function isOn(state: string | undefined): boolean {
  return state === "on" || state === "open" || state === "true";
}

export type DoorPosition = "open" | "closed" | "unavailable";

export function doorPosition(state: string | undefined): DoorPosition {
  if (state == null || state === "unknown" || state === "unavailable") return "unavailable";
  if (state === "on" || state === "open") return "open";
  if (state === "off" || state === "closed") return "closed";
  return "unavailable";
}
