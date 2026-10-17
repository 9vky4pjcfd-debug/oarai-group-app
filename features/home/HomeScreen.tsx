import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { Badge, Button, Card, Screen, SectionHeader } from '@/components/design-system';
import { ContentGate } from '@/components/ContentGate';
import { colors, radii, spacing, typography } from '@/constants';
import { useHotels, useLocalized } from '@/features/content';
import { useMemberFormat } from '@/features/member/member-format';
import { useMemberIdentity, useMembership } from '@/features/member/membership';
import { HotelCard } from '@/features/hotels/HotelCard';
import { LatestNews } from '@/features/news/NewsScreens';

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

      <LatestNews />

      <SectionHeader eyebrow={t('hotels.eyebrow')} title={t('hotels.title')} description={t('hotels.subtitle')} />
      <ContentGate state={hotels} onRetry={hotels.reload}>
        {(list) => <View style={styles.hotelList}>{list.map((hotel) => <HotelCard key={hotel.hotelId} hotel={hotel} />)}</View>}
      </ContentGate>

      <SectionHeader title={t('home.liveTitle')} />
      <View style={styles.statusGrid}>
        <Pressable onPress={() => router.push('/(tabs)/facilities/bath-status')} style={styles.statusCell}>
          <Ionicons color={colors.accent} name="water-outline" size={24} />
          <Badge label={t('facilities.quiet')} tone="success" />
          <Text style={styles.statusTitle}>{t('facilities.bath')}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/facilities/restaurant-status')} style={styles.statusCell}>
          <Ionicons color={colors.accent} name="restaurant-outline" size={24} />
          <Badge label={t('facilities.waitingParties', { count: 3 })} tone="warning" />
          <Text style={styles.statusTitle}>{t('facilities.hinode')}</Text>
        </Pressable>
      </View>

      <SectionHeader title={t('home.explore')} />
      <View style={styles.quickGrid}>
        <QuickCard icon="bed-outline" label={t('rooms.title')} onPress={() => router.push('/(tabs)/stay')} />
        <QuickCard icon="map-outline" label={t('facilities.map')} onPress={() => router.push('/(tabs)/facilities')} />
        <QuickCard icon="qr-code-outline" label={t('member.qr')} onPress={() => router.push('/(tabs)/member/qr')} />
        <QuickCard icon="help-circle-outline" label={t('support.faq')} onPress={() => router.push('/(tabs)/support/faq')} />
      </View>

      <HomePointsCard />
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

function QuickCard({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}><Ionicons color={colors.accent} name={icon} size={26} /><Text style={styles.quickLabel}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.sm },
  absolute: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  hero: { borderRadius: radii.lg, height: 430, justifyContent: 'flex-end', overflow: 'hidden', padding: spacing.lg },
  heroCopy: { gap: spacing.sm },
  eyebrow: { ...typography.caption, color: colors.white, letterSpacing: 3 },
  headline: { ...typography.display, color: colors.white },
  subheadline: { ...typography.body, color: colors.white },
  hotelList: { gap: spacing.md },
  statusGrid: { flexDirection: 'row', gap: spacing.sm },
  statusCell: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, flex: 1, gap: spacing.xs, minHeight: 150, padding: spacing.md },
  statusTitle: { ...typography.label, color: colors.text },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing.xs, justifyContent: 'center', minHeight: 108, padding: spacing.sm, width: '48%' },
  quickLabel: { ...typography.label, color: colors.text, textAlign: 'center' },
  pressed: { opacity: 0.75 },
  pointsCard: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  pointsLabel: { ...typography.caption, color: colors.textMuted },
  points: { ...typography.title, color: colors.brand },
  pointsUnit: { ...typography.caption },
});
