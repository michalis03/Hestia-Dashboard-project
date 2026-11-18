import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateConfig } from '../src/config.js';
import { discoverRooms } from '../src/discovery.js';

test('validates and copies a versioned document', () => {
  const config = { version: 1, rooms: [{ id: 'studio', label: 'Studio', entities: ['light.example'] }] };
  const parsed = validateConfig(config);
  assert.deepEqual(parsed, config);
  assert.notEqual(parsed.rooms[0], config.rooms[0]);
  assert.deepEqual(validateConfig({ version: 1, rooms: [] }).rooms, []);
});

test('rejects unsupported versions, extra fields and duplicate bindings', () => {
  assert.throws(() => validateConfig({ version: 2, rooms: [] }));
  assert.throws(() => validateConfig({ version: 1, rooms: [], extra: 'discard' }));
  assert.throws(() => validateConfig({ version: 1, rooms: [
    { id: 'studio', label: 'Studio', entities: ['light.example', 'light.example'] },
  ] }));
});

test('discovers entity and device areas in precedence order', () => {
  const rooms = discoverRooms({
    areas: { room: { area_id: 'room', name: 'Room' }, studio: { area_id: 'studio', name: 'Studio' } },
    devices: { device: { area_id: 'room' } },
    entities: {
      'light.example': { device_id: 'device', area_id: 'studio' },
      'sensor.example': { device_id: 'device' },
      'light.hidden': { hidden: true },
    },
    states: { 'light.example': {}, 'sensor.example': {}, 'light.hidden': {}, 'cover.example': {} },
  });
  assert.deepEqual(rooms.map(({ id, entities }) => [id, entities.map((entity) => entity.id)]), [
    ['area-room', ['sensor.example']], ['area-studio', ['light.example']], ['unassigned', ['cover.example']],
  ]);
  assert.deepEqual(discoverRooms({}), []);
});
