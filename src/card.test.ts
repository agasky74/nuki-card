/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it } from "vitest";
import { NukiLockCard } from "./nuki-lock-card";
import type { HomeAssistant } from "./types";

function hass(state: string, battery = "78"): HomeAssistant {
  return {
    language: "es",
    locale: { language: "es" },
    states: {
      "lock.entrada": {
        entity_id: "lock.entrada",
        state,
        attributes: { friendly_name: "Puerta principal", supported_features: 1 },
      },
      "sensor.teclado_bateria": {
        entity_id: "sensor.teclado_bateria",
        state: "15",
        attributes: { friendly_name: "Teclado Batería", device_class: "battery", unit_of_measurement: "%" },
      },
      "sensor.entrada_bateria": {
        entity_id: "sensor.entrada_bateria",
        state: battery,
        attributes: { friendly_name: "Puerta principal Batería", device_class: "battery", unit_of_measurement: "%" },
      },
      "binary_sensor.entrada_ventana": {
        entity_id: "binary_sensor.entrada_ventana",
        state: "on",
        attributes: { friendly_name: "Ventana", device_class: "window" },
      },
      "binary_sensor.entrada_puerta": {
        entity_id: "binary_sensor.entrada_puerta",
        state: "off",
        attributes: { friendly_name: "Puerta", device_class: "door" },
      },
    },
    entities: {
      "lock.entrada": { entity_id: "lock.entrada", device_id: "dev-1" },
      "sensor.teclado_bateria": { entity_id: "sensor.teclado_bateria", device_id: "dev-1" },
      "sensor.entrada_bateria": { entity_id: "sensor.entrada_bateria", device_id: "dev-1" },
      "binary_sensor.entrada_ventana": { entity_id: "binary_sensor.entrada_ventana", device_id: "dev-1" },
      "binary_sensor.entrada_puerta": { entity_id: "binary_sensor.entrada_puerta", device_id: "dev-1" },
    },
    callService: () => undefined,
  };
}

async function mount(config: Record<string, unknown>, home: HomeAssistant): Promise<NukiLockCard> {
  const card = document.createElement("nuki-lock-card") as NukiLockCard;
  document.body.append(card);
  card.setConfig(config);
  card.hass = home;
  await card.updateComplete;
  return card;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("nuki-lock-card", () => {
  it("registers itself for the card picker", () => {
    expect(window.customCards?.some((card) => card.type === "nuki-lock-card")).toBe(true);
    expect(NukiLockCard.getStubConfig(hass("locked"))).toEqual({ entity: "lock.entrada" });
  });

  it("renders the lock, the device battery and the door — not the keypad or the window", async () => {
    const card = await mount({ entity: "lock.entrada" }, hass("locked"));
    const text = card.shadowRoot?.textContent ?? "";
    expect(text).toContain("Puerta principal");
    expect(text).toContain("Bloqueado");
    expect(text).toContain("78 %");
    expect(text).not.toContain("15 %");
    expect(text).toContain("Puerta cerrada");
    expect(text).toContain("Bloquear");
    expect(text).toContain("Desbloquear");
    expect(text).toContain("Abrir");
  });

  it("auto-selects the only lock", async () => {
    const card = await mount({}, hass("unlocked"));
    expect(card.shadowRoot?.textContent).toContain("Desbloqueado");
  });

  it("asks for a choice when several locks exist and none is configured", async () => {
    const home = hass("locked");
    home.states["lock.trasera"] = {
      entity_id: "lock.trasera",
      state: "locked",
      attributes: { friendly_name: "Trasera" },
    };
    const card = await mount({}, home);
    expect(card.shadowRoot?.textContent).toContain("Hay varias cerraduras");
  });

  it("switches to English labels", async () => {
    const card = await mount({ entity: "lock.entrada", language: "en" }, hass("jammed", "12"));
    const text = card.shadowRoot?.textContent ?? "";
    expect(text).toContain("Jammed");
    expect(text).toContain("Lock");
    expect(text).toContain("12 %");
  });

  it("confirms before unlatch, then calls lock.open", async () => {
    const calls: string[] = [];
    const home = hass("locked");
    home.callService = async (_domain, service) => {
      calls.push(service);
    };
    const card = await mount({ entity: "lock.entrada" }, home);
    const buttons = Array.from(card.shadowRoot!.querySelectorAll("button.action")) as HTMLButtonElement[];
buttons[2]!.click();
  await Promise.resolve();
  await card.updateComplete;
  expect(card.shadowRoot?.textContent).toContain("Abrir pestillo");
    expect(calls).toEqual([]);
    const confirm = Array.from(card.shadowRoot!.querySelectorAll(".modal-actions button")).at(-1) as HTMLButtonElement;
    confirm.click();
    await card.updateComplete;
    await Promise.resolve();
    expect(calls).toEqual(["open"]);
  });

  it("locks without a confirmation dialog", async () => {
    const calls: string[] = [];
    const home = hass("unlocked");
    home.callService = async (_domain, service, data) => {
      calls.push(`${service}:${(data as { entity_id: string }).entity_id}`);
    };
    const card = await mount({ entity: "lock.entrada" }, home);
    const lock = card.shadowRoot!.querySelector("button.action") as HTMLButtonElement;
    lock.click();
    await card.updateComplete;
    await Promise.resolve();
    expect(calls).toEqual(["lock:lock.entrada"]);
    expect(card.shadowRoot?.querySelector(".modal")).toBeNull();
  });

  it("hides unlatch when the lock does not advertise open", async () => {
    const home = hass("locked");
    home.states["lock.entrada"].attributes.supported_features = 0;
    const card = await mount({ entity: "lock.entrada" }, home);
    const labels = Array.from(card.shadowRoot!.querySelectorAll("button.action")).map((button) => button.textContent?.trim());
    expect(labels).toEqual(["Bloquear", "Desbloquear"]);
  });

  it("rejects an entity outside the lock domain", () => {
    const card = document.createElement("nuki-lock-card") as NukiLockCard;
    expect(() => card.setConfig({ entity: "sensor.entrada_bateria" })).toThrow(/lock/);
  });
});
