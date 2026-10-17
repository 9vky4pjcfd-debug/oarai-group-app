import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { ContentGate } from '@/components/ContentGate';
import { MenuRow } from '@/components/MenuRow';
import { EmptyState, Screen, ScreenSection, SectionHeader } from '@/components/design-system';
import { colors, DEFAULT_HOTEL_ID, radii, spacing, typography } from '@/constants';
import { useHotels, useLocalized, useRooms } from '@/features/content';
import type { HotelPublicProfile } from '@/types';
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
      <HotelRooms hotelId={hotelId} />
    </Screen>
  );
}

export function HotelRooms({ hotelId }: { hotelId: string }) {
  const { t } = useTranslation();
  const rooms = useRooms(hotelId);
  return (
    <ContentGate state={rooms} onRetry={rooms.reload}>
      {(list) => list.length === 0
        ? <EmptyState title={t('hotels.noRooms')} />
        : <ScreenSection>{list.map((room) => <RoomCard key={`${room.hotelId}:${room.roomId}`} room={room} />)}</ScreenSection>}
    </ContentGate>
  );
}

function HotelPicker({ hotels, selected, onSelect }: { hotels: HotelPublicProfile[]; selected: string; onSelect: (hotelId: string) => void }) {
  const l = useLocalized();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.picker}>
      {hotels.map((hotel) => {
        const active = hotel.hotelId === selected;
        return (
          <Pressable key={hotel.hotelId} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onSelect(hotel.hotelId)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{l(hotel.name)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  picker: { gap: spacing.xs },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipLabel: { ...typography.label, color: colors.text },
  chipLabelActive: { color: colors.white },
});
