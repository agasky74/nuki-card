import fs from "node:fs";

const file = "dist/nuki-card.js";
const js = fs.readFileSync(file, "utf8");
const required = [
  "nuki-lock-card",
  "nuki-lock-card-editor",
  "nuki-lock-face",
  "customCards",
  "getStubConfig",
  "getConfigElement",
  "device_id",
  "config-changed",
  "hass-more-info",
];

const missing = required.filter((token) => !js.includes(token));
if (missing.length) {
  console.error(`Bundle is missing: ${missing.join(", ")}`);
  process.exit(1);
}

if (/^\s*import\s/m.test(js)) {
  console.error("Bundle should not import other modules; HACS serves this single file");
  process.exit(1);
}

console.log(`bundle ok (${Math.round(js.length / 1024)} KiB)`);
