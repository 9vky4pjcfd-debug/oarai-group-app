import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { ContentGate } from '@/components/ContentGate';
import { MenuRow } from '@/components/MenuRow';
import { CardGrid, CardGridItem, EmptyState, Screen, SectionHeader } from '@/components/design-system';
import { DEFAULT_HOTEL_ID } from '@/constants';
import { useHotels, useRooms } from '@/features/content';
import { HotelPicker } from '@/features/hotels/HotelPicker';
import { RoomCard } from './RoomCard';

export function RoomsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ hotelId?: string }>();
  const [selected, setSelected] = useState<string | undefined>(params.hotelId);
  const hotels = useHotels();
  const hotelId = selected ?? params.hotelId ?? hotels.data?.[0]?.hotelId ?? DEFAULT_HOTEL_ID;

  return (
    <Screen>
      <AppHeader />
      <SectionHeader eyebrow="STAY" title={t('rooms.title')} description={t('rooms.subtitle')} />
      <ContentGate state={hotels} onRetry={hotels.reload}>
        {(list) => <HotelPicker hotels={list} selected={hotelId} onSelect={setSelected} />}
      </ContentGate>
      <MenuRow icon="business-outline" title={t('hotels.viewHotel')} href={{ pathname: '/(tabs)/stay/hotel/[hotelId]', params: { hotelId } }} />
      <MenuRow icon="calendar-outline" title={t('rooms.reservation')} description={t('rooms.reservationDescription')} href={{ pathname: '/(tabs)/stay/reservation', params: { hotelId } }} />
      <MenuRow icon="receipt-outline" title={t('booking.myReservations')} description={t('booking.myReservationsDescription')} href="/(tabs)/stay/booking/reservations" />
      <HotelRooms hotelId={hotelId} />
    </Screen>
  );
}

/** Room cards for one hotel; with `limit`, shows only the first few and links to the full list. */
export function HotelRooms({ hotelId, limit }: { hotelId: string; limit?: number }) {
  const { t } = useTranslation();
  const rooms = useRooms(hotelId);
  return (
    <ContentGate state={rooms} onRetry={rooms.reload}>
      {(list) => list.length === 0
        ? <EmptyState title={t('hotels.noRooms')} />
        : (
          <>
            <CardGrid>{list.slice(0, limit).map((room) => <CardGridItem key={`${room.hotelId}:${room.roomId}`}><RoomCard room={room} /></CardGridItem>)}</CardGrid>
            {limit != null && list.length > limit ? <MenuRow icon="bed-outline" title={t('ui.allRooms')} href={{ pathname: '/(tabs)/stay', params: { hotelId } }} /> : null}
          </>
        )}
    </ContentGate>
  );
}
