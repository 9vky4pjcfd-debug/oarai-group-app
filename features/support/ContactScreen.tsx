import { Linking, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExternalLinkButton } from '@/components/ExternalLinkButton';
import { ContentGate } from '@/components/ContentGate';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, CardGrid, CardGridItem, Screen, SectionHeader } from '@/components/design-system';
import { colors, spacing, typography } from '@/constants';
import { useHotels, useLocalized } from '@/features/content';

export function ContactScreen() {
  const { t } = useTranslation();
  const l = useLocalized();
  const hotels = useHotels();
  return (
    <Screen>
      <PageHeader title={t('support.contact')} backLabel={t('common.back')} />
      <SectionHeader eyebrow="CONTACT" title={t('support.contact')} description={t('ui.contactIntro')} />
      <ContentGate state={hotels} onRetry={hotels.reload}>
        {(list) => (
          <CardGrid>
            {list.map((hotel) => (
              <CardGridItem key={hotel.hotelId}>
                <Card style={styles.card}>
                  <View style={styles.copy}>
                    <Text style={styles.area}>{l(hotel.area)}</Text>
                    <Text style={styles.name}>{l(hotel.name)}</Text>
                    {hotel.phone ? <Text style={styles.phone}>{hotel.phone}</Text> : null}
                  </View>
                  {hotel.phone ? <Button label={t('ui.callHotel')} onPress={() => void Linking.openURL(`tel:${hotel.phone!.replace(/[^0-9+]/g, '')}`)} /> : null}
                  <ExternalLinkButton label={t('hotels.website')} url={hotel.websiteUrl} />
                </Card>
              </CardGridItem>
            ))}
          </CardGrid>
        )}
      </ContentGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexGrow: 1, gap: spacing.sm },
  copy: { gap: spacing.xxs },
  area: { ...typography.caption, color: colors.accent, letterSpacing: 1 },
  name: { ...typography.heading, color: colors.text },
  phone: { ...typography.body, color: colors.textMuted },
});
