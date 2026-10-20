import type { LockVisual } from "./types";

export interface FaceModel {
  /** Lit arc, degrees clockwise from 12 o'clock. */
  arcStart: number;
  arcEnd: number;
  /** Top status segment: lit with the ring, dark, warning, or dim. */
  pip: "on" | "off" | "warn" | "dim";
  /** Whole ring uses the warning color and blinks. */
  alarm: boolean;
  /** Dim blink for unavailable / unknown. */
  dim: boolean;
  /** Chasing light while the motor is moving. */
  spin: "cw" | "ccw" | null;
  /** Gentle breathe while the latch is open. */
  pulse: boolean;
  /** Blink only the top segment (critical battery or a separate jam sensor). */
  pipBlink: boolean;
}

/**
 * 5th-gen ring language: a full circle means locked, a three-quarter circle
 * with the gap kept at the top means unlocked. The top segment is the status
 * LED (errors and warnings on the real lock).
 */
export function faceModel(mode: LockVisual, alertPip: boolean): FaceModel {
  const moving = mode === "locking" || mode === "unlocking" || mode === "opening";
  const alarm = mode === "jammed";
  const dim = mode === "unavailable" || mode === "unknown";

  let arcStart = 12;
  let arcEnd = 348;
  let pip: FaceModel["pip"] = "on";

  if (mode === "unlocked" || moving) {
    arcStart = 46;
    arcEnd = 314;
    pip = "off";
  } else if (mode === "open") {
    arcStart = 68;
    arcEnd = 292;
    pip = "off";
  } else if (alarm) {
    pip = "warn";
  } else if (dim) {
    pip = "dim";
  }

  if (alertPip && !alarm && !dim) {
    pip = "warn";
  }

  return {
    arcStart,
    arcEnd,
    pip,
    alarm,
    dim,
    spin: mode === "unlocking" ? "ccw" : moving ? "cw" : null,
    pulse: mode === "open",
    pipBlink: alertPip && !alarm && !dim,
  };
}

export function visualFromLockState(state: string | undefined): LockVisual {
  switch (state) {
    case "locked":
    case "unlocked":
    case "locking":
    case "unlocking":
    case "opening":
    case "open":
    case "jammed":
    case "unavailable":
    case "unknown":
      return state;
    default:
      return state ? "unknown" : "unavailable";
  }
}
