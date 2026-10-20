export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface EntityRegistryDisplayEntry {
  entity_id?: string;
  name?: string;
  device_id?: string;
  area_id?: string;
  entity_category?: "config" | "diagnostic" | string;
  platform?: string;
  translation_key?: string;
  hidden?: boolean;
}

/** Subset of the Home Assistant frontend `hass` object this card uses. */
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities?: Record<string, EntityRegistryDisplayEntry | undefined>;
  language?: string;
  locale?: { language?: string };
  callService: (
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>,
  ) => Promise<unknown> | unknown;
}

export type Finish = "brushed" | "matte" | "gloss";
export type CardLanguage = "es" | "en" | "auto";

export interface NukiCardConfig {
  entity?: string;
  name?: string;
  battery_entity?: string;
  door_entity?: string;
  jammed_entity?: string;
  show_name?: boolean;
  show_state?: boolean;
  show_battery?: boolean;
  show_door?: boolean;
  show_buttons?: boolean;
  confirm_open?: boolean;
  language?: CardLanguage;
  body_color?: string;
  body_finish?: Finish;
  base_color?: string;
  ring_color?: string;
  warning_color?: string;
  low_battery?: number | string;
}

export interface ViewConfig {
  entity?: string;
  name?: string;
  battery_entity?: string;
  door_entity?: string;
  jammed_entity?: string;
  show_name: boolean;
  show_state: boolean;
  show_battery: boolean;
  show_door: boolean;
  show_buttons: boolean;
  confirm_open: boolean;
  language: CardLanguage;
  body_color: string;
  body_finish: Finish;
  base_color: string;
  ring_color: string;
  warning_color: string;
  low_battery: number;
}

export type LockVisual =
  | "locked"
  | "unlocked"
  | "locking"
  | "unlocking"
  | "opening"
  | "open"
  | "jammed"
  | "unavailable"
  | "unknown";

export interface ResolvedEntities {
  lock?: string;
  battery?: string;
  door?: string;
  jammed?: string;
  batteryCritical?: string;
  charging?: string;
  /** Why `lock` is missing when it is. */
  missing?: "none" | "many";
}
