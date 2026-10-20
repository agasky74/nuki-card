import type { CardLanguage, HomeAssistant } from "./types";

const ES = {
  locked: "Bloqueado",
  unlocked: "Desbloqueado",
  locking: "Bloqueando",
  unlocking: "Desbloqueando",
  jammed: "Atascado",
  opening: "Abriendo",
  open: "Abierto",
  unavailable: "No disponible",
  unknown: "Desconocido",
  action_lock: "Bloquear",
  action_unlock: "Desbloquear",
  action_open: "Abrir",
  door_open: "Puerta abierta",
  door_closed: "Puerta cerrada",
  door_unavailable: "Puerta no disponible",
  battery_critical: "Batería crítica",
  charging: "Cargando",
  jammed_alert: "Atasco",
  confirm_title: "Abrir pestillo",
  confirm_text: "Se liberará el pestillo y la puerta podrá abrirse. ¿Continuar?",
  confirm: "Abrir",
  cancel: "Cancelar",
  many_locks: "Hay varias cerraduras. Elige una en la configuración de la tarjeta.",
  no_locks: "No hay ninguna entidad lock.",
  not_found: "No se encuentra {entity}",
  more_info: "Más información de {name}",
  editor_entity: "Cerradura",
  editor_entity_help: "Dominio lock. Vacío: se usa la única cerradura de la casa, si solo hay una.",
  editor_name: "Nombre",
  editor_name_help: "Vacío: nombre de la entidad.",
  editor_battery: "Sensor de batería",
  editor_battery_help: "Opcional. Si se deja vacío, se busca un sensor de batería del mismo dispositivo.",
  editor_door: "Sensor de puerta",
  editor_door_help: "Opcional. Binario con device_class door del mismo dispositivo.",
  editor_jammed: "Indicador de atasco",
  editor_jammed_help: "Opcional. Binario de problema del mismo dispositivo.",
  editor_language: "Idioma",
  editor_finish: "Acabado del cuerpo",
  editor_body: "Color del cuerpo",
  editor_base: "Color del aro base",
  editor_ring: "Color del anillo",
  editor_warning: "Color de aviso",
  editor_low: "Batería baja desde (%)",
  editor_low_help: "El porcentaje y el segmento superior pasan a aviso por debajo de este valor.",
  editor_show_name: "Mostrar nombre",
  editor_show_state: "Mostrar estado",
  editor_show_battery: "Mostrar batería",
  editor_show_door: "Mostrar puerta",
  editor_show_buttons: "Mostrar botones",
  editor_confirm: "Pedir confirmación al abrir",
  editor_section_entity: "Entidades",
  editor_section_look: "Apariencia",
  editor_section_options: "Opciones",
  finish_brushed: "Metal cepillado",
  finish_matte: "Mate",
  finish_gloss: "Brillo",
  lang_es: "Español",
  lang_en: "English",
  lang_auto: "Automático (idioma de Home Assistant)",
  auto_one: "Se usará {entity} si dejas esto vacío.",
  auto_many: "Hay varias cerraduras: hay que elegir una.",
  auto_none: "No hay entidades lock en este momento.",
  blank_auto: "Automática",
};

const EN = {
  locked: "Locked",
  unlocked: "Unlocked",
  locking: "Locking",
  unlocking: "Unlocking",
  jammed: "Jammed",
  opening: "Opening",
  open: "Open",
  unavailable: "Unavailable",
  unknown: "Unknown",
  action_lock: "Lock",
  action_unlock: "Unlock",
  action_open: "Open",
  door_open: "Door open",
  door_closed: "Door closed",
  door_unavailable: "Door unavailable",
  battery_critical: "Battery critical",
  charging: "Charging",
  jammed_alert: "Jammed",
  confirm_title: "Unlatch",
  confirm_text: "The latch will release and the door can open. Continue?",
  confirm: "Open",
  cancel: "Cancel",
  many_locks: "There are several locks. Pick one in the card configuration.",
  no_locks: "No lock entity found.",
  not_found: "Entity not found: {entity}",
  more_info: "More info for {name}",
  editor_entity: "Lock",
  editor_entity_help: "Lock domain. Empty: use the only lock in the home, when there is exactly one.",
  editor_name: "Name",
  editor_name_help: "Empty: entity name.",
  editor_battery: "Battery sensor",
  editor_battery_help: "Optional. Empty: a battery sensor on the same device is used.",
  editor_door: "Door sensor",
  editor_door_help: "Optional. Binary sensor with device_class door on the same device.",
  editor_jammed: "Jammed indicator",
  editor_jammed_help: "Optional. Problem binary sensor on the same device.",
  editor_language: "Language",
  editor_finish: "Body finish",
  editor_body: "Body color",
  editor_base: "Base ring color",
  editor_ring: "Light ring color",
  editor_warning: "Warning color",
  editor_low: "Low battery below (%)",
  editor_low_help: "The percentage and the top segment switch to the warning color below this value.",
  editor_show_name: "Show name",
  editor_show_state: "Show state",
  editor_show_battery: "Show battery",
  editor_show_door: "Show door",
  editor_show_buttons: "Show buttons",
  editor_confirm: "Confirm before unlatch",
  editor_section_entity: "Entities",
  editor_section_look: "Appearance",
  editor_section_options: "Options",
  finish_brushed: "Brushed metal",
  finish_matte: "Matte",
  finish_gloss: "Gloss",
  lang_es: "Español",
  lang_en: "English",
  lang_auto: "Automatic (Home Assistant language)",
  auto_one: "{entity} will be used if you leave this empty.",
  auto_many: "Several locks found: pick one.",
  auto_none: "No lock entities right now.",
  blank_auto: "Automatic",
} satisfies Record<keyof typeof ES, string>;

const DICT = { es: ES, en: EN };

export type Lang = keyof typeof DICT;
export type MessageKey = keyof typeof ES;

export function resolveLanguage(pref: CardLanguage | undefined, hass?: Pick<HomeAssistant, "language" | "locale">): Lang {
  if (pref === "en") return "en";
  if (pref === "auto") {
    const code = (hass?.locale?.language || hass?.language || "es").toLowerCase();
    return code.startsWith("es") ? "es" : "en";
  }
  return "es";
}

export function t(lang: Lang, key: MessageKey, vars?: Record<string, string>): string {
  let text: string = DICT[lang][key] ?? DICT.en[key] ?? DICT.es[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, value);
    }
  }
  return text;
}

export function stateMessageKey(state: string | undefined): MessageKey {
  switch (state) {
    case "locked":
    case "unlocked":
    case "locking":
    case "unlocking":
    case "jammed":
    case "opening":
    case "open":
    case "unavailable":
    case "unknown":
      return state;
    default:
      return "unknown";
  }
}
