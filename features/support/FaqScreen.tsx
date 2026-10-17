import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { Card, EmptyState, Screen, ScreenSection, SectionHeader } from '@/components/design-system';
import { PageHeader } from '@/components/PageHeader';
import { colors, DEFAULT_HOTEL_ID, spacing, typography } from '@/constants';
import { useFaq, useHotels, useLocalized } from '@/features/content';
import { HotelPicker } from '@/features/hotels/HotelPicker';

export function FaqScreen() {
  const { t } = useTranslation();
  const l = useLocalized();
  const hotels = useHotels();
  const [selected, setSelected] = useState(DEFAULT_HOTEL_ID);
  const faq = useFaq(selected);
  return (
    <Screen>
      <PageHeader title={t('support.faq')} backLabel={t('common.back')} />
      <SectionHeader eyebrow="Q&A" title={t('support.faq')} />
      <ContentGate state={hotels} onRetry={hotels.reload}>
        {(list) => <HotelPicker hotels={list} selected={selected} onSelect={setSelected} />}
      </ContentGate>
      <ContentGate state={faq} onRetry={faq.reload}>
        {(items) => items.length === 0
          ? <EmptyState title={t('state.empty')} message={t('ui.contactIntro')} />
          : <ScreenSection>{items.map((item) => <Card key={item.faqId} style={styles.card}><Text style={styles.question}>{l(item.question)}</Text><Text style={styles.answer}>{l(item.answer)}</Text></Card>)}</ScreenSection>}
      </ContentGate>
    </Screen>
  );
}
const styles = StyleSheet.create({ card: { gap: spacing.sm }, question: { ...typography.heading, color: colors.text }, answer: { ...typography.body, color: colors.textMuted } });
