import { cardType, validateConfig } from './config.js';
import { HestiaEditor } from './editor.js';

const tag = 'hestia-community';
const editorTag = 'hestia-community-editor';

function element(tagName, text) {
  const node = document.createElement(tagName);
  node.textContent = text;
  return node;
}

class HestiaCard extends HTMLElement {
  #rooms;
  #hass;
  #states = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return { type: cardType };
  }

  static getConfigElement() {
    return document.createElement(editorTag);
  }

  getCardSize() {
    return Math.max(2, this.#rooms?.length ?? 0);
  }

  setConfig(config) {
    this.#rooms = config.hestia === undefined ? undefined : validateConfig(config.hestia).rooms;
    this.#render();
  }

  set hass(hass) {
    this.#hass = hass;
    this.#updateStates();
  }

  #updateStates() {
    for (const [id, { label, state }] of this.#states) {
      const entity = this.#hass?.states?.[id];
      const name = entity?.attributes?.friendly_name ?? id;
      const value = entity?.state ?? 'Missing entity';
      if (label.textContent !== name) label.textContent = name;
      if (state.textContent !== value) state.textContent = value;
    }
  }

  #render() {
    this.#states.clear();
    const style = element('style', `
      ha-card { padding: 24px; }
      h1 { margin: 0 0 18px; font-size: 1.4rem; }
      h2 { margin: 0 0 12px; font-size: 1rem; }
      .rooms { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; }
      section { padding: 16px; border: 1px solid var(--divider-color, #ddd); border-radius: 12px; }
      dl { margin: 0; }
      dl div { display: grid; grid-template-columns: 1fr auto; gap: 16px; padding-block: 5px; overflow-wrap: anywhere; }
      dd { margin: 0; color: var(--secondary-text-color, #555); }
    `);
    const card = document.createElement('ha-card');
    card.append(element('h1', 'Hestia Community Edition'));
    if (!this.#rooms) {
      card.append(element('p', 'Edit this card to discover devices and set up your rooms.'));
    } else if (!this.#rooms.length) {
      card.append(element('p', 'Your dashboard is set up. Edit this card to add devices.'));
    } else {
      const rooms = document.createElement('div');
      rooms.className = 'rooms';
      for (const room of this.#rooms) {
        const section = document.createElement('section');
        const entries = document.createElement('dl');
        section.append(element('h2', room.label), entries);
        for (const id of room.entities) {
          const row = document.createElement('div');
          const label = element('dt', id);
          const state = element('dd', 'Waiting for state');
          row.append(label, state);
          entries.append(row);
          this.#states.set(id, { label, state });
        }
        rooms.append(section);
      }
      card.append(rooms);
    }
    this.shadowRoot.replaceChildren(style, card);
    this.#updateStates();
  }
}

if (!customElements.get(editorTag)) customElements.define(editorTag, HestiaEditor);
if (!customElements.get(tag)) {
  customElements.define(tag, HestiaCard);
  window.customCards ??= [];
  window.customCards.push({
    type: tag,
    name: 'Hestia Community Edition',
    description: 'Discover devices and organize them by room.',
    preview: true,
  });
}
