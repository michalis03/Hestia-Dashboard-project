const domains = new Set([
  'binary_sensor', 'camera', 'climate', 'cover', 'fan', 'light', 'media_player', 'sensor', 'switch', 'weather',
]);

export function discoverRooms(hass) {
  const rooms = new Map(Object.values(hass.areas ?? {}).map(({ area_id, name }) => [
    area_id, { id: `area-${area_id}`, label: name, entities: [] },
  ]));
  const unassigned = { id: 'unassigned', label: 'Unassigned devices', entities: [] };
  for (const [id, state] of Object.entries(hass.states ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
    const entry = hass.entities?.[id];
    if (!domains.has(id.split('.')[0]) || entry?.hidden || entry?.hidden_by || entry?.disabled_by) continue;
    const area = entry?.area_id ?? hass.devices?.[entry?.device_id]?.area_id;
    const room = rooms.get(area) ?? unassigned;
    room.entities.push({ id, label: state.attributes?.friendly_name ?? id });
  }
  return [...rooms.values(), ...(unassigned.entities.length ? [unassigned] : [])];
}
