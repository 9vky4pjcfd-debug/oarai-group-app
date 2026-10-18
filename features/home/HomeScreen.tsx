import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { Button, Card, CardGrid, CardGridItem, Screen, SectionHeader } from '@/components/design-system';
import { ContentGate } from '@/components/ContentGate';
import { colors, radii, spacing, typography } from '@/constants';
import { useHotels, useLocalized } from '@/features/content';
import { useMemberFormat } from '@/features/member/member-format';
import { useMemberIdentity, useMembership } from '@/features/member/membership';
import { HotelCard } from '@/features/hotels/HotelCard';

export function HomeScreen() {
  const { t } = useTranslation();
  const hotels = useHotels();

  return (
    <Screen contentContainerStyle={styles.screen}>
      <AppHeader />
      <View style={styles.hero}>
        <Image contentFit="cover" source={require('@/assets/brand/hero.webp')} style={styles.absolute} />
        <LinearGradient colors={['rgba(2,31,43,0.08)', 'rgba(2,31,43,0.78)']} style={styles.absolute} />
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>{t('home.welcome')}</Text>
          <Text style={styles.headline}>{t('home.headline')}</Text>
          <Text style={styles.subheadline}>{t('home.subheadline')}</Text>
          <Button label={t('home.reserve')} onPress={() => router.push('/(tabs)/stay/reservation')} />
        </View>
      </View>

      {/* The four things returning guests come back for, right under the search button. */}
      <View style={styles.quickRow}>
        <QuickAction icon="receipt-outline" label={t('booking.myReservations')} onPress={() => router.push('/(tabs)/stay/booking/reservations')} />
        <QuickAction icon="qr-code-outline" label={t('member.qr')} onPress={() => router.push('/(tabs)/member/qr')} />
        <QuickAction icon="bed-outline" label={t('rooms.title')} onPress={() => router.push('/(tabs)/stay')} />
        <QuickAction icon="call-outline" label={t('support.contact')} onPress={() => router.push('/(tabs)/support/contact')} />
      </View>

      <HomePointsCard />

      <SectionHeader eyebrow={t('hotels.eyebrow')} title={t('hotels.title')} description={t('hotels.subtitle')} />
      <ContentGate state={hotels} onRetry={hotels.reload}>
        {(list) => <CardGrid>{list.map((hotel) => <CardGridItem key={hotel.hotelId}><HotelCard hotel={hotel} /></CardGridItem>)}</CardGrid>}
      </ContentGate>
    </Screen>
  );
}

function HomePointsCard() {
  const { t } = useTranslation();
  const localize = useLocalized();
  const format = useMemberFormat();
  const identity = useMemberIdentity();
  const membership = useMembership(identity.userId);
  const summary = membership.status === 'ready' ? membership.data : null;
  return (
    <Pressable onPress={() => router.push('/(tabs)/member')}>
      <Card style={styles.pointsCard}>
        <View>
          <Text style={styles.pointsLabel}>{summary ? `${t('home.points')} · ${localize(summary.progress.current.name)}` : t('home.points')}</Text>
          <Text style={styles.points}>{summary ? format.points(summary.account.balance) : '—'} <Text style={styles.pointsUnit}>{t('home.pointsUnit')}</Text></Text>
        </View>
        <Ionicons color={colors.accent} name="sparkles-outline" size={34} />
      </Card>
    </Pressable>
  );
}

function QuickAction({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <View style={styles.quickIcon}><Ionicons color={colors.brand} name={icon} size={24} /></View>
      <Text numberOfLines={2} style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.sm },
  absolute: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  hero: { borderRadius: radii.lg, height: 380, justifyContent: 'flex-end', overflow: 'hidden', padding: spacing.lg },
  heroCopy: { gap: spacing.sm, maxWidth: 560 },
  eyebrow: { ...typography.caption, color: colors.white, letterSpacing: 3 },
  headline: { ...typography.display, color: colors.white },
  subheadline: { ...typography.body, color: colors.white },
  quickRow: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, flexDirection: 'row', marginTop: -spacing.sm, paddingVertical: spacing.sm },
  quickAction: { alignItems: 'center', flex: 1, gap: spacing.xxs, paddingHorizontal: spacing.xxs },
  quickIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radii.pill, height: 48, justifyContent: 'center', width: 48 },
  quickLabel: { ...typography.caption, color: colors.text, fontWeight: '700', textAlign: 'center' },
  pressed: { opacity: 0.75 },
  pointsCard: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  pointsLabel: { ...typography.caption, color: colors.textMuted },
  points: { ...typography.title, color: colors.brand },
  pointsUnit: { ...typography.caption },
});
