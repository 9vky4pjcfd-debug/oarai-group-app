import { useTranslation } from 'react-i18next';
import { ContentCard } from '@/components/ContentCard';
import { useLocalized } from '@/features/content';
import { resolveContentImage } from '@/features/hotel/content-utils';
import type { Room } from '@/types';
import { formatCapacity } from './room-format';

export function RoomCard({ room }: { room: Room }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const image = room.images[0];
  return (
    <ContentCard
      image={image ? resolveContentImage(image) : undefined}
      meta={`${l(room.roomSize)} · ${formatCapacity(room, t)}`}
      title={l(room.name)}
      description={l(room.shortDescription)}
      href={{ pathname: '/(tabs)/stay/room/[id]', params: { id: room.roomId, hotelId: room.hotelId } }}
    />
  );
}
