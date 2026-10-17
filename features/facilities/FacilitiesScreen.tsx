import { Image } from 'expo-image';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { ContentCard } from '@/components/ContentCard';
import { ContentGate } from '@/components/ContentGate';
import { MenuRow } from '@/components/MenuRow';
import { Card, Screen, ScreenSection, SectionHeader } from '@/components/design-system';
import { colors, DEFAULT_HOTEL_ID, radii, spacing, typography } from '@/constants';
import { useFacilities, useLocalized } from '@/features/content';
import { resolveContentImage } from '@/features/hotel/content-utils';

export function FacilitiesScreen() {
  const { t } = useTranslation();
  const l = useLocalized();
  const facilities = useFacilities(DEFAULT_HOTEL_ID);
  return (
    <Screen>
      <AppHeader />
      <SectionHeader eyebrow="FACILITIES" title={t('facilities.title')} description={t('facilities.subtitle')} />
      <MenuRow icon="pulse-outline" title={t('facilities.crowd')} description={t('facilities.crowdDescription')} href="/(tabs)/facilities/crowd" />
      <Card style={styles.mapCard}>
        <Text style={styles.mapTitle}>{t('facilities.map')}</Text>
        <Image contentFit="contain" source={require('@/assets/content/floor-map.jpg')} style={styles.map} />
        <Text style={styles.mapDescription}>{t('facilities.mapDescription')}</Text>
      </Card>
      <ContentGate state={facilities} onRetry={facilities.reload}>
        {(list) => (
          <ScreenSection>
            {list.map((facility) => {
              const image = facility.images[0];
              return <ContentCard key={facility.facilityId} image={image ? resolveContentImage(image) : undefined} meta={l(facility.location)} title={l(facility.name)} description={l(facility.shortDescription)} href={{ pathname: '/(tabs)/facilities/[id]', params: { id: facility.facilityId } }} />;
            })}
          </ScreenSection>
        )}
      </ContentGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapCard: { gap: spacing.sm, overflow: 'hidden' }, mapTitle: { ...typography.heading, color: colors.text }, map: { backgroundColor: colors.background, borderRadius: radii.md, height: 240, width: '100%' }, mapDescription: { ...typography.body, color: colors.textMuted },
});
