import { DEFAULT_HOTEL_ID } from '@/constants';
import { services } from '@/services';

export { FacilityDetailScreen as default } from '@/features/facilities/FacilityDetailScreen';

/** Pre-renders one page per facility for the static web build. */
export async function generateStaticParams() {
  const facilities = await services.hotelContent.getFacilities(DEFAULT_HOTEL_ID);
  return facilities.map((facility) => ({ id: facility.facilityId }));
}
