import { describe, expect, it } from "vitest";
import { batteryPercent, doorPosition, resolveEntities } from "./discover";
import type { HomeAssistant } from "./types";

function entity(
  id: string,
  state: string,
  attributes: Record<string, unknown>,
  deviceId: string,
) {
  return { id, state, attributes, deviceId };
}

function hass(items: ReturnType<typeof entity>[]): HomeAssistant {
  const states: HomeAssistant["states"] = {};
  const entities: NonNullable<HomeAssistant["entities"]> = {};
  for (const item of items) {
    states[item.id] = { entity_id: item.id, state: item.state, attributes: item.attributes };
    entities[item.id] = { entity_id: item.id, device_id: item.deviceId, name: String(item.attributes.friendly_name ?? "") };
  }
  return {
    states,
    entities,
    callService: () => undefined,
  };
}

const lock = entity("lock.entrada", "locked", { friendly_name: "Puerta principal" }, "dev-1");
const battery = entity(
  "sensor.entrada_bateria",
  "78",
  { friendly_name: "Puerta principal Batería", device_class: "battery", unit_of_measurement: "%" },
  "dev-1",
);
const keypad = entity(
  "sensor.teclado_bateria",
  "15",
  { friendly_name: "Teclado Batería", device_class: "battery", unit_of_measurement: "%" },
  "dev-1",
);
const otherBattery = entity(
  "sensor.otra_bateria",
  "9",
  { friendly_name: "Otra Batería", device_class: "battery", unit_of_measurement: "%" },
  "dev-2",
);
const door = entity(
  "binary_sensor.entrada_puerta",
  "off",
  { friendly_name: "Puerta principal Puerta", device_class: "door" },
  "dev-1",
);
const windowSensor = entity(
  "binary_sensor.entrada_ventana",
  "on",
  { friendly_name: "Ventana", device_class: "window" },
  "dev-1",
);
const critical = entity(
  "binary_sensor.entrada_battery_critical",
  "off",
  { friendly_name: "Puerta principal Battery critical", device_class: "battery" },
  "dev-1",
);
const doorCritical = entity(
  "binary_sensor.entrada_door_sensor_battery_critical",
  "on",
  { friendly_name: "Puerta principal Door Sensor Battery critical", device_class: "battery" },
  "dev-1",
);
const charging = entity(
  "binary_sensor.entrada_charging",
  "off",
  { friendly_name: "Puerta principal Battery charging", device_class: "battery_charging" },
  "dev-1",
);
const jammed = entity(
  "binary_sensor.entrada_atasco",
  "off",
  { friendly_name: "Atasco", device_class: "problem" },
  "dev-1",
);
const otherLock = entity("lock.trasera", "unlocked", { friendly_name: "Trasera" }, "dev-2");

const home = () =>
  hass([lock, keypad, otherBattery, battery, door, windowSensor, doorCritical, critical, charging, jammed, otherLock]);

describe("resolveEntities", () => {
  it("uses the configured lock and ignores sensors from another device", () => {
    const resolved = resolveEntities(home(), { entity: "lock.entrada" });
    expect(resolved.lock).toBe("lock.entrada");
    expect(resolved.battery).toBe("sensor.entrada_bateria");
    expect(resolved.door).toBe("binary_sensor.entrada_puerta");
    expect(resolved.jammed).toBe("binary_sensor.entrada_atasco");
    expect(resolved.batteryCritical).toBe("binary_sensor.entrada_battery_critical");
    expect(resolved.charging).toBe("binary_sensor.entrada_charging");
    expect(resolved.missing).toBeUndefined();
  });

  it("picks the only lock when entity is omitted", () => {
    const resolved = resolveEntities(hass([lock, keypad, battery, door]), {});
    expect(resolved.lock).toBe("lock.entrada");
    expect(resolved.battery).toBe("sensor.entrada_bateria");
  });

  it("does not guess when several locks exist and entity is omitted", () => {
    const resolved = resolveEntities(home(), {});
    expect(resolved.lock).toBeUndefined();
    expect(resolved.missing).toBe("many");
    expect(resolved.battery).toBeUndefined();
  });

  it("reports when there is no lock", () => {
    const resolved = resolveEntities(hass([battery]), {});
    expect(resolved.missing).toBe("none");
  });

  it("lets manual overrides win, even on another device", () => {
    const resolved = resolveEntities(home(), {
      entity: "lock.entrada",
      battery_entity: "sensor.otra_bateria",
      door_entity: "binary_sensor.entrada_ventana",
      jammed_entity: "",
    });
    expect(resolved.battery).toBe("sensor.otra_bateria");
    expect(resolved.door).toBe("binary_sensor.entrada_ventana");
    expect(resolved.jammed).toBe("binary_sensor.entrada_atasco");
  });

  it("still resolves the lock when the entity registry is missing", () => {
    const bare: HomeAssistant = {
      states: {
        "lock.entrada": { entity_id: "lock.entrada", state: "locked", attributes: {} },
      },
      callService: () => undefined,
    };
    const resolved = resolveEntities(bare, { entity: "lock.entrada" });
    expect(resolved.lock).toBe("lock.entrada");
    expect(resolved.battery).toBeUndefined();
    expect(resolved.door).toBeUndefined();
  });
});

describe("readings", () => {
  it("parses a battery percentage and rejects unknown", () => {
    expect(batteryPercent("78")).toBe(78);
    expect(batteryPercent("150")).toBe(100);
    expect(batteryPercent("unavailable")).toBeNull();
    expect(batteryPercent("n/a")).toBeNull();
  });

  it("maps door binary states", () => {
    expect(doorPosition("on")).toBe("open");
    expect(doorPosition("off")).toBe("closed");
    expect(doorPosition("unknown")).toBe("unavailable");
  });
});
