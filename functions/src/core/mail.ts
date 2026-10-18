import { cancellationFee, freeCancellationUntil, sortedFeeTiers, stayNights } from '@/services/booking/booking-rules';
import type { BookingPolicy, ContentLanguage, LocalizedText, ReservationDocument } from '@/types';

/** A document in the `mail` collection, the format of the Firebase "Trigger Email from Firestore" extension. */
export interface MailDocument { to: string[]; message: { subject: string; text: string }; }

export interface MailContext { hotelName: LocalizedText; hotelPhone?: string | undefined; roomName: LocalizedText; }

const pick = (value: LocalizedText, language: ContentLanguage) => value[language] || value.ja || Object.values(value).find(Boolean) || '';
const yen = (amount: number) => `¥${amount.toLocaleString('ja-JP')}`;

const copy = {
  ja: {
    confirmedSubject: (hotel: string) => `【${hotel}】ご予約ありがとうございます`,
    cancelledSubject: (hotel: string) => `【${hotel}】ご予約のキャンセルを承りました`,
    confirmedIntro: (name: string) => `${name} 様\n\nこのたびはご予約いただきありがとうございます。以下の内容で承りました。`,
    cancelledIntro: (name: string) => `${name} 様\n\n以下のご予約のキャンセルを承りました。またのご利用をお待ちしております。`,
    code: '予約番号', hotel: '施設', room: '客室', stay: 'ご宿泊', nights: (n: number) => `${n}泊`, rooms: (n: number) => `${n}室`,
    party: (a: number, c: number, i: number) => [`大人${a}名`, c ? `お子様${c}名` : '', i ? `幼児${i}名` : ''].filter(Boolean).join('・'),
    total: '料金合計（税・サービス料込）', payment: 'お支払い', payAtHotel: 'ご到着日に館にてお支払いください（現金またはクレジットカード）',
    cancellation: 'キャンセル料', freeUntil: (date: string) => `${date}までアプリから無料でキャンセルできます。`,
    tier: (days: number, rate: number, amount: string) => `${days === 0 ? '当日' : days === 1 ? '前日' : `${days}日前`}：${Math.round(rate * 100)}%（${amount}）`,
    noShow: (amount: string) => `連絡なしの不泊：100%（${amount}）`,
    phone: (phone: string) => `ご変更・お問い合わせ：${phone}`,
    footer: '大洗グループ\n※このメールは送信専用です。',
  },
  'zh-TW': {
    confirmedSubject: (hotel: string) => `【${hotel}】感謝您的預約`,
    cancelledSubject: (hotel: string) => `【${hotel}】已為您取消預約`,
    confirmedIntro: (name: string) => `${name} 您好：\n\n感謝您的預約，以下為預約內容。`,
    cancelledIntro: (name: string) => `${name} 您好：\n\n以下預約已為您取消，期待您再次光臨。`,
    code: '預約編號', hotel: '館別', room: '房型', stay: '住宿', nights: (n: number) => `${n} 晚`, rooms: (n: number) => `${n} 間`,
    party: (a: number, c: number, i: number) => [`大人 ${a} 位`, c ? `兒童 ${c} 位` : '', i ? `幼兒 ${i} 位` : ''].filter(Boolean).join('、'),
    total: '費用合計（含稅及服務費）', payment: '付款方式', payAtHotel: '入住當天於館內付款（現金或信用卡）',
    cancellation: '取消費', freeUntil: (date: string) => `${date} 前可在 APP 免費取消。`,
    tier: (days: number, rate: number, amount: string) => `${days === 0 ? '當天' : days === 1 ? '前一天' : `${days} 天前`}：${Math.round(rate * 100)}%（${amount}）`,
    noShow: (amount: string) => `未聯絡未入住：100%（${amount}）`,
    phone: (phone: string) => `變更或洽詢：${phone}`,
    footer: '大洗集團\n※此信件為系統自動發送，請勿直接回覆。',
  },
  en: {
    confirmedSubject: (hotel: string) => `[${hotel}] Thank you for your reservation`,
    cancelledSubject: (hotel: string) => `[${hotel}] Your reservation has been cancelled`,
    confirmedIntro: (name: string) => `Dear ${name},\n\nThank you for your reservation. Here are the details.`,
    cancelledIntro: (name: string) => `Dear ${name},\n\nThe reservation below has been cancelled. We hope to welcome you another time.`,
    code: 'Confirmation code', hotel: 'Hotel', room: 'Room', stay: 'Stay', nights: (n: number) => `${n} night${n === 1 ? '' : 's'}`, rooms: (n: number) => `${n} room${n === 1 ? '' : 's'}`,
    party: (a: number, c: number, i: number) => [`${a} adult${a === 1 ? '' : 's'}`, c ? `${c} child${c === 1 ? '' : 'ren'}` : '', i ? `${i} infant${i === 1 ? '' : 's'}` : ''].filter(Boolean).join(', '),
    total: 'Total (tax and service included)', payment: 'Payment', payAtHotel: 'Pay at the hotel on arrival (cash or credit card)',
    cancellation: 'Cancellation fees', freeUntil: (date: string) => `Free cancellation in the app until ${date}.`,
    tier: (days: number, rate: number, amount: string) => `${days === 0 ? 'On the day' : days === 1 ? 'The day before' : `${days} days before`}: ${Math.round(rate * 100)}% (${amount})`,
    noShow: (amount: string) => `No-show without notice: 100% (${amount})`,
    phone: (phone: string) => `Changes and questions: ${phone}`,
    footer: 'Oarai Group\nThis is an automated message; replies are not monitored.',
  },
} as const;

function details(reservation: ReservationDocument, context: MailContext, language: ContentLanguage): string[] {
  const t = copy[language];
  const nights = stayNights(reservation.checkIn, reservation.checkOut).length;
  return [
    `${t.code}：${reservation.confirmationCode}`,
    `${t.hotel}：${pick(context.hotelName, language)}`,
    `${t.room}：${pick(context.roomName, language)} × ${t.rooms(reservation.rooms)}`,
    `${t.stay}：${reservation.checkIn} → ${reservation.checkOut}（${t.nights(nights)}）`,
    `${t.party(reservation.adults, reservation.children, reservation.infants)}`,
    `${t.total}：${yen(reservation.totalAmount)}`,
  ];
}

export function guestConfirmationMail(reservation: ReservationDocument, context: MailContext, language: ContentLanguage, policy: BookingPolicy): MailDocument {
  const t = copy[language];
  const hotel = pick(context.hotelName, language);
  const fees = sortedFeeTiers(policy).map((tier) => t.tier(tier.daysBefore, tier.rate, yen(cancellationFee(reservation.totalAmount, tier.rate))));
  const text = [
    t.confirmedIntro(reservation.contact.name), '',
    ...details(reservation, context, language), '',
    `${t.payment}：${t.payAtHotel}`, '',
    `${t.cancellation}`, t.freeUntil(freeCancellationUntil(reservation.checkIn, policy)), ...fees, t.noShow(yen(cancellationFee(reservation.totalAmount, policy.noShowRate))), '',
    ...(context.hotelPhone ? [t.phone(context.hotelPhone), ''] : []),
    t.footer,
  ].join('\n');
  return { to: [reservation.contact.email], message: { subject: t.confirmedSubject(hotel), text } };
}

export function guestCancellationMail(reservation: ReservationDocument, context: MailContext, language: ContentLanguage): MailDocument {
  const t = copy[language];
  const hotel = pick(context.hotelName, language);
  const text = [t.cancelledIntro(reservation.contact.name), '', ...details(reservation, context, language), '', ...(context.hotelPhone ? [t.phone(context.hotelPhone), ''] : []), t.footer].join('\n');
  return { to: [reservation.contact.email], message: { subject: t.cancelledSubject(hotel), text } };
}

/** Notice to the hotel's reservation staff, always in Japanese, so they can enter the booking into 支配人くん. */
export function hotelNoticeMail(reservation: ReservationDocument, context: MailContext, to: string[], kind: 'created' | 'cancelled'): MailDocument {
  const created = kind === 'created';
  const text = [
    created ? 'アプリから新しいご予約が入りました。支配人くんへ入力し、該当客室を手仕舞いしてください。' : 'アプリのご予約がお客様によりキャンセルされました。支配人くんの予約を取り消し、客室を戻してください。',
    '',
    ...details(reservation, context, 'ja'),
    `お名前：${reservation.contact.name}`,
    `電話：${reservation.contact.phone}`,
    `メール：${reservation.contact.email}`,
    `ご要望：${reservation.notes || 'なし'}`,
    '',
    'お支払い：現地精算',
    '大洗グループ アプリ予約システム',
  ].join('\n');
  const subject = `【アプリ予約】${created ? '新規' : 'キャンセル'} ${reservation.checkIn} ${pick(context.roomName, 'ja')} ${reservation.contact.name}様（${reservation.confirmationCode}）`;
  return { to, message: { subject, text } };
}
