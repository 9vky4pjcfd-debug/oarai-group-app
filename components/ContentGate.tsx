import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, LoadingState } from '@/components/design-system';
import type { ContentState } from '@/features/content';

/** Renders loading / error / not-found states and hands ready, non-null data to `children`. */
export function ContentGate<T>({ state, onRetry, children }: { state: ContentState<T>; onRetry: () => void; children: (data: NonNullable<T>) => React.ReactNode }) {
  const { t } = useTranslation();
  if (state.status === 'loading') return <LoadingState label={t('state.loading')} />;
  if (state.status === 'error') return <ErrorState title={t('state.error')} retryLabel={t('common.retry')} onRetry={onRetry} />;
  if (state.data == null) return <EmptyState title={t('state.empty')} />;
  return <>{children(state.data as NonNullable<T>)}</>;
}
