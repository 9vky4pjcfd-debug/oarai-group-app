import type { TFunction } from 'i18next';
import type { Room } from '@/types';

export function formatCapacity(room: Room, t: TFunction) {
  return room.capacityMin != null && room.capacityMin < room.capacityMax
    ? t('rooms.capacityRange', { min: room.capacityMin, max: room.capacityMax })
    : t('rooms.capacityValue', { count: room.capacityMax });
}
