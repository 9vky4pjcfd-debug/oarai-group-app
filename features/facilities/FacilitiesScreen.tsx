import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExternalLinkButton } from '@/components/ExternalLinkButton';
import { AppHeader } from '@/components/AppHeader';
import { ContentCard } from '@/components/ContentCard';
import { ContentGate } from '@/components/ContentGate';
import { MenuRow } from '@/components/MenuRow';
import { Card, CardGrid, CardGridItem, Screen, SectionHeader } from '@/components/design-system';
import { colors, DEFAULT_HOTEL_ID, radii, spacing, typography } from '@/constants';
import { useFacilities, useHotels, useLocalized } from '@/features/content';
import { resolveContentImage } from '@/features/hotel/content-utils';
import { HotelPicker } from '@/features/hotels/HotelPicker';
import type { HotelPublicProfile } from '@/types';

export function FacilitiesScreen() {
  const { t } = useTranslation();
  const hotels = useHotels();
  const [selected, setSelected] = useState(DEFAULT_HOTEL_ID);
  const hotel = hotels.data?.find((item) => item.hotelId === selected);
  return (
    <Screen>
      <AppHeader />
      <SectionHeader eyebrow="FACILITIES" title={t('facilities.title')} description={t('facilities.subtitle')} />
      <ContentGate state={hotels} onRetry={hotels.reload}>
        {(list) => <HotelPicker hotels={list} selected={selected} onSelect={setSelected} />}
      </ContentGate>
      {/* Live status and the floor map exist only for 大洗ホテル so far. */}
      {selected === DEFAULT_HOTEL_ID ? (
        <>
          <MenuRow icon="pulse-outline" title={t('facilities.crowd')} description={t('facilities.crowdDescription')} href="/(tabs)/facilities/crowd" />
          <FloorMap />
        </>
      ) : null}
      <HotelFacilities hotelId={selected} hotel={hotel} />
    </Screen>
  );
}

function HotelFacilities({ hotelId, hotel }: { hotelId: string; hotel: HotelPublicProfile | undefined }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const facilities = useFacilities(hotelId);
  return (
    <ContentGate state={facilities} onRetry={facilities.reload}>
      {(list) => list.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('ui.noFacilities')}</Text>
          <ExternalLinkButton label={t('hotels.website')} url={hotel?.websiteUrl} />
        </Card>
      ) : (
        <CardGrid>
          {list.map((facility) => {
            const image = facility.images[0];
            return <CardGridItem key={facility.facilityId}><ContentCard compact image={image ? resolveContentImage(image) : undefined} meta={l(facility.location)} title={l(facility.name)} description={l(facility.shortDescription)} href={{ pathname: '/(tabs)/facilities/[id]', params: { id: facility.facilityId } }} /></CardGridItem>;
          })}
        </CardGrid>
      )}
    </ContentGate>
  );
}

function FloorMap() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const map = require('@/assets/content/floor-map.jpg');
  return (
    <>
      <Pressable accessibilityRole="imagebutton" accessibilityLabel={t('facilities.map')} onPress={() => setOpen(true)}>
        <Card style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>{t('facilities.map')}</Text>
            <Ionicons color={colors.accent} name="expand-outline" size={22} />
          </View>
          <Image contentFit="contain" source={map} style={styles.map} />
        </Card>
      </Pressable>
      <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <View style={styles.viewer}>
          <Image contentFit="contain" source={map} style={styles.viewerImage} />
          <Pressable accessibilityLabel={t('common.back')} accessibilityRole="button" hitSlop={12} onPress={() => setOpen(false)} style={styles.close}>
            <Ionicons color={colors.white} name="close" size={26} />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mapCard: { gap: spacing.sm, overflow: 'hidden' },
  mapHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  mapTitle: { ...typography.heading, color: colors.text },
  map: { backgroundColor: colors.background, borderRadius: radii.md, height: 240, width: '100%' },
  viewer: { backgroundColor: 'rgba(3, 20, 28, 0.94)', flex: 1, justifyContent: 'center', padding: spacing.md },
  viewerImage: { flex: 1, width: '100%' },
  close: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radii.pill, height: 48, justifyContent: 'center', position: 'absolute', right: spacing.md, top: spacing.xl, width: 48 },
  emptyCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
