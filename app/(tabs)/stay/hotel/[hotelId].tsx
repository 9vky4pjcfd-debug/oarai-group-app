import { services } from '@/services';

export { HotelDetailScreen as default } from '@/features/hotels/HotelDetailScreen';

/** Pre-renders one page per hotel for the static web build. */
export async function generateStaticParams() {
  const hotels = await services.hotelContent.getHotels();
  return hotels.map((hotel) => ({ hotelId: hotel.hotelId }));
}
