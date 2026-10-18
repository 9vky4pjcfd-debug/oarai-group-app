import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { FormField } from '@/components/FormField';
import { Badge, Button, Card, EmptyState } from '@/components/design-system';
import { colors, radii, spacing, typography } from '@/constants';
import { useContent, useLocalized } from '@/features/content';
import { useNewsFormat } from '@/features/news/news-format';
import { addDays, isDateOnly } from '@/services/booking/booking-rules';
import { services } from '@/services';
import type { AdminNotice, ContentLanguage, HotelPublicProfile, NoticeCategory, User } from '@/types';
import { cleanLocalized, isHttpsUrl, jstDate, jstMidnightIso } from './admin-rules';
import { AdminGate, AdminScreen, Chip, ChipRow, ConfirmCard, HotelScope, Message, adminStyles, useAdminError } from './AdminUI';

const categories: NoticeCategory[] = ['news', 'campaign', 'facility', 'important'];
const languages: ContentLanguage[] = ['ja', 'zh-TW', 'en'];

export function NoticesScreen() {
  const { t } = useTranslation();
  return (
    <AdminScreen title={t('admin.notices.title')} description={t('admin.notices.description')}>
      <AdminGate minimum="staff">{(user) => <HotelScope user={user}>{(hotels) => <Notices user={user} hotels={hotels} />}</HotelScope>}</AdminGate>
    </AdminScreen>
  );
}

function Notices({ user, hotels }: { user: User; hotels: HotelPublicProfile[] }) {
  const { t } = useTranslation();
  const notices = useContent('admin-notices', () => services.admin.listNotices());
  const [editing, setEditing] = useState<AdminNotice | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const blank = (): AdminNotice => ({ noticeId: '', hotelId: hotels[0]!.hotelId, category: 'news', priority: 'normal', title: {}, body: {}, publishedAt: jstMidnightIso(services.reservations.today()), sortOrder: 0, published: false });
  const finish = (text: string) => { setEditing(null); setMessage(text); notices.reload(); };

  if (editing) return <NoticeForm key={editing.noticeId || 'new'} notice={editing} user={user} hotels={hotels} onDone={finish} onCancel={() => setEditing(null)} />;
  return (
    <>
      <Message text={message} tone="success" />
      <Button label={t('admin.notices.new')} onPress={() => { setMessage(null); setEditing(blank()); }} />
      <ContentGate state={notices} onRetry={notices.reload}>
        {(list) => list.length === 0
          ? <EmptyState title={t('admin.notices.empty')} />
          : <View style={styles.list}>{list.map((notice) => <NoticeItem key={notice.noticeId} notice={notice} hotels={hotels} onPress={() => { setMessage(null); setEditing(notice); }} />)}</View>}
      </ContentGate>
    </>
  );
}

function NoticeItem({ notice, hotels, onPress }: { notice: AdminNotice; hotels: HotelPublicProfile[]; onPress: () => void }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const format = useNewsFormat();
  const hotel = hotels.find((item) => item.hotelId === notice.hotelId);
  const period = notice.expiresAt ? `${format.date(notice.publishedAt)} – ${format.date(lastShownIso(notice.expiresAt))}` : `${format.date(notice.publishedAt)} –`;
  return (
    <Pressable accessibilityRole="button" accessibilityHint={t('admin.edit')} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={adminStyles.rowWrap}>
        <Badge label={notice.published ? t('admin.notices.published') : t('admin.notices.draft')} tone={notice.published ? 'success' : 'warning'} />
        <Badge label={t(`news.categories.${notice.category}`)} />
        {notice.priority === 'important' ? <Badge label={t('news.important')} tone="warning" /> : null}
      </View>
      <Text style={styles.hotel}>{notice.hotelId === null ? t('news.groupWide') : hotel ? l(hotel.name) : notice.hotelId}</Text>
      <Text style={adminStyles.label}>{l(notice.title) || t('admin.notices.untitled')}</Text>
      <Text style={adminStyles.muted}>{period}</Text>
    </Pressable>
  );
}

/** Notices hide at 00:00 Japan time on `expiresAt`; staff enter the last day shown instead. */
const lastShownDate = (expiresAt: string) => addDays(jstDate(expiresAt), -1);
const lastShownIso = (expiresAt: string) => jstMidnightIso(lastShownDate(expiresAt));

type Texts = Record<ContentLanguage, string>;
const toTexts = (value: AdminNotice['title']): Texts => ({ ja: value.ja ?? '', 'zh-TW': value['zh-TW'] ?? '', en: value.en ?? '' });

function NoticeForm({ notice, user, hotels, onDone, onCancel }: { notice: AdminNotice; user: User; hotels: HotelPublicProfile[]; onDone: (message: string) => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const errorText = useAdminError();
  const isNew = notice.noticeId === '';
  const initialPublished = jstDate(notice.publishedAt);
  const initialExpires = notice.expiresAt ? lastShownDate(notice.expiresAt) : '';
  const [hotelId, setHotelId] = useState(notice.hotelId);
  const [category, setCategory] = useState(notice.category);
  const [priority, setPriority] = useState(notice.priority);
  const [title, setTitle] = useState(toTexts(notice.title));
  const [body, setBody] = useState(toTexts(notice.body));
  const [publishedDate, setPublishedDate] = useState(initialPublished);
  const [expiresDate, setExpiresDate] = useState(initialExpires);
  const [linkUrl, setLinkUrl] = useState(notice.linkUrl ?? '');
  const [published, setPublished] = useState(notice.published);
  const [sortOrder, setSortOrder] = useState(String(notice.sortOrder));
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = linkUrl.trim();
  const errors = {
    title: title.ja.trim() ? undefined : t('admin.validation.jaRequired'),
    body: body.ja.trim() ? undefined : t('admin.validation.jaRequired'),
    publishedAt: isDateOnly(publishedDate) ? undefined : t('admin.validation.date'),
    expiresAt: expiresDate === '' ? undefined : !isDateOnly(expiresDate) ? t('admin.validation.date') : isDateOnly(publishedDate) && expiresDate < publishedDate ? t('admin.validation.expiresBefore') : undefined,
    linkUrl: link === '' || isHttpsUrl(link) ? undefined : t('admin.validation.https'),
    sortOrder: /^-?\d+$/.test(sortOrder.trim()) ? undefined : t('admin.validation.integer'),
  };
  const valid = Object.values(errors).every((value) => value === undefined);
  const show = (message: string | undefined) => (submitted ? message : undefined);

  const save = async () => {
    setSubmitted(true);
    setError(null);
    if (!valid) return;
    const next: AdminNotice = {
      noticeId: notice.noticeId, hotelId, category, priority, published,
      title: cleanLocalized(title), body: cleanLocalized(body),
      publishedAt: publishedDate === initialPublished ? notice.publishedAt : jstMidnightIso(publishedDate),
      sortOrder: Number(sortOrder.trim()),
      ...(expiresDate ? { expiresAt: expiresDate === initialExpires && notice.expiresAt ? notice.expiresAt : jstMidnightIso(addDays(expiresDate, 1)) } : {}),
      ...(link ? { linkUrl: link } : {}),
    };
    setBusy('save');
    try {
      await services.admin.saveNotice(next);
      onDone(t('admin.notices.saved'));
    } catch (caught) {
      setError(errorText(caught));
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy('delete');
    setError(null);
    try {
      await services.admin.deleteNotice(notice.noticeId);
      onDone(t('admin.notices.deleted'));
    } catch (caught) {
      setError(errorText(caught));
      setBusy(null);
    }
  };

  return (
    <Card style={adminStyles.card}>
      <Text style={adminStyles.heading}>{isNew ? t('admin.notices.new') : t('admin.notices.edit')}</Text>
      <ChipRow label={t('admin.hotel')}>
        {user.role === 'admin' ? <Chip label={t('news.groupWide')} selected={hotelId === null} onPress={() => setHotelId(null)} /> : null}
        {hotels.map((hotel) => <Chip key={hotel.hotelId} label={l(hotel.name)} selected={hotelId === hotel.hotelId} onPress={() => setHotelId(hotel.hotelId)} />)}
      </ChipRow>
      <ChipRow label={t('admin.notices.category')}>
        {categories.map((value) => <Chip key={value} label={t(`news.categories.${value}`)} selected={category === value} onPress={() => setCategory(value)} />)}
      </ChipRow>
      <ChipRow label={t('admin.notices.priority')}>
        {(['normal', 'important'] as const).map((value) => <Chip key={value} label={t(`admin.notices.priorities.${value}`)} selected={priority === value} onPress={() => setPriority(value)} />)}
      </ChipRow>
      {languages.map((language) => (
        <View key={language} style={styles.language}>
          <Text style={adminStyles.label}>{t(`admin.notices.languages.${language}`)}</Text>
          <FormField label={t('admin.notices.noticeTitle')} value={title[language]} onChangeText={(value) => setTitle({ ...title, [language]: value })} maxLength={120} error={language === 'ja' ? show(errors.title) : undefined} />
          <FormField label={t('admin.notices.body')} value={body[language]} onChangeText={(value) => setBody({ ...body, [language]: value })} multiline maxLength={4000} error={language === 'ja' ? show(errors.body) : undefined} />
        </View>
      ))}
      <View style={adminStyles.fields}>
        <View style={adminStyles.fieldItem}><FormField label={t('admin.notices.publishedAt')} value={publishedDate} onChangeText={setPublishedDate} placeholder="YYYY-MM-DD" autoCapitalize="none" error={show(errors.publishedAt)} /></View>
        <View style={adminStyles.fieldItem}><FormField label={t('admin.notices.expiresAt')} value={expiresDate} onChangeText={setExpiresDate} placeholder={t('admin.optional')} autoCapitalize="none" error={show(errors.expiresAt)} /></View>
      </View>
      <Text style={adminStyles.muted}>{t('admin.notices.datesHint')}</Text>
      <FormField label={t('admin.notices.linkUrl')} value={linkUrl} onChangeText={setLinkUrl} placeholder="https://" autoCapitalize="none" keyboardType="url" error={show(errors.linkUrl)} />
      <FormField label={t('admin.notices.sortOrder')} value={sortOrder} onChangeText={setSortOrder} keyboardType="numbers-and-punctuation" error={show(errors.sortOrder)} />
      <Text style={adminStyles.muted}>{t('admin.notices.sortOrderHint')}</Text>
      <ChipRow label={t('admin.notices.visibility')}>
        <Chip label={t('admin.notices.draft')} selected={!published} onPress={() => setPublished(false)} />
        <Chip label={t('admin.notices.published')} selected={published} onPress={() => setPublished(true)} />
      </ChipRow>
      <Message text={submitted && !valid ? t('admin.validation.fixFields') : null} tone="error" />
      <Message text={error} tone="error" />
      <Button label={t('admin.save')} loading={busy === 'save'} disabled={busy !== null} onPress={save} />
      <Button label={t('admin.cancel')} variant="ghost" disabled={busy !== null} onPress={onCancel} />
      {!isNew && !confirming ? <Button label={t('admin.delete')} variant="secondary" disabled={busy !== null} onPress={() => setConfirming(true)} /> : null}
      {!isNew && confirming ? <ConfirmCard message={t('admin.notices.deleteConfirm')} confirmLabel={t('admin.deleteYes')} cancelLabel={t('admin.cancel')} loading={busy === 'delete'} onConfirm={remove} onCancel={() => setConfirming(false)} /> : null}
    </Card>
  );
}


const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, gap: spacing.xxs, padding: spacing.md },
  pressed: { opacity: 0.78 },
  hotel: { ...typography.caption, color: colors.brand },
  language: { borderTopColor: colors.border, borderTopWidth: 1, gap: spacing.xs, paddingTop: spacing.sm },
});
