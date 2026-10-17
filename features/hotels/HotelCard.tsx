import { ContentCard } from '@/components/ContentCard';
import { useLocalized } from '@/features/content';
import { resolveContentImage } from '@/features/hotel/content-utils';
import type { HotelPublicProfile } from '@/types';

export function HotelCard({ hotel }: { hotel: HotelPublicProfile }) {
  const l = useLocalized();
  return (
    <ContentCard
      image={hotel.heroImage ? resolveContentImage(hotel.heroImage) : undefined}
      meta={l(hotel.area)}
      title={l(hotel.name)}
      description={l(hotel.shortDescription)}
      href={{ pathname: '/(tabs)/stay/hotel/[hotelId]', params: { hotelId: hotel.hotelId } }}
    />
  );
}
