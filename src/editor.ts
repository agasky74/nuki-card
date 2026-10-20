import { LitElement, css, html, nothing } from "lit";
import { t, resolveLanguage, type MessageKey } from "./i18n";
import { DEFAULTS, cleanConfigValue, viewConfig } from "./options";
import type { HomeAssistant, NukiCardConfig } from "./types";

type PickerKey = "entity" | "battery_entity" | "door_entity" | "jammed_entity";

/**
 * Visual editor. Uses `ha-entity-picker` / `ha-selector` when the dashboard
 * has loaded them, and plain controls otherwise (demo, or a very early paint).
 */
export class NukiLockCardEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--ha-font-family, var(--primary-font-family, system-ui, sans-serif));
      color: var(--primary-text-color, #212121);
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 4px 0 8px;
    }
    h3 {
      margin: 6px 0 0;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color, #727272);
    }
    label,
    .lbl {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    select,
    input[type="text"],
    input[type="number"] {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
      background: var(--card-background-color, var(--primary-background-color, #fff));
      color: inherit;
      font: inherit;
    }
    .helper {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.35;
      color: var(--secondary-text-color, #727272);
    }
    .color {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    input[type="color"] {
      width: 48px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
      background: transparent;
      border-radius: 8px;
    }
    code {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .check {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .check input {
      width: 16px;
      height: 16px;
    }
  `;

  #hass?: HomeAssistant;
  #config: NukiCardConfig = {};
  #nativePicker = false;

  set hass(value: HomeAssistant) {
    this.#hass = value;
    this.requestUpdate();
    void this.#loadPickers();
  }
  get hass(): HomeAssistant | undefined {
    return this.#hass;
  }

  setConfig(config: NukiCardConfig): void {
    this.#config = { ...(config ?? {}) };
    this.requestUpdate();
  }

  protected firstUpdated(): void {
    void this.#loadPickers();
  }

  render() {
    const lang = resolveLanguage(viewConfig(this.#config).language, this.#hass);
    const view = viewConfig(this.#config);
    const locks = this.#locks();
    const entityHelp = this.#entityHint(lang, locks);
    return html`
      <div class="form">
        <h3>${t(lang, "editor_section_entity")}</h3>
        ${this.#entityField("entity", ["lock"], "editor_entity", entityHelp)}
        ${this.#textField("name", "editor_name", "editor_name_help", view.name ?? "")}
        ${this.#entityField("battery_entity", ["sensor"], "editor_battery", t(lang, "editor_battery_help"))}
        ${this.#entityField("door_entity", ["binary_sensor"], "editor_door", t(lang, "editor_door_help"))}
        ${this.#entityField("jammed_entity", ["binary_sensor"], "editor_jammed", t(lang, "editor_jammed_help"))}

        <h3>${t(lang, "editor_section_look")}</h3>
        ${this.#selectField("language", "editor_language", [
          ["es", t(lang, "lang_es")],
          ["en", t(lang, "lang_en")],
          ["auto", t(lang, "lang_auto")],
        ], view.language)}
        ${this.#selectField("body_finish", "editor_finish", [
          ["brushed", t(lang, "finish_brushed")],
          ["matte", t(lang, "finish_matte")],
          ["gloss", t(lang, "finish_gloss")],
        ], view.body_finish)}
        ${this.#colorField("body_color", "editor_body", view.body_color)}
        ${this.#colorField("base_color", "editor_base", view.base_color)}
        ${this.#colorField("ring_color", "editor_ring", view.ring_color)}
        ${this.#colorField("warning_color", "editor_warning", view.warning_color)}

        <h3>${t(lang, "editor_section_options")}</h3>
        ${this.#numberField("low_battery", "editor_low", "editor_low_help", view.low_battery)}
        ${this.#check("show_name", "editor_show_name", view.show_name)}
        ${this.#check("show_state", "editor_show_state", view.show_state)}
        ${this.#check("show_battery", "editor_show_battery", view.show_battery)}
        ${this.#check("show_door", "editor_show_door", view.show_door)}
        ${this.#check("show_buttons", "editor_show_buttons", view.show_buttons)}
        ${this.#check("confirm_open", "editor_confirm", view.confirm_open)}
      </div>
    `;
  }

  #locks(): string[] {
    return Object.keys(this.#hass?.states ?? {})
      .filter((id) => id.startsWith("lock."))
      .sort();
  }

  #entityHint(lang: ReturnType<typeof resolveLanguage>, locks: string[]): string {
    const base = t(lang, "editor_entity_help");
    if (locks.length === 1) return `${base} ${t(lang, "auto_one", { entity: locks[0]! })}`;
    if (locks.length === 0) return `${base} ${t(lang, "auto_none")}`;
    return `${base} ${t(lang, "auto_many")}`;
  }

  #entityField(key: PickerKey, domains: string[], label: MessageKey, help: string) {
    const lang = resolveLanguage(viewConfig(this.#config).language, this.#hass);
    const value = (this.#config[key] as string | undefined) ?? "";
    const labelText = t(lang, label);
    if (this.#nativePicker && this.#hass && customElements.get("ha-entity-picker")) {
      return html`
        <ha-entity-picker
          .hass=${this.#hass}
          .label=${labelText}
          .helper=${help}
          .includeDomains=${domains}
          .value=${value}
          allow-custom-entity
          @value-changed=${(ev: CustomEvent<{ value?: string }>) => {
            ev.stopPropagation();
            this.#patch(key, ev.detail?.value ?? "");
          }}
        ></ha-entity-picker>
      `;
    }
    if (this.#nativePicker && this.#hass && customElements.get("ha-selector")) {
      return html`
        <ha-selector
          .hass=${this.#hass}
          .label=${labelText}
          .helper=${help}
          .selector=${{ entity: { domain: domains } }}
          .value=${value}
          @value-changed=${(ev: CustomEvent<{ value?: string }>) => {
            ev.stopPropagation();
            this.#patch(key, ev.detail?.value ?? "");
          }}
        ></ha-selector>
      `;
    }
    const options = Object.keys(this.#hass?.states ?? {})
      .filter((id) => domains.some((domain) => id.startsWith(`${domain}.`)))
      .sort();
    return html`
      <div>
        <label for=${key}>${labelText}</label>
        <select
          id=${key}
          .value=${value}
          @change=${(ev: Event) => this.#patch(key, (ev.target as HTMLSelectElement).value)}
        >
          <option value="" ?selected=${value === ""}>${t(lang, "blank_auto")}</option>
          ${options.map(
            (id) => html`<option value=${id} ?selected=${id === value}>${this.#optionLabel(id)}</option>`,
          )}
          ${value && !options.includes(value)
            ? html`<option value=${value} selected>${value}</option>`
            : nothing}
        </select>
        <div class="helper">${help}</div>
      </div>
    `;
  }

  #optionLabel(entityId: string): string {
    const name = this.#hass?.states[entityId]?.attributes?.friendly_name;
    return typeof name === "string" && name !== entityId ? `${name} (${entityId})` : entityId;
  }

  #textField(key: "name", label: MessageKey, help: MessageKey, value: string) {
    const lang = resolveLanguage(viewConfig(this.#config).language, this.#hass);
    return html`
      <div>
        <label for=${key}>${t(lang, label)}</label>
        <input
          id=${key}
          type="text"
          .value=${value}
          @input=${(ev: Event) => this.#patch(key, (ev.target as HTMLInputElement).value)}
        />
        <div class="helper">${t(lang, help)}</div>
      </div>
    `;
  }

  #selectField(
    key: "language" | "body_finish",
    label: MessageKey,
    choices: Array<[string, string]>,
    value: string,
  ) {
    const lang = resolveLanguage(viewConfig(this.#config).language, this.#hass);
    return html`
      <div>
        <label for=${key}>${t(lang, label)}</label>
        <select
          id=${key}
          .value=${value}
          @change=${(ev: Event) => this.#patch(key, (ev.target as HTMLSelectElement).value)}
        >
          ${choices.map(
            ([item, text]) => html`<option value=${item} ?selected=${item === value}>${text}</option>`,
          )}
        </select>
      </div>
    `;
  }

  #colorField(key: "body_color" | "base_color" | "ring_color" | "warning_color", label: MessageKey, value: string) {
    const lang = resolveLanguage(viewConfig(this.#config).language, this.#hass);
    const hex = /^#[0-9a-f]{6}$/.test(value) ? value : DEFAULTS[key];
    return html`
      <div>
        <label for=${key}>${t(lang, label)}</label>
        <div class="color">
          <input
            id=${key}
            type="color"
            .value=${hex}
            @input=${(ev: Event) => this.#patch(key, (ev.target as HTMLInputElement).value)}
          />
          <code>${value}</code>
        </div>
      </div>
    `;
  }

  #numberField(key: "low_battery", label: MessageKey, help: MessageKey, value: number) {
    const lang = resolveLanguage(viewConfig(this.#config).language, this.#hass);
    return html`
      <div>
        <label for=${key}>${t(lang, label)}</label>
        <input
          id=${key}
          type="number"
          min="0"
          max="100"
          step="1"
          .value=${String(value)}
          @change=${(ev: Event) => this.#patch(key, Number((ev.target as HTMLInputElement).value))}
        />
        <div class="helper">${t(lang, help)}</div>
      </div>
    `;
  }

  #check(key: "show_name" | "show_state" | "show_battery" | "show_door" | "show_buttons" | "confirm_open", label: MessageKey, checked: boolean) {
    const lang = resolveLanguage(viewConfig(this.#config).language, this.#hass);
    return html`
      <label class="check">
        <input
          type="checkbox"
          .checked=${checked}
          @change=${(ev: Event) => this.#patch(key, (ev.target as HTMLInputElement).checked)}
        />
        ${t(lang, label)}
      </label>
    `;
  }

  #patch(key: keyof NukiCardConfig, value: unknown): void {
    const next: NukiCardConfig = { ...this.#config };
    const cleaned = cleanConfigValue(key, value);
    if (cleaned === undefined) delete next[key];
    else Object.assign(next, { [key]: cleaned });
    const same = JSON.stringify(next) === JSON.stringify(this.#config);
    if (same) return;
    this.#config = next;
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  async #loadPickers(): Promise<void> {
    if (customElements.get("ha-entity-picker") || customElements.get("ha-selector")) {
      if (!this.#nativePicker) {
        this.#nativePicker = true;
        this.requestUpdate();
      }
      return;
    }
    const loader = (window as unknown as { loadCardHelpers?: () => Promise<{ createCardElement?: (config: unknown) => Promise<{ constructor: { getConfigElement?: () => unknown } }> }> }).loadCardHelpers;
    if (!loader) return;
    try {
      const helpers = await loader();
      const card = await helpers.createCardElement?.({ type: "entities", entities: [] });
      await card?.constructor?.getConfigElement?.();
    } catch {
      /* Running outside the dashboard editor. */
    }
    const ready = Boolean(customElements.get("ha-entity-picker") || customElements.get("ha-selector"));
    if (ready !== this.#nativePicker) {
      this.#nativePicker = ready;
      this.requestUpdate();
    }
  }
}

if (!customElements.get("nuki-lock-card-editor")) {
  customElements.define("nuki-lock-card-editor", NukiLockCardEditor);
}
