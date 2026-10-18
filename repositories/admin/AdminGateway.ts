import type { AdminService } from '@/services/contracts';

/** Hotel-side commands; always server calls, because every one of them is authorised by Custom Claims on the server. */
export type AdminGateway = AdminService;
