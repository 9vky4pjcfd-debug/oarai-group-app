import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { DetailLayout } from '@/components/DetailLayout';
import { Badge, Button, Card, Screen } from '@/components/design-system';
import { PageHeader } from '@/components/PageHeader';
import { colors, DEFAULT_HOTEL_ID, spacing, typography } from '@/constants';
import { useLocalized, useRoom } from '@/features/content';
import { resolveContentImage } from '@/features/hotel/content-utils';
import { formatCapacity } from './room-format';

export function RoomDetailScreen() {
  const { id = '', hotelId = DEFAULT_HOTEL_ID } = useLocalSearchParams<{ id: string; hotelId?: string }>();
  const { t } = useTranslation();
  const l = useLocalized();
  const room = useRoom(hotelId, id);

  if (room.status !== 'ready' || !room.data) {
    return <Screen><PageHeader title={t('rooms.detail')} backLabel={t('common.back')} /><ContentGate state={room} onRetry={room.reload}>{() => null}</ContentGate></Screen>;
  }

  const data = room.data;
  const image = data.images[0];
  return (
    <DetailLayout image={image ? resolveContentImage(image) : undefined} title={l(data.name)} description={l(data.description)}>
      <Card style={styles.specs}>
        <Spec label={t('rooms.size')} value={l(data.roomSize)} />
        <Spec label={t('rooms.capacity')} value={formatCapacity(data, t)} />
        {data.bedType ? <Spec label={t('rooms.bedType')} value={l(data.bedType)} /> : null}
      </Card>
      {data.features.length > 0 ? <View style={styles.group}><Text style={styles.label}>{t('rooms.feature')}</Text><View style={styles.badges}>{data.features.map((item, index) => <Badge key={index} label={l(item)} />)}</View></View> : null}
      {data.amenities.length > 0 ? <View style={styles.group}><Text style={styles.label}>{t('rooms.amenities')}</Text><Text style={styles.body}>{data.amenities.map((item) => l(item)).join('・')}</Text></View> : null}
      <Button label={t('rooms.reservation')} onPress={() => router.push({ pathname: '/(tabs)/stay/reservation', params: { hotelId: data.hotelId, roomId: data.roomId } })} />
    </DetailLayout>
  );
}

function Spec({ label, value }: { label: string; value: string }) { return <View style={styles.spec}><Text style={styles.specLabel}>{label}</Text><Text style={styles.specValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  specs: { flexDirection: 'row', gap: spacing.sm }, spec: { flex: 1, gap: spacing.xxs }, specLabel: { ...typography.caption, color: colors.textMuted }, specValue: { ...typography.heading, color: colors.text },
  group: { gap: spacing.sm }, label: { ...typography.label, color: colors.text }, body: { ...typography.body, color: colors.textMuted }, badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
