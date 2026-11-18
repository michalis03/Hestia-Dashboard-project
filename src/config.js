export const cardType = 'custom:hestia-community';

function exactFields(value, fields) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === fields.length && fields.every((key) => Object.hasOwn(value, key));
}

export function validateConfig(value) {
  if (!exactFields(value, ['version', 'rooms']) || value.version !== 1 || !Array.isArray(value.rooms)) {
    throw new Error('Expected a Hestia configuration with version 1 and a rooms list.');
  }

  const roomIds = new Set();
  const entityIds = new Set();
  for (const room of value.rooms) {
    if (!exactFields(room, ['id', 'label', 'entities'])
      || typeof room.id !== 'string' || !/^[a-z][a-z0-9_-]{0,99}$/.test(room.id)
      || typeof room.label !== 'string' || !room.label.trim() || room.label.length > 100
      || !Array.isArray(room.entities) || roomIds.has(room.id)) {
      throw new Error('Each room needs a unique ID, a label and an entity list.');
    }
    roomIds.add(room.id);
    for (const entity of room.entities) {
      if (typeof entity !== 'string' || !/^[a-z][a-z0-9_]*\.[a-z0-9_]+$/.test(entity) || entityIds.has(entity)) {
        throw new Error('Each entity must have a valid Home Assistant ID and belong to one room.');
      }
      entityIds.add(entity);
    }
  }
  return structuredClone(value);
}
