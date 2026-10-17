import { services } from '@/services';

export { NewsDetailScreen as default } from '@/features/news/NewsScreens';

/** Pre-renders one page per notice for the static web build. */
export async function generateStaticParams() {
  const notices = await services.hotelContent.getAllNotices();
  return notices.map((notice) => ({ noticeId: notice.noticeId }));
}
