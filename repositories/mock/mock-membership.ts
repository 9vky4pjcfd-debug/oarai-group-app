import type { MembershipTier, MemberProfileDocument, PointAccountDocument, PointTransactionDocument } from '@/types';
import { DOGGYS_COAST_ID, GYORAIAN_ID, ROMANKAN_ID } from './mock-group-hotels';
import { lt, OARAI_HOTEL_ID } from './mock-hotel-content';

// Provisional programme for the demo: 1 point per ¥100 at any group hotel, tier by base points
// earned in the rolling 12 months. Replace with the confirmed rules in Firestore `membershipTiers`.
export const mockMembershipTiers: MembershipTier[] = [
  {
    tierId: 'blue', name: lt('ブルー', '藍卡', 'Blue'), qualifyingPoints: 0, earnRate: 1, color: '#20A9CD', sortOrder: 1,
    benefits: [lt('ご利用100円ごとに1ポイント', '每消費100日圓累積1點', '1 point per ¥100 spent'), lt('グループ全館で貯める・使える', '集團各館皆可累積與使用', 'Earn and use at every group hotel')],
  },
  {
    tierId: 'silver', name: lt('シルバー', '銀卡', 'Silver'), qualifyingPoints: 500, earnRate: 1.25, color: '#7D8E96', sortOrder: 2,
    benefits: [lt('ポイント1.25倍', '點數1.25倍', '1.25× points'), lt('会員限定プランのご案内', '會員限定方案通知', 'Members-only plans')],
  },
  {
    tierId: 'gold', name: lt('ゴールド', '金卡', 'Gold'), qualifyingPoints: 1500, earnRate: 1.5, color: '#B08A3E', sortOrder: 3,
    benefits: [lt('ポイント1.5倍', '點數1.5倍', '1.5× points'), lt('会員限定プランのご案内', '會員限定方案通知', 'Members-only plans'), lt('レイトチェックアウト（空室時）', '延後退房（視空房情況）', 'Late check-out (subject to availability)')],
  },
  {
    tierId: 'platinum', name: lt('プラチナ', '白金卡', 'Platinum'), qualifyingPoints: 4000, earnRate: 2, color: '#3E4C5E', sortOrder: 4,
    benefits: [lt('ポイント2倍', '點數2倍', '2× points'), lt('会員限定プランのご案内', '會員限定方案通知', 'Members-only plans'), lt('レイトチェックアウト（空室時）', '延後退房（視空房情況）', 'Late check-out (subject to availability)'), lt('客室アップグレード（空室時）', '客房升等（視空房情況）', 'Room upgrade (subject to availability)')],
  },
];

export const DEMO_MEMBER_ID = 'demo-member';
const audit = { createdAt: '2025-11-03T06:00:00.000Z', updatedAt: '2026-09-22T02:00:00.000Z' };

export function mockMemberProfile(userId: string): MemberProfileDocument {
  return { userId, membershipNumber: 'OG-2025-110301', displayName: '大洗 太郎', preferredLanguage: 'ja', homeHotelId: OARAI_HOTEL_ID, ...audit };
}

const stay = lt('ご宿泊', '住宿', 'Stay');
const redeem = lt('ポイント利用（ご精算）', '使用點數折抵', 'Points used at check-out');
type Entry = Pick<PointTransactionDocument, 'hotelId' | 'type' | 'amount' | 'description' | 'createdAt'>;

// Oldest first, so running balances can be derived. Amounts already include the tier bonus at the time.
const demoEntries: Entry[] = [
  { hotelId: OARAI_HOTEL_ID, type: 'earn', amount: 380, description: stay, createdAt: '2025-11-03T06:00:00.000Z' },
  { hotelId: ROMANKAN_ID, type: 'earn', amount: 520, description: stay, createdAt: '2026-01-12T06:00:00.000Z' },
  { hotelId: GYORAIAN_ID, type: 'earn', amount: 150, description: stay, createdAt: '2026-03-08T06:00:00.000Z' },
  { hotelId: ROMANKAN_ID, type: 'redeem', amount: -300, description: redeem, createdAt: '2026-05-15T01:30:00.000Z' },
  { hotelId: DOGGYS_COAST_ID, type: 'earn', amount: 450, description: stay, createdAt: '2026-08-10T06:00:00.000Z' },
  { hotelId: OARAI_HOTEL_ID, type: 'earn', amount: 600, description: stay, createdAt: '2026-09-21T06:00:00.000Z' },
];

export function mockPointTransactions(userId: string): PointTransactionDocument[] {
  let balance = 0;
  return demoEntries.map((entry, index) => {
    const balanceBefore = balance;
    balance += entry.amount;
    return { ...entry, transactionId: `demo-${index + 1}`, userId, balanceBefore, balanceAfter: balance, source: entry.type === 'earn' ? 'stay' : 'checkout', referenceId: `DEMO-${index + 1}` };
  }).reverse();
}

export function mockPointAccount(userId: string): PointAccountDocument {
  const [latest] = mockPointTransactions(userId);
  return {
    userId,
    balance: latest?.balanceAfter ?? 0,
    // Base points of the earn entries above (380 + 520 + 120 + 360 + 480).
    qualifyingPoints: 1860,
    tierId: 'gold',
    tierEvaluatedAt: '2026-09-22T02:00:00.000Z',
    nextExpiry: { amount: 80, expiresAt: '2027-11-30T14:59:59.000Z' },
    version: demoEntries.length,
    ...audit,
  };
}
