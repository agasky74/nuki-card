import { describe, expect, it } from "vitest";
import { arcPath, polar } from "./geometry";
import { resolveLanguage, t } from "./i18n";
import { faceModel, visualFromLockState } from "./model";
import { cleanConfigValue, normalizeColor, viewConfig } from "./options";

describe("geometry", () => {
  it("puts 0° at 12 o'clock", () => {
    const point = polar(100, 100, 70, 0);
    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(30);
  });

  it("uses the large-arc flag only past 180°", () => {
    expect(arcPath(100, 100, 70, 0, 90)).toContain(" 0 0 1 ");
    expect(arcPath(100, 100, 70, 12, 348)).toContain(" 0 1 1 ");
  });
});

describe("face model", () => {
  it("draws a full ring when locked and a top gap when unlocked", () => {
    const locked = faceModel("locked", false);
    const unlocked = faceModel("unlocked", false);
    expect(locked.arcEnd - locked.arcStart).toBeGreaterThan(300);
    expect(unlocked.arcEnd - unlocked.arcStart).toBeLessThan(280);
    expect(unlocked.arcStart).toBeGreaterThan(40);
    expect(locked.pip).toBe("on");
    expect(unlocked.pip).toBe("off");
    expect(locked.spin).toBeNull();
  });

  it("animates transitional states and alarms", () => {
    expect(faceModel("locking", false).spin).toBe("cw");
    expect(faceModel("unlocking", false).spin).toBe("ccw");
    expect(faceModel("opening", false).spin).toBe("cw");
    expect(faceModel("jammed", false).alarm).toBe(true);
    expect(faceModel("unavailable", false).dim).toBe(true);
    expect(faceModel("open", false).pulse).toBe(true);
  });

  it("blinks only the top segment for a battery warning", () => {
    const model = faceModel("locked", true);
    expect(model.alarm).toBe(false);
    expect(model.pip).toBe("warn");
    expect(model.pipBlink).toBe(true);
  });

  it("maps unknown lock states to unknown", () => {
    expect(visualFromLockState("locking")).toBe("locking");
    expect(visualFromLockState("not-a-state")).toBe("unknown");
    expect(visualFromLockState(undefined)).toBe("unavailable");
  });
});

describe("i18n", () => {
  it("defaults to Spanish and falls back to English for auto non-Spanish", () => {
    expect(resolveLanguage(undefined, { language: "en" })).toBe("es");
    expect(resolveLanguage("auto", { locale: { language: "en" } })).toBe("en");
    expect(resolveLanguage("auto", { language: "es" })).toBe("es");
    expect(t("es", "locked")).toBe("Bloqueado");
    expect(t("en", "action_open")).toBe("Open");
  });
});

describe("options", () => {
  it("fills defaults without writing them back", () => {
    const view = viewConfig({ entity: " lock.entrada " });
    expect(view.entity).toBe("lock.entrada");
    expect(view.ring_color).toBe("#ffffff");
    expect(view.body_finish).toBe("brushed");
    expect(view.confirm_open).toBe(true);
    expect(view.language).toBe("es");
    expect(cleanConfigValue("ring_color", "#ffffff")).toBeUndefined();
    expect(cleanConfigValue("ring_color", "#7ec8ff")).toBe("#7ec8ff");
    expect(cleanConfigValue("confirm_open", false)).toBe(false);
    expect(cleanConfigValue("language", "es")).toBeUndefined();
    expect(cleanConfigValue("language", "en")).toBe("en");
  });

  it("rejects colors that are not a single css color", () => {
    expect(normalizeColor("#ABCDEF", "#000000")).toBe("#abcdef");
    expect(normalizeColor("red; background: url(x)", "#000000")).toBe("#000000");
  });
});
