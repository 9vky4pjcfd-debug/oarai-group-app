import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/design-system';
import { ContentGate } from '@/components/ContentGate';
import { environmentConfig } from '@/config';
import { useAuthState } from '@/features/auth/AuthProvider';
import { defaultDisplayName, memberLanguage } from '@/features/auth/auth-ui';
import { SignInPrompt } from '@/features/auth/SignInPrompt';
import { useContent } from '@/features/content';
import { services } from '@/services';
import { loadMembership, useMemberIdentity, type MembershipSummary } from './membership';

/** Resolves the current member and their group membership, then renders `children` with it. */
export function MembershipGate({ children }: { children: (summary: MembershipSummary) => React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const auth = useAuthState();
  const identity = useMemberIdentity();
  const user = auth.status === 'authenticated' ? auth.session.user : null;
  const membership = useContent(`membership:${identity.userId ?? '-'}`, async () => {
    const summary = await loadMembership(identity.userId);
    if (summary || !user || environmentConfig.backendMode !== 'firebase') return summary;
    // A signed-in user without a membership yet (e.g. the profile step failed at sign-up) gets one now.
    await services.member.ensureProfile({ displayName: defaultDisplayName(user), preferredLanguage: memberLanguage(i18n.resolvedLanguage ?? i18n.language) });
    const created = await loadMembership(identity.userId);
    if (!created) throw new Error('Membership is still missing after ensureProfile.');
    return created;
  });
  if (identity.status === 'signed-out') return <SignInPrompt title={t('member.title')} description={t('member.signInRequired')} />;
  return (
    <>
      {identity.isDemo ? <Badge label={t('member.demoMember')} /> : null}
      <ContentGate state={membership} onRetry={membership.reload}>{children}</ContentGate>
    </>
  );
}
