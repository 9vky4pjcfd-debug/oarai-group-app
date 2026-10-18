import type { AdminGateway } from '@/repositories/admin/AdminGateway';
import { AppError } from '@/types';

const unavailable = async (): Promise<never> => { throw new AppError('MAINTENANCE', 'Hotel tools need the Firebase backend.'); };

/** Demo mode has no server, so the hotel tools are hidden and every call fails. */
export class UnavailableAdminGateway implements AdminGateway {
  readonly available = false;
  getInventory = unavailable;
  updateInventory = unavailable;
  getBookingContacts = unavailable;
  setBookingContacts = unavailable;
  listNotices = unavailable;
  saveNotice = unavailable;
  deleteNotice = unavailable;
  listReservations = unavailable;
  listStaff = unavailable;
  setStaff = unavailable;
  claimOwner = unavailable;
  seedContent = unavailable;
}
