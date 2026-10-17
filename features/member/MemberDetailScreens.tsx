import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Card, EmptyState, Screen, SectionHeader } from '@/components/design-system';
import { ContentGate } from '@/components/ContentGate';
import { PageHeader } from '@/components/PageHeader';
import { colors, radii, spacing, typography } from '@/constants';
import { useLocalized } from '@/features/content';
import type { LocalizedText, MembershipTier, PointTransactionDocument } from '@/types';
import { useMemberFormat } from './member-format';
import { YEN_PER_BASE_POINT } from './membership-rules';
import { useMemberIdentity, usePointHistory } from './membership';
import { MembershipCard } from './MembershipCard';
import { MembershipGate } from './MembershipGate';

export function MemberQrScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <PageHeader title={t('member.qr')} backLabel={t('common.back')} />
      <SectionHeader eyebrow="MEMBER" title={t('member.qr')} description={t('member.qrDescription')} />
      <MembershipGate>
        {({ profile }) => (
          <View style={styles.qr}>
            <Ionicons color={colors.brand} name="qr-code-outline" size={180} />
            <Text style={styles.label}>{t('member.membershipNumber')}</Text>
            <Text style={styles.number}>{profile.membershipNumber}</Text>
            <Text style={styles.muted}>{t('member.demoQr')}</Text>
          </View>
        )}
      </MembershipGate>
    </Screen>
  );
}

export function PointsScreen() {
  const { t } = useTranslation();
  const localize = useLocalized();
  const format = useMemberFormat();
  return (
    <Screen>
      <PageHeader title={t('member.points')} backLabel={t('common.back')} />
      <SectionHeader eyebrow="POINTS" title={t('member.points')} description={t('member.sharedNotice')} />
      <MembershipGate>
        {(summary) => (
          <>
            <MembershipCard summary={summary} />
            <Card style={styles.stack}>
              <Text style={styles.label}>{t('member.qualifyingPoints')}</Text>
              <Text style={styles.value}>{format.points(summary.account.qualifyingPoints)} {t('member.pointsUnit')}</Text>
              {summary.account.nextExpiry ? <Badge label={t('member.expiring', { count: format.points(summary.account.nextExpiry.amount), date: format.date(summary.account.nextExpiry.expiresAt) })} tone="warning" /> : null}
              <Text style={styles.muted}>{t('member.earnRule', { yen: YEN_PER_BASE_POINT })}</Text>
            </Card>
            <SectionHeader title={t('member.tierBenefits', { tier: localize(summary.progress.current.name) })} />
            <Card style={styles.stack}><BenefitList tier={summary.progress.current} /></Card>
            <SectionHeader title={t('member.allTiers')} />
            {summary.tiers.map((tier) => <TierRow key={tier.tierId} tier={tier} isCurrent={tier.tierId === summary.progress.current.tierId} />)}
          </>
        )}
      </MembershipGate>
    </Screen>
  );
}

function BenefitList({ tier }: { tier: MembershipTier }) {
  const localize = useLocalized();
  return <>{tier.benefits.map((benefit, index) => <View key={index} style={styles.benefit}><Ionicons color={colors.accent} name="checkmark-circle-outline" size={18} /><Text style={styles.body}>{localize(benefit)}</Text></View>)}</>;
}

function TierRow({ tier, isCurrent }: { tier: MembershipTier; isCurrent: boolean }) {
  const { t } = useTranslation();
  const localize = useLocalized();
  const format = useMemberFormat();
  return (
    <Card style={[styles.stack, isCurrent && styles.current]}>
      <View style={styles.tierHeader}>
        <View style={[styles.swatch, { backgroundColor: tier.color }]} />
        <Text style={styles.tierName}>{localize(tier.name)}</Text>
        {isCurrent ? <Badge label={t('member.currentTier')} tone="success" /> : null}
      </View>
      <Text style={styles.muted}>{tier.qualifyingPoints === 0 ? t('member.tierEntry') : t('member.tierThreshold', { count: format.points(tier.qualifyingPoints) })} · {t('member.earnRate', { rate: tier.earnRate })}</Text>
      <BenefitList tier={tier} />
    </Card>
  );
}

export function PointHistoryScreen() {
  const { t } = useTranslation();
  const identity = useMemberIdentity();
  const history = usePointHistory(identity.userId);
  return (
    <Screen>
      <PageHeader title={t('member.history')} backLabel={t('common.back')} />
      <SectionHeader eyebrow="HISTORY" title={t('member.history')} description={t('member.sharedNotice')} />
      {identity.isDemo ? <Badge label={t('member.demoMember')} /> : null}
      <ContentGate state={history} onRetry={history.reload}>
        {({ transactions, hotels }) => transactions.length === 0
          ? <EmptyState title={t('member.historyEmpty')} />
          : <View style={styles.list}>{transactions.map((item) => <TransactionRow key={item.transactionId} item={item} hotelName={item.hotelId ? hotels.get(item.hotelId)?.name : undefined} />)}</View>}
      </ContentGate>
    </Screen>
  );
}

function TransactionRow({ item, hotelName }: { item: PointTransactionDocument; hotelName: LocalizedText | undefined }) {
  const { t } = useTranslation();
  const localize = useLocalized();
  const format = useMemberFormat();
  const positive = item.amount >= 0;
  return (
    <Card style={styles.transaction}>
      <View style={styles.transactionCopy}>
        <Text style={styles.tierName}>{hotelName ? localize(hotelName) : t('member.groupWide')}</Text>
        <Text style={styles.muted}>{format.date(item.createdAt)} · {t(`member.transactionTypes.${item.type}`)} · {localize(item.description)}</Text>
      </View>
      <Text style={[styles.amount, { color: positive ? colors.success : colors.error }]}>{format.signedPoints(item.amount)}</Text>
    </Card>
  );
}

export function CouponsScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('member.coupons')} backLabel={t('common.back')} /><SectionHeader eyebrow="COUPONS" title={t('member.coupons')} /><EmptyState title={t('state.empty')} message={t('member.couponsPhaseNotice')} /></Screen>;
}

const styles = StyleSheet.create({
  qr: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing.xs, padding: spacing.xl },
  stack: { gap: spacing.xs },
  current: { borderColor: colors.accent, borderWidth: 2 },
  label: { ...typography.caption, color: colors.textMuted },
  value: { ...typography.heading, color: colors.text },
  number: { ...typography.heading, color: colors.brand, letterSpacing: 2 },
  muted: { ...typography.caption, color: colors.textMuted },
  body: { ...typography.body, color: colors.text, flex: 1 },
  benefit: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  tierHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  swatch: { borderRadius: radii.pill, height: 14, width: 14 },
  tierName: { ...typography.label, color: colors.text, flex: 1 },
  list: { gap: spacing.sm },
  transaction: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  transactionCopy: { flex: 1, gap: spacing.xxs },
  amount: { ...typography.heading },
});
