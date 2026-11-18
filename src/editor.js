import { cardType, validateConfig } from './config.js';
import { discoverRooms } from './discovery.js';

function button(label, action) {
  const control = document.createElement('button');
  control.type = 'button';
  control.textContent = label;
  control.addEventListener('click', action);
  return control;
}

export class HestiaEditor extends HTMLElement {
  #config;
  #hass;
  #status;

  setConfig(config) {
    this.#config = config;
    this.#render();
  }

  set hass(hass) {
    const first = !this.#hass;
    this.#hass = hass;
    if (first) this.#render();
  }

  #render() {
    if (!this.#config) return;
    this.replaceChildren();

    const heading = document.createElement('h3');
    heading.textContent = 'Hestia setup';
    const guidance = document.createElement('p');
    guidance.textContent = 'Select devices by room, apply your selection, and save the card in Home Assistant. Refreshing discovery discards unapplied changes.';
    this.#status = document.createElement('p');
    this.#status.setAttribute('role', 'status');
    this.append(heading, guidance, this.#status);
    if (!this.#hass) return;

    let saved;
    try {
      saved = this.#config.hestia === undefined ? undefined : validateConfig(this.#config.hestia);
    } catch (error) {
      this.#status.textContent = `${error.message} Restore valid configuration in the code editor.`;
      return;
    }

    const discovered = discoverRooms(this.#hass);
    const previous = new Map(saved?.rooms.map((room) => [room.id, room]));
    const assigned = new Set(saved?.rooms.flatMap((room) => room.entities));
    const offered = new Map(discovered.map((room) => [room.id, {
      ...room,
      entities: room.entities.filter((entity) => !assigned.has(entity.id)),
    }]));
    for (const room of previous.values()) {
      const candidates = offered.get(room.id)?.entities ?? [];
      const savedEntities = room.entities.map((id) => ({
        id, label: this.#hass.states?.[id]?.attributes?.friendly_name ?? id,
      }));
      offered.set(room.id, { ...room, entities: [...savedEntities, ...candidates] });
    }

    const fields = document.createElement('div');
    this.append(button('Refresh discovery', () => this.#render()), fields);
    const readRooms = [];
    for (const room of offered.values()) {
      const group = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = room.label;
      group.append(legend);
      const name = document.createElement('input');
      name.value = previous.get(room.id)?.label ?? room.label;
      name.maxLength = 100;
      name.setAttribute('aria-label', `Display name for ${room.label}`);
      group.append(name);
      const choices = room.entities.map((entity) => {
        const row = document.createElement('label');
        row.style.display = 'block';
        const selected = document.createElement('input');
        selected.type = 'checkbox';
        selected.checked = assigned.has(entity.id);
        row.append(selected, document.createTextNode(entity.label));
        group.append(row);
        return { id: entity.id, selected };
      });
      fields.append(group);
      readRooms.push(() => ({
        id: room.id,
        label: name.value.trim(),
        entities: choices.filter(({ selected }) => selected.checked).map(({ id }) => id),
      }));
    }
    if (!offered.size) this.#status.textContent = 'No compatible devices were found. You can save an empty dashboard.';
    this.append(button('Apply setup', () => {
      try {
        const hestia = validateConfig({ version: 1, rooms: readRooms.map((read) => read())
          .filter(({ entities }) => entities.length) });
        this.#status.textContent = 'Setup applied. Save this card to keep it.';
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: { ...this.#config, type: cardType, hestia } },
          bubbles: true,
          composed: true,
        }));
      } catch (error) {
        this.#status.textContent = error.message;
      }
    }));
  }
}
