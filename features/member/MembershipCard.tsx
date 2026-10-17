import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radii, shadows, spacing, typography } from '@/constants';
import { useLocalized } from '@/features/content';
import { useMemberFormat } from './member-format';
import type { MembershipSummary } from './membership';

export function MembershipCard({ summary }: { summary: MembershipSummary }) {
  const { t } = useTranslation();
  const localize = useLocalized();
  const format = useMemberFormat();
  const { profile, account, progress } = summary;
  const tierName = localize(progress.current.name);

  return (
    <View accessibilityLabel={`${t('member.currentTier')} ${tierName}`} style={[styles.card, { backgroundColor: progress.current.color }]}>
      <View style={styles.row}>
        <Text style={styles.brand}>OARAI GROUP</Text>
        <Text style={styles.tier}>{tierName}</Text>
      </View>
      <View>
        <Text style={styles.label}>{t('member.currentPoints')}</Text>
        <Text style={styles.balance}>{format.points(account.balance)} <Text style={styles.unit}>{t('member.pointsUnit')}</Text></Text>
      </View>
      <View style={styles.progressBlock}>
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress.ratio * 100) }} style={styles.track}>
          <View style={[styles.fill, { width: `${progress.ratio * 100}%` }]} />
        </View>
        <Text style={styles.caption}>
          {progress.next ? t('member.nextTier', { tier: localize(progress.next.name), count: format.points(progress.remaining) }) : t('member.topTier')}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.name}>{profile.displayName}</Text>
        <Text style={styles.number}>{profile.membershipNumber}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, gap: spacing.md, padding: spacing.lg, ...shadows.card },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brand: { ...typography.caption, color: colors.white, letterSpacing: 3 },
  tier: { ...typography.label, color: colors.white, letterSpacing: 1 },
  label: { ...typography.caption, color: colors.white, opacity: 0.85 },
  balance: { color: colors.white, fontSize: 42, fontWeight: '700', lineHeight: 50 },
  unit: { ...typography.heading, color: colors.white },
  progressBlock: { gap: spacing.xs },
  track: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: radii.pill, height: 6, overflow: 'hidden' },
  fill: { backgroundColor: colors.white, borderRadius: radii.pill, height: 6 },
  caption: { ...typography.caption, color: colors.white },
  name: { ...typography.label, color: colors.white },
  number: { ...typography.caption, color: colors.white, letterSpacing: 1 },
});
