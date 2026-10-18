import { httpsCallable } from 'firebase/functions';
import type { AdminGateway } from '@/repositories/admin/AdminGateway';
import { getFunctionsClient } from '@/services/firebase';
import { mapCallableError } from '@/services/errors';
import type {
  AdminNotice, BookingContacts, InventoryQuery, InventoryRow, InventoryUpdate, InventoryUpdateResult, ReservationDocument, ReservationQuery, SeedResult, StaffMember, StaffUpdate,
} from '@/types';

async function call<Request, Response>(name: string, data: Request): Promise<Response> {
  try { return (await httpsCallable<Request, Response>(getFunctionsClient(), name)(data)).data; }
  catch (error) { throw mapCallableError(error); }
}

/** Calls the `admin*` Cloud Functions. Dates come back as ISO strings. */
export class FirebaseAdminGateway implements AdminGateway {
  readonly available = true;
  async getInventory(query: InventoryQuery) { return (await call<InventoryQuery, { rows: InventoryRow[] }>('adminGetInventory', query)).rows; }
  updateInventory(update: InventoryUpdate) { return call<InventoryUpdate, InventoryUpdateResult>('adminSetInventory', update); }
  getBookingContacts(hotelId: string) { return call<{ hotelId: string }, BookingContacts>('adminGetBookingContacts', { hotelId }); }
  async setBookingContacts(contacts: BookingContacts) { await call('adminSetBookingContacts', contacts); }
  async listNotices() { return (await call<Record<string, never>, { notices: AdminNotice[] }>('adminListNotices', {})).notices; }
  saveNotice(notice: AdminNotice) { return call<AdminNotice, AdminNotice>('adminSaveNotice', notice); }
  async deleteNotice(noticeId: string) { await call('adminDeleteNotice', { noticeId }); }
  async listReservations(query: ReservationQuery) { return (await call<ReservationQuery, { reservations: ReservationDocument[] }>('adminListReservations', query)).reservations; }
  async listStaff() { return (await call<Record<string, never>, { staff: StaffMember[] }>('adminListStaff', {})).staff; }
  async setStaff(update: StaffUpdate) { await call('adminSetStaff', update); }
  async claimOwner() { await call('adminClaimOwner', {}); }
  seedContent(overwrite: boolean) { return call<{ overwrite: boolean }, SeedResult>('adminSeedContent', { overwrite }); }
}
