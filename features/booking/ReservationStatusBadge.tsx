import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/design-system';
import type { ReservationStatus } from '@/types';

const tones = { pending: 'warning', confirmed: 'success', cancelled: 'warning', completed: 'info' } as const;

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { t } = useTranslation();
  return <Badge label={t(`booking.status.${status}`)} tone={tones[status]} />;
}
