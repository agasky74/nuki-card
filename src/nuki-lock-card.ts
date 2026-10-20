import { LitElement, css, html, nothing } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "./editor";
import "./face";
import { batteryPercent, doorPosition, isOn, resolveEntities } from "./discover";
import { resolveLanguage, stateMessageKey, t, type Lang } from "./i18n";
import { visualFromLockState } from "./model";
import { viewConfig } from "./options";
import type { HomeAssistant, NukiCardConfig, ResolvedEntities } from "./types";

const LOCK_OPEN_FEATURE = 1;

interface CardHelpers {
  showConfirmationDialog?: (
    element: HTMLElement,
    params: Record<string, unknown>,
  ) => Promise<boolean> | undefined;
}

function windowWithHelpers(): { loadCardHelpers?: () => Promise<CardHelpers> } {
  return window as unknown as { loadCardHelpers?: () => Promise<CardHelpers> };
}

/** `fallback` means the dashboard dialog is not available and the card should draw its own. */
async function confirmUnlatch(element: HTMLElement, lang: Lang): Promise<boolean | "fallback"> {
  const title = t(lang, "confirm_title");
  const text = t(lang, "confirm_text");
  const confirmText = t(lang, "confirm");
  const dismissText = t(lang, "cancel");
  const load = windowWithHelpers().loadCardHelpers;
  if (!load) return "fallback";
  try {
    const helpers = await load();
    if (!helpers?.showConfirmationDialog) return "fallback";
    return await new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (value: boolean) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      const result = helpers.showConfirmationDialog!(element, {
        title,
        text,
        confirmText,
        dismissText,
        confirm: () => finish(true),
        cancel: () => finish(false),
      });
      if (result && typeof result.then === "function") {
        result.then(
          (value) => finish(Boolean(value)),
          () => finish(false),
        );
      }
    });
  } catch {
    return "fallback";
  }
}

export class NukiLockCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--ha-font-family, var(--primary-font-family, system-ui, sans-serif));
      --nuki-muted: var(--secondary-text-color, #727272);
    }
    ha-card {
      height: 100%;
    }
    .wrap {
      position: relative;
      box-sizing: border-box;
      padding: 16px 16px 14px;
      color: var(--primary-text-color, #212121);
      container-type: inline-size;
    }
    .name {
      margin: 0 0 4px;
      text-align: center;
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    .knob {
      width: min(232px, 86%);
      margin: 6px auto 10px;
      padding: 0;
      border: 0;
      background: transparent;
      display: block;
      cursor: pointer;
      border-radius: 50%;
      filter: drop-shadow(0 10px 12px rgba(0, 0, 0, 0.28));
    }
    .knob:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 6px;
    }
    .knob.static {
      cursor: default;
    }
    .state {
      margin: 0;
      text-align: center;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.01em;
      line-height: 1.2;
    }
    .state.warn {
      color: var(--nuki-warn, #ff3b30);
    }
    .state.dim {
      color: var(--nuki-muted);
    }
    .meta {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      min-height: 0;
    }
    .door,
    .battery {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      font-size: 13px;
      line-height: 1.2;
      color: var(--nuki-muted);
      font-variant-numeric: tabular-nums;
    }
    .door.open {
      color: var(--primary-text-color, #212121);
      font-weight: 600;
    }
    .battery.warn {
      color: var(--nuki-warn, #ff3b30);
      font-weight: 600;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      margin-top: 6px;
      padding: 2px 8px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--nuki-warn, #ff3b30) 16%, transparent);
      color: var(--nuki-warn, #ff3b30);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .message {
      margin: 8px 0 0;
      text-align: center;
      font-size: 14px;
      line-height: 1.4;
      color: var(--nuki-muted);
    }
    .actions {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 14px;
    }
    .actions.two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    button.action {
      appearance: none;
      border: 0;
      border-radius: 12px;
      min-height: 42px;
      padding: 8px 4px;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.15;
      cursor: pointer;
      color: var(--primary-text-color, #212121);
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
    }
    button.action.active {
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
      background: color-mix(in srgb, var(--nuki-ring, #fff) 22%, var(--secondary-background-color, #ececec));
      box-shadow: inset 0 0 0 2px var(--nuki-ring, var(--primary-color, #03a9f4));
    }
    button.action:hover:not(:disabled) {
      filter: brightness(1.04);
    }
    button.action:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }
    button.action:disabled {
      opacity: 0.45;
      cursor: default;
    }
    .modal-back {
      position: absolute;
      inset: 0;
      z-index: 4;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgba(0, 0, 0, 0.48);
      border-radius: inherit;
    }
    .modal {
      width: min(280px, 100%);
      box-sizing: border-box;
      padding: 16px;
      border-radius: 16px;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      color: var(--primary-text-color, #212121);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.32);
    }
    .modal h2 {
      margin: 0 0 8px;
      font-size: 18px;
    }
    .modal p {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      color: var(--nuki-muted);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    .modal-actions button {
      appearance: none;
      border: 0;
      border-radius: 10px;
      padding: 8px 12px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
      color: var(--primary-text-color, #212121);
    }
    .modal-actions button.confirm {
      background: var(--nuki-warn, #ff3b30);
      color: #fff;
    }
    @container (max-width: 280px) {
      .actions {
        grid-template-columns: 1fr;
      }
      .state {
        font-size: 18px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      button.action {
        transition: none;
      }
    }
  `;

  #hass?: HomeAssistant;
  #config?: NukiCardConfig;
  #busy = false;
  #confirming = false;
  /** True when Home Assistant's dialog helper is unavailable and we draw our own. */
  #localConfirm = false;

  set hass(value: HomeAssistant) {
    this.#hass = value;
    this.requestUpdate();
  }
  get hass(): HomeAssistant | undefined {
    return this.#hass;
  }

  setConfig(config: NukiCardConfig): void {
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("Configuración no válida");
    }
    if (config.entity != null && config.entity !== "") {
      if (typeof config.entity !== "string" || !config.entity.trim().startsWith("lock.")) {
        throw new Error("La entidad debe pertenecer al dominio lock (lock.xxx)");
      }
    }
    this.#config = config;
    this.requestUpdate();
  }

  getCardSize(): number {
    return 8;
  }

  getGridOptions(): Record<string, unknown> {
    return { columns: 6, min_columns: 6, max_columns: 12 };
  }

  /** Older sections layout API. */
  getLayoutOptions(): Record<string, unknown> {
    return this.getGridOptions();
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("nuki-lock-card-editor");
  }

  static getStubConfig(hass?: HomeAssistant): NukiCardConfig {
    const locks = Object.keys(hass?.states ?? {})
      .filter((id) => id.startsWith("lock."))
      .sort();
    const ready = locks.find((id) => {
      const state = hass?.states[id]?.state;
      return state && state !== "unavailable" && state !== "unknown";
    });
    const entity = ready ?? locks[0];
    return entity ? { entity } : {};
  }

  render() {
    if (!this.#config) return html``;
    const view = viewConfig(this.#config);
    const lang = resolveLanguage(view.language, this.#hass);
    const resolved = this.#hass ? resolveEntities(this.#hass, this.#config) : { missing: "none" as const };
    const stateObj = resolved.lock && this.#hass ? this.#hass.states[resolved.lock] : undefined;
    const visual = visualFromLockState(stateObj?.state);
    const jammedOn = resolved.jammed ? isOn(this.#hass?.states[resolved.jammed]?.state) : false;
    const criticalOn = resolved.batteryCritical ? isOn(this.#hass?.states[resolved.batteryCritical]?.state) : false;
    const charging = resolved.charging ? isOn(this.#hass?.states[resolved.charging]?.state) : false;
    const percent = resolved.battery ? batteryPercent(this.#hass?.states[resolved.battery]?.state) : null;
    const low = percent != null && percent <= view.low_battery;
    const alert = criticalOn || low || (jammedOn && visual !== "jammed");
    const title =
      view.name ||
      (typeof stateObj?.attributes.friendly_name === "string" ? stateObj.attributes.friendly_name : undefined) ||
      resolved.lock;
    const features = stateObj?.attributes.supported_features;
    const canOpen = typeof features !== "number" || (features & LOCK_OPEN_FEATURE) !== 0;
    const controlsDisabled =
      !resolved.lock || !stateObj || visual === "unavailable" || visual === "unknown" || this.#busy;
    const active =
      visual === "locked" || visual === "locking"
        ? "lock"
        : visual === "unlocked" || visual === "unlocking"
          ? "unlock"
          : visual === "open" || visual === "opening"
            ? "open"
            : null;
    const door = resolved.door ? doorPosition(this.#hass?.states[resolved.door]?.state) : undefined;
    const notice = this.#notice(lang, resolved, Boolean(stateObj));

    return html`
      <ha-card>
        <div
          class="wrap"
          style=${styleMap({
            "--nuki-ring": view.ring_color,
            "--nuki-warn": view.warning_color,
          })}
        >
          ${view.show_name && title ? html`<div class="name">${title}</div>` : nothing}
          ${resolved.lock
            ? html`
                <button
                  type="button"
                  class="knob"
                  aria-label=${t(lang, "more_info", { name: title || resolved.lock })}
                  @click=${() => this.#moreInfo(resolved.lock!)}
                >
                  ${this.#face(view, visual, alert)}
                </button>
              `
            : html`<div class="knob static">${this.#face(view, "unavailable", false)}</div>`}
          ${view.show_state
            ? html`<p class="state ${visual === "jammed" ? "warn" : visual === "unavailable" || visual === "unknown" ? "dim" : ""}" aria-live="polite">
                ${stateObj ? t(lang, stateMessageKey(stateObj.state)) : t(lang, "unavailable")}
              </p>`
            : nothing}
          ${notice ? html`<p class="message">${notice}</p>` : nothing}
          ${jammedOn && visual !== "jammed" ? html`<div class="chip">${t(lang, "jammed_alert")}</div>` : nothing}
          <div class="meta">
            ${view.show_door && door
              ? html`<p class="door ${door === "open" ? "open" : ""}">
                  ${door === "open" ? doorIcon(true) : doorIcon(false)}
                  ${door === "open" ? t(lang, "door_open") : door === "closed" ? t(lang, "door_closed") : t(lang, "door_unavailable")}
                </p>`
              : nothing}
            ${view.show_battery && (resolved.battery || resolved.batteryCritical)
              ? html`<p class="battery ${low || criticalOn ? "warn" : ""}">
                  ${batteryIcon(percent)}
                  ${percent != null ? `${Math.round(percent)} %` : criticalOn ? t(lang, "battery_critical") : "—"}
                  ${charging ? html`<span>· ${t(lang, "charging")}</span>` : nothing}
                </p>`
              : nothing}
          </div>
          ${view.show_buttons
            ? html`
                <div class="actions ${canOpen ? "" : "two"}">
                  <button
                    type="button"
                    class="action ${active === "lock" ? "active" : ""}"
                    ?disabled=${controlsDisabled}
                    @click=${() => this.#act("lock")}
                  >
                    ${t(lang, "action_lock")}
                  </button>
                  <button
                    type="button"
                    class="action ${active === "unlock" ? "active" : ""}"
                    ?disabled=${controlsDisabled}
                    @click=${() => this.#act("unlock")}
                  >
                    ${t(lang, "action_unlock")}
                  </button>
                  ${canOpen
                    ? html`
                        <button
                          type="button"
                          class="action ${active === "open" ? "active" : ""}"
                          title=${t(lang, "confirm_title")}
                          ?disabled=${controlsDisabled}
                          @click=${() => this.#act("open")}
                        >
                          ${t(lang, "action_open")}
                        </button>
                      `
                    : nothing}
                </div>
              `
            : nothing}
          ${this.#confirming && this.#localConfirm
            ? html`
                <div class="modal-back">
                  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="nuki-confirm-title">
                    <h2 id="nuki-confirm-title">${t(lang, "confirm_title")}</h2>
                    <p>${t(lang, "confirm_text")}</p>
                    <div class="modal-actions">
                      <button type="button" @click=${() => this.#closeConfirm()}>${t(lang, "cancel")}</button>
                      <button type="button" class="confirm" @click=${() => this.#acceptConfirm()}>
                        ${t(lang, "confirm")}
                      </button>
                    </div>
                  </div>
                </div>
              `
            : nothing}
        </div>
      </ha-card>
    `;
  }

  #face(
    view: ReturnType<typeof viewConfig>,
    visual: ReturnType<typeof visualFromLockState>,
    alert: boolean,
  ) {
    return html`
      <nuki-lock-face
        .mode=${visual}
        .bodyColor=${view.body_color}
        .finish=${view.body_finish}
        .baseColor=${view.base_color}
        .ringColor=${view.ring_color}
        .warningColor=${view.warning_color}
        .alert=${alert}
      ></nuki-lock-face>
    `;
  }

  #notice(lang: Lang, resolved: ResolvedEntities, hasState: boolean): string | null {
    if (!this.#hass) return null;
    if (resolved.lock && hasState) return null;
    if (resolved.lock && !hasState) return t(lang, "not_found", { entity: resolved.lock });
    if (resolved.missing === "many") return t(lang, "many_locks");
    return t(lang, "no_locks");
  }

  #moreInfo(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  async #act(service: "lock" | "unlock" | "open"): Promise<void> {
    if (!this.#hass || !this.#config || this.#busy) return;
    const entity = resolveEntities(this.#hass, this.#config).lock;
    if (!entity) return;
    if (service === "open" && viewConfig(this.#config).confirm_open) {
      const answer = await confirmUnlatch(this, resolveLanguage(viewConfig(this.#config).language, this.#hass));
      if (answer === "fallback") {
        this.#localConfirm = true;
        this.#confirming = true;
        this.requestUpdate();
        return;
      }
      if (!answer) return;
    }
    await this.#call(service, entity);
  }

  async #acceptConfirm(): Promise<void> {
    this.#confirming = false;
    this.#localConfirm = false;
    const entity = this.#hass && this.#config ? resolveEntities(this.#hass, this.#config).lock : undefined;
    if (entity) await this.#call("open", entity);
    else this.requestUpdate();
  }

  #closeConfirm(): void {
    this.#confirming = false;
    this.#localConfirm = false;
    this.requestUpdate();
  }

  async #call(service: "lock" | "unlock" | "open", entity: string): Promise<void> {
    if (!this.#hass) return;
    this.#busy = true;
    this.requestUpdate();
    try {
      await this.#hass.callService("lock", service, { entity_id: entity });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.dispatchEvent(
        new CustomEvent("hass-notification", {
          detail: { message },
          bubbles: true,
          composed: true,
        }),
      );
    } finally {
      this.#busy = false;
      this.requestUpdate();
    }
  }
}

function batteryIcon(percent: number | null) {
  const width = percent == null ? 0 : Math.max(0, Math.min(20, (percent / 100) * 20));
  return html`
    <svg width="26" height="13" viewBox="0 0 28 14" aria-hidden="true">
      <rect x="0.75" y="0.75" width="23.5" height="12.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"></rect>
      <rect x="25" y="4" width="2.2" height="6" rx="0.6" fill="currentColor"></rect>
      <rect x="2.2" y="2.2" width=${width.toFixed(2)} height="9.6" rx="1" fill="currentColor"></rect>
    </svg>
  `;
}

function doorIcon(open: boolean) {
  return html`
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      ${open
        ? html`<path d="M3 2.5h5.2v9H3z" fill="none" stroke="currentColor" stroke-width="1.4"></path>
            <path d="M8.2 2.5 11.5 4v7.2L8.2 11.5" fill="none" stroke="currentColor" stroke-width="1.4"></path>`
        : html`<rect x="3.2" y="2" width="7.6" height="10" rx="0.6" fill="none" stroke="currentColor" stroke-width="1.4"></rect>
            <circle cx="9" cy="7.2" r="0.7" fill="currentColor"></circle>`}
    </svg>
  `;
}

if (!customElements.get("nuki-lock-card")) {
  customElements.define("nuki-lock-card", NukiLockCard);
}

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description?: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "nuki-lock-card")) {
  window.customCards.push({
    type: "nuki-lock-card",
    name: "Nuki Lock",
    description: "Nuki Smart Lock Pro (5.ª generación): anillo LED, batería y puerta",
    preview: true,
    documentationURL: "https://github.com/agasky74/nuki-card",
  });
}
