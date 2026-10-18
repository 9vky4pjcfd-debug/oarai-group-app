import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { ContentGate } from '@/components/ContentGate';
import { MenuRow } from '@/components/MenuRow';
import { Button, CardGrid, CardGridItem, EmptyState, Screen, SectionHeader } from '@/components/design-system';
import { colors, DEFAULT_HOTEL_ID, radii, spacing, typography } from '@/constants';
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
      {/* One clear next step (search this hotel), with the two secondary destinations side by side below it. */}
      <View style={styles.actions}>
        <Button label={t('rooms.searchThisHotel')} onPress={() => router.push({ pathname: '/(tabs)/stay/reservation', params: { hotelId } })} />
        <View style={styles.links}>
          <LinkTile icon="business-outline" label={t('hotels.viewHotel')} href={{ pathname: '/(tabs)/stay/hotel/[hotelId]', params: { hotelId } }} />
          <LinkTile icon="receipt-outline" label={t('booking.myReservations')} href="/(tabs)/stay/booking/reservations" />
        </View>
      </View>
      <SectionHeader title={t('hotels.rooms')} />
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

function LinkTile({ icon, label, href }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; href: Href }) {
  return (
    <Pressable accessibilityRole="link" onPress={() => router.push(href)} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <Ionicons color={colors.accent} name={icon} size={20} />
      <Text numberOfLines={1} style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.xs },
  links: { flexDirection: 'row', gap: spacing.xs },
  tile: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, flex: 1, flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', minHeight: 48, paddingHorizontal: spacing.sm },
  pressed: { opacity: 0.75 },
  tileLabel: { ...typography.label, color: colors.text, flexShrink: 1 },
});
