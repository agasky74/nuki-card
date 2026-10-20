import { LitElement, css, svg } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { arcPath } from "./geometry";
import { faceModel } from "./model";
import type { Finish, LockVisual } from "./types";

const CX = 100;
const CY = 100;
const RING_R = 70;

/**
 * Front of a Nuki Smart Lock Pro (5th gen): brushed-metal knob,
 * interchangeable base ring, and the segmented LED circle.
 * Drawn with SVG — no product photography.
 */
export class NukiLockFace extends LitElement {
  static styles = css`
    :host {
      display: block;
      line-height: 0;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
    }
    .ring-group.blink {
      animation: nuki-blink 1.15s ease-in-out infinite;
    }
    .ring-group.dim-blink {
      animation: nuki-dim 2.4s ease-in-out infinite;
    }
    .ring-group.pulse {
      animation: nuki-pulse 2.6s ease-in-out infinite;
    }
    .pip.blink {
      animation: nuki-pip 1.2s ease-in-out infinite;
    }
    @keyframes nuki-blink {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.42;
      }
    }
    @keyframes nuki-dim {
      0%,
      100% {
        opacity: 0.4;
      }
      50% {
        opacity: 1;
      }
    }
    @keyframes nuki-pip {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.15;
      }
    }
    @keyframes nuki-pulse {
      0%,
      100% {
        opacity: 0.78;
      }
      50% {
        opacity: 1;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .ring-group.blink,
      .ring-group.dim-blink,
      .ring-group.pulse,
      .pip.blink {
        animation: none;
      }
    }
  `;

  #mode: LockVisual = "unavailable";
  #body = "#c5cad1";
  #finish: Finish = "brushed";
  #base = "#16171a";
  #ring = "#ffffff";
  #warn = "#ff3b30";
  #alert = false;

  get mode(): LockVisual {
    return this.#mode;
  }
  set mode(value: LockVisual) {
    if (this.#mode === value) return;
    this.#mode = value;
    this.requestUpdate();
  }

  get bodyColor(): string {
    return this.#body;
  }
  set bodyColor(value: string) {
    if (this.#body === value) return;
    this.#body = value;
    this.requestUpdate();
  }

  get finish(): Finish {
    return this.#finish;
  }
  set finish(value: Finish) {
    if (this.#finish === value) return;
    this.#finish = value;
    this.requestUpdate();
  }

  get baseColor(): string {
    return this.#base;
  }
  set baseColor(value: string) {
    if (this.#base === value) return;
    this.#base = value;
    this.requestUpdate();
  }

  get ringColor(): string {
    return this.#ring;
  }
  set ringColor(value: string) {
    if (this.#ring === value) return;
    this.#ring = value;
    this.requestUpdate();
  }

  get warningColor(): string {
    return this.#warn;
  }
  set warningColor(value: string) {
    if (this.#warn === value) return;
    this.#warn = value;
    this.requestUpdate();
  }

  get alert(): boolean {
    return this.#alert;
  }
  set alert(value: boolean) {
    if (this.#alert === value) return;
    this.#alert = value;
    this.requestUpdate();
  }

  render() {
    const model = faceModel(this.#mode, this.#alert);
    const ringColor = model.alarm ? this.#warn : model.dim ? "#9aa1a9" : this.#ring;
    const pipColor =
      model.pip === "warn" ? this.#warn : model.pip === "dim" ? "#9aa1a9" : model.pip === "on" ? ringColor : "#2c3036";
    const grain = this.#finish === "brushed" ? 0.55 : this.#finish === "gloss" ? 0.12 : 0;
    const sheen = this.#finish === "gloss" ? 0.85 : this.#finish === "matte" ? 0.22 : 0.5;
    const arc = arcPath(CX, CY, RING_R, model.arcStart, model.arcEnd);
    const pip = arcPath(CX, CY, RING_R, -9, 9);
    const comet = arcPath(CX, CY, RING_R, 0, 32);
    const reduce =
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const groupClass = model.alarm ? "ring-group blink" : model.dim ? "ring-group dim-blink" : model.pulse ? "ring-group pulse" : "ring-group";
    const spinFrom = model.spin === "ccw" ? "360 100 100" : "0 100 100";
    const spinTo = model.spin === "ccw" ? "0 100 100" : "360 100 100";

    return svg`
      <svg viewBox="0 0 200 200" role="presentation" aria-hidden="true">
        <defs>
          <radialGradient id="baseShade" cx="50%" cy="32%" r="75%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
            <stop offset="55%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.38" />
          </radialGradient>
          <radialGradient id="metalShade" cx="50%" cy="36%" r="68%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="${sheen}" />
            <stop offset="42%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.32" />
          </radialGradient>
          <linearGradient id="metalFall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
            <stop offset="48%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.22" />
          </linearGradient>
          <pattern id="grain" width="2.2" height="2.2" patternUnits="userSpaceOnUse">
            <rect width="2.2" height="2.2" fill="transparent" />
            <line x1="0.4" y1="0" x2="0.4" y2="2.2" stroke="#ffffff" stroke-opacity="0.45" stroke-width="0.35" />
            <line x1="1.4" y1="0" x2="1.4" y2="2.2" stroke="#000000" stroke-opacity="0.28" stroke-width="0.3" />
          </pattern>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
          <clipPath id="metalClip">
            <circle cx="${CX}" cy="${CY}" r="84" />
          </clipPath>
        </defs>

        <circle cx="${CX}" cy="${CY}" r="97" fill="${this.#base}" />
        <circle cx="${CX}" cy="${CY}" r="97" fill="url(#baseShade)" />
        <circle cx="${CX}" cy="${CY}" r="96.2" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.2" />
        <path
          d=${arcPath(CX, CY, 93, 206, 334)}
          fill="none"
          stroke="#ffffff"
          stroke-opacity="0.35"
          stroke-width="1.4"
          stroke-linecap="round"
        />

        <g clip-path="url(#metalClip)">
          <circle cx="${CX}" cy="${CY}" r="84" fill="${this.#body}" />
          <circle cx="${CX}" cy="${CY}" r="84" fill="url(#metalFall)" />
          <circle cx="${CX}" cy="${CY}" r="84" fill="url(#metalShade)" />
          <circle cx="${CX}" cy="${CY}" r="84" fill="url(#grain)" opacity="${grain}" />
          <ellipse cx="100" cy="62" rx="46" ry="22" fill="#ffffff" opacity="${this.#finish === "matte" ? 0.08 : 0.16}" />
        </g>
        <circle cx="${CX}" cy="${CY}" r="84" fill="none" stroke="#000000" stroke-opacity="0.28" stroke-width="1" />

        <circle
          cx="${CX}"
          cy="${CY}"
          r="${RING_R}"
          fill="none"
          stroke="#000000"
          stroke-opacity="0.38"
          stroke-width="11"
        />
        <circle
          cx="${CX}"
          cy="${CY}"
          r="${RING_R}"
          fill="none"
          stroke="#ffffff"
          stroke-opacity="0.08"
          stroke-width="11"
        />

        <g class=${groupClass} style=${styleMap({ opacity: model.dim ? "0.85" : "1" })}>
          <path
            d=${arc}
            fill="none"
            stroke=${ringColor}
            stroke-width="12"
            stroke-linecap="round"
            opacity="0.55"
            filter="url(#glow)"
          />
          <path
            d=${arc}
            fill="none"
            stroke=${ringColor}
            stroke-width="7"
            stroke-linecap="round"
          />
          <path
            d=${arc}
            fill="none"
            stroke="#ffffff"
            stroke-width="2.2"
            stroke-linecap="round"
            opacity=${model.alarm ? "0.45" : "0.82"}
          />
          <path
            class=${model.pipBlink ? "pip blink" : "pip"}
            d=${pip}
            fill="none"
            stroke=${pipColor}
            stroke-width=${model.pip === "off" ? "6" : "7.5"}
            stroke-linecap="round"
            opacity=${model.pip === "off" ? "0.95" : "1"}
            filter=${model.pip === "off" ? "none" : "url(#soft)"}
          />
        </g>

        ${
          model.spin
            ? svg`
                <g opacity="0.98">
                  ${
                    reduce
                      ? svg``
                      : svg`<animateTransform attributeName="transform" type="rotate" from=${spinFrom} to=${spinTo} dur="1.15s" repeatCount="indefinite" />`
                  }
                  <path d=${comet} fill="none" stroke=${ringColor} stroke-width="12" stroke-linecap="round" opacity="0.45" filter="url(#glow)" />
                  <path d=${comet} fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
                </g>
              `
            : svg``
        }

        <circle cx="${CX}" cy="${CY}" r="48" fill="none" stroke="#000000" stroke-opacity="0.14" stroke-width="1" />
        <circle cx="${CX}" cy="${CY}" r="47.2" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="0.6" />
      </svg>
    `;
  }
}

if (!customElements.get("nuki-lock-face")) {
  customElements.define("nuki-lock-face", NukiLockFace);
}
