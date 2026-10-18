import { useState } from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { FormField } from '@/components/FormField';
import { Button, Card } from '@/components/design-system';
import { useContent } from '@/features/content';
import { HotelPicker } from '@/features/hotels/HotelPicker';
import { services } from '@/services';
import type { BookingContacts, HotelPublicProfile } from '@/types';
import { MAX_CONTACT_EMAILS, parseEmailList } from './admin-rules';
import { AdminGate, AdminScreen, HotelScope, Message, adminStyles, useAdminError } from './AdminUI';

export function ContactsScreen() {
  const { t } = useTranslation();
  return (
    <AdminScreen title={t('admin.contacts.title')} description={t('admin.contacts.description')}>
      <AdminGate minimum="manager">{(user) => <HotelScope user={user}>{(hotels) => <Contacts hotels={hotels} />}</HotelScope>}</AdminGate>
    </AdminScreen>
  );
}

function Contacts({ hotels }: { hotels: HotelPublicProfile[] }) {
  const [hotelId, setHotelId] = useState(hotels[0]!.hotelId);
  const contacts = useContent(`admin-contacts:${hotelId}`, () => services.admin.getBookingContacts(hotelId));
  return (
    <>
      {hotels.length > 1 ? <HotelPicker hotels={hotels} selected={hotelId} onSelect={setHotelId} /> : null}
      <ContentGate state={contacts} onRetry={contacts.reload}>{(data) => <ContactsForm key={hotelId} hotelId={hotelId} initial={data} />}</ContentGate>
    </>
  );
}

function ContactsForm({ hotelId, initial }: { hotelId: string; initial: BookingContacts }) {
  const { t } = useTranslation();
  const errorText = useAdminError();
  const [text, setText] = useState(initial.emails.join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { emails, invalid } = parseEmailList(text);
  const problem = invalid.length > 0 ? t('admin.validation.emails', { emails: invalid.join(', ') })
    : emails.length > MAX_CONTACT_EMAILS ? t('admin.validation.emailsMax', { count: MAX_CONTACT_EMAILS }) : null;

  const save = async () => {
    setSaved(false);
    setError(problem);
    if (problem) return;
    setSaving(true);
    try {
      await services.admin.setBookingContacts({ hotelId, emails });
      setText(emails.join('\n'));
      setSaved(true);
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={adminStyles.card}>
      <FormField label={t('admin.contacts.emails')} value={text} onChangeText={(value) => { setText(value); setSaved(false); }} multiline autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="frontdesk@example.com" />
      <Text style={adminStyles.muted}>{t('admin.contacts.hint', { count: MAX_CONTACT_EMAILS })}</Text>
      {emails.length === 0 ? <Text style={adminStyles.muted}>{t('admin.contacts.emptyWarning')}</Text> : null}
      <Message text={error} tone="error" />
      <Message text={saved ? t('admin.contacts.saved') : null} tone="success" />
      <Button label={t('admin.save')} loading={saving} onPress={save} />
    </Card>
  );
}
