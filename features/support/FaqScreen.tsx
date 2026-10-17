import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Screen, SectionHeader } from '@/components/design-system';
import { PageHeader } from '@/components/PageHeader';
import { colors, spacing, typography } from '@/constants';

const faqKeys = ['checkIn', 'parking', 'children'] as const;

export function FaqScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('support.faq')} backLabel={t('common.back')} /><SectionHeader eyebrow="Q&A" title={t('support.faq')} />{faqKeys.map((key) => <Card key={key} style={styles.card}><Text style={styles.question}>{t(`support.faqItems.${key}.question`)}</Text><Text style={styles.answer}>{t(`support.faqItems.${key}.answer`)}</Text></Card>)}</Screen>;
}
const styles = StyleSheet.create({ card: { gap: spacing.sm }, question: { ...typography.heading, color: colors.text }, answer: { ...typography.body, color: colors.textMuted } });
