import type { NotificationPreferences } from '@/types';

export interface AppSettingsState {
  notifications: NotificationPreferences;
}

export const initialAppSettings: AppSettingsState = {
  notifications: {
    hotelInformation: false,
    reservationUpdates: false,
    offers: false,
  },
};
