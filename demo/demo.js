if (!customElements.get("ha-card")) {
  customElements.define("ha-card", class extends HTMLElement {});
}

const SCENES = {
  locked: { label: "Bloqueado", state: "locked", battery: 78, door: "off", critical: "off" },
  unlocked: { label: "Desbloqueado", state: "unlocked", battery: 78, door: "off", critical: "off" },
  locking: { label: "Bloqueando", state: "locking", battery: 64, door: "off", critical: "off" },
  jammed: { label: "Atascado", state: "jammed", battery: 12, door: "off", critical: "on" },
  unlocking: { label: "Desbloqueando", state: "unlocking", battery: 64, door: "on", critical: "off" },
  open: { label: "Abierto", state: "open", battery: 55, door: "on", critical: "off" },
  unavailable: { label: "No disponible", state: "unavailable", battery: "unavailable", door: "unavailable", critical: "off" },
  low: { label: "Batería baja", state: "locked", battery: 14, door: "off", critical: "on" },
  custom: {
    label: "Colores",
    state: "unlocked",
    battery: 91,
    door: "off",
    critical: "off",
    config: {
      name: "Entrada",
      body_finish: "gloss",
      body_color: "#1c1d21",
      base_color: "#f4f4f5",
      ring_color: "#8fd0ff",
    },
  },
};

function sceneHass(scene) {
  const device = "dev-nuki";
  const other = "dev-other";
  const states = {
    "lock.entrada": {
      entity_id: "lock.entrada",
      state: scene.state,
      attributes: { friendly_name: "Puerta principal", supported_features: 1 },
    },
    "sensor.teclado_bateria": {
      entity_id: "sensor.teclado_bateria",
      state: "15",
      attributes: { friendly_name: "Teclado Batería", device_class: "battery", unit_of_measurement: "%" },
    },
    "sensor.otra_bateria": {
      entity_id: "sensor.otra_bateria",
      state: "9",
      attributes: { friendly_name: "Otra cerradura Batería", device_class: "battery", unit_of_measurement: "%" },
    },
    "sensor.entrada_bateria": {
      entity_id: "sensor.entrada_bateria",
      state: String(scene.battery),
      attributes: { friendly_name: "Puerta principal Batería", device_class: "battery", unit_of_measurement: "%" },
    },
    "binary_sensor.entrada_ventana": {
      entity_id: "binary_sensor.entrada_ventana",
      state: "on",
      attributes: { friendly_name: "Ventana", device_class: "window" },
    },
    "binary_sensor.entrada_puerta": {
      entity_id: "binary_sensor.entrada_puerta",
      state: scene.door,
      attributes: { friendly_name: "Puerta principal Puerta", device_class: "door" },
    },
    "binary_sensor.entrada_battery_critical": {
      entity_id: "binary_sensor.entrada_battery_critical",
      state: scene.critical,
      attributes: { friendly_name: "Puerta principal Battery critical", device_class: "battery" },
    },
    "binary_sensor.entrada_door_sensor_battery_critical": {
      entity_id: "binary_sensor.entrada_door_sensor_battery_critical",
      state: "off",
      attributes: { friendly_name: "Puerta principal Door Sensor Battery critical", device_class: "battery" },
    },
    "binary_sensor.entrada_charging": {
      entity_id: "binary_sensor.entrada_charging",
      state: "off",
      attributes: { friendly_name: "Puerta principal Battery charging", device_class: "battery_charging" },
    },
    "lock.trasera": {
      entity_id: "lock.trasera",
      state: "locked",
      attributes: { friendly_name: "Trasera" },
    },
  };
  const entities = {};
  for (const id of Object.keys(states)) {
    entities[id] = { entity_id: id, device_id: id.includes("otra") || id.includes("trasera") ? other : device };
  }
  return {
    language: "es",
    locale: { language: "es" },
    states,
    entities,
    callService() {},
  };
}

function mountCard(parent, scene) {
  const card = document.createElement("nuki-lock-card");
  const config = { entity: "lock.entrada", ...(scene.config ?? {}) };
  card.setConfig(config);
  card.hass = sceneHass(scene);
  parent.append(card);
  return card;
}

function section(title, keys) {
  const block = document.createElement("section");
  const heading = document.createElement("h2");
  heading.textContent = title;
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const key of keys) {
    const slot = document.createElement("div");
    slot.id = `state-${key}`;
    mountCard(slot, SCENES[key]);
    grid.append(slot);
  }
  block.append(heading, grid);
  return block;
}

function liveSection() {
  const block = document.createElement("section");
  const heading = document.createElement("h2");
  heading.textContent = "Interactivo";
  const grid = document.createElement("div");
  grid.className = "live";

  const slot = document.createElement("div");
  slot.id = "live-card";
  const card = document.createElement("nuki-lock-card");
  const config = { entity: "lock.entrada" };
  const scene = { ...SCENES.locked };
  const hass = sceneHass(scene);
  let timer = 0;

  const refresh = () => {
    card.hass = hass;
  };

  const setState = (state, extra = {}) => {
    window.clearTimeout(timer);
    hass.states["lock.entrada"].state = state;
    if (extra.door) hass.states["binary_sensor.entrada_puerta"].state = extra.door;
    if (extra.battery != null) hass.states["sensor.entrada_bateria"].state = String(extra.battery);
    if (extra.critical) hass.states["binary_sensor.entrada_battery_critical"].state = extra.critical;
    refresh();
  };

  hass.callService = (_domain, service) => {
    if (service === "lock") {
      setState("locking");
      timer = window.setTimeout(() => setState("locked", { door: "off" }), 1400);
    } else if (service === "unlock") {
      setState("unlocking");
      timer = window.setTimeout(() => setState("unlocked"), 1400);
    } else if (service === "open") {
      setState("opening");
      timer = window.setTimeout(() => setState("open", { door: "on" }), 1100);
    }
  };

  card.setConfig(config);
  card.hass = hass;
  slot.append(card);

  const panel = document.createElement("div");
  panel.className = "panel";
  panel.id = "live-editor";
  const editor = document.createElement("nuki-lock-card-editor");
  editor.hass = hass;
  editor.setConfig(config);
  editor.addEventListener("config-changed", (event) => {
    const next = event.detail.config;
    card.setConfig(next);
  });
  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "El teclado del mismo dispositivo marca 15 % y otra cerradura marca 9 %. La tarjeta tiene que mostrar la batería de la puerta (78 % al inicio). La ventana está abierta y no debe salir como puerta.";
  panel.append(editor, note);

  grid.append(slot, panel);
  block.append(heading, grid);
  return block;
}

function render() {
  const app = document.querySelector("#app");
  const shot = new URLSearchParams(location.search).get("shot");
  if (shot === "editor") {
    const page = document.createElement("div");
    page.className = "page";
    page.append(liveSection());
    app.append(page);
    return;
  }

  if (shot && SCENES[shot]) {
    document.body.classList.add("shot");
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.id = `state-${shot}`;
    mountCard(slot, SCENES[shot]);
    app.append(slot);
    return;
  }

  const page = document.createElement("div");
  page.className = "page";
  const title = document.createElement("h1");
  title.textContent = "Nuki Lock Card";
  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent =
    "Vista previa con un hass simulado: anillo LED del Smart Lock Pro de 5.ª generación, batería y puerta del mismo dispositivo.";
  page.append(
    title,
    lead,
    section("Estados", ["locked", "unlocked", "locking", "jammed"]),
    section("Más estados", ["unlocking", "open", "unavailable", "low", "custom"]),
    liveSection(),
  );
  app.append(page);
}

render();
