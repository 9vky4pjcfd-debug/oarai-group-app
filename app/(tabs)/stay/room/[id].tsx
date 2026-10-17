import { services } from '@/services';

export { RoomDetailScreen as default } from '@/features/rooms/RoomDetailScreen';

/** Pre-renders one page per room ID for the static web build; the hotel comes from the `hotelId` query. */
export async function generateStaticParams() {
  const hotels = await services.hotelContent.getHotels();
  const rooms = (await Promise.all(hotels.map((hotel) => services.hotelContent.getRooms(hotel.hotelId)))).flat();
  return [...new Set(rooms.map((room) => room.roomId))].map((id) => ({ id }));
}
