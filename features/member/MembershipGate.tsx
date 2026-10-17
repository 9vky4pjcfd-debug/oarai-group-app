import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/design-system';
import { ContentGate } from '@/components/ContentGate';
import { PlaceholderPanel } from '@/components/PlaceholderPanel';
import { useMemberIdentity, useMembership, type MembershipSummary } from './membership';

/** Resolves the current member and their group membership, then renders `children` with it. */
export function MembershipGate({ children }: { children: (summary: MembershipSummary) => React.ReactNode }) {
  const { t } = useTranslation();
  const identity = useMemberIdentity();
  const membership = useMembership(identity.userId);
  if (identity.status === 'signed-out') return <PlaceholderPanel icon="person-circle-outline" title={t('member.title')} description={t('member.signInRequired')} />;
  return (
    <>
      {identity.isDemo ? <Badge label={t('member.demoMember')} /> : null}
      <ContentGate state={membership} onRetry={membership.reload}>{children}</ContentGate>
    </>
  );
}
