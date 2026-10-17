import type { Notice } from '@/types';
import { DOGGYS_COAST_ID, GYORAIAN_ID, ROMANKAN_ID } from './mock-group-hotels';
import { lt } from './mock-hotel-content';

// Sample announcements for the demo, written from facts on each property's official site.
// Real notices are managed in Firestore `notices`.
export const mockNotices: Notice[] = [
  {
    noticeId: 'app-beta', hotelId: null, category: 'news', priority: 'important', publishedAt: '2026-10-17T00:00:00.000Z', sortOrder: 1,
    title: lt('大洗グループ公式アプリ（ベータ版）を公開しました', '大洗集團官方 APP（測試版）上線了', 'The Oarai Group app (beta) is now available'),
    body: lt(
      '大洗ホテル・思い出浪漫館・ドギーズコースト 大洗・魚来庵の4館の情報を、ひとつのアプリでご覧いただけます。客室のご案内、会員ポイント、お知らせなどを順次拡充してまいります。',
      '大洗飯店、思い出浪漫館、Doggy’s Coast 大洗、魚来庵四館的資訊，現在都能在同一個 APP 查看。客房介紹、會員點數與最新消息等功能將陸續擴充。',
      'Information on all four properties, Oarai Hotel, Omoide Romankan, Doggy’s Coast Oarai and Gyoraian, is now in one app. Room guides, member points and news will keep growing.',
    ),
  },
  {
    noticeId: 'shared-points', hotelId: null, category: 'campaign', priority: 'normal', publishedAt: '2026-10-17T00:00:00.000Z', sortOrder: 2,
    title: lt('会員ポイントがグループ全館共通になります', '會員點數集團各館通用', 'Member points now work across the whole group'),
    body: lt(
      'どの館で貯めたポイントも、グループのどの館でもお使いいただけます。会員ランクも全館のご利用を合算して判定します。詳しくは「会員」タブをご覧ください。',
      '在任一館累積的點數，都能在集團任一館使用。會員等級也會合併計算各館的消費。詳情請見「會員」分頁。',
      'Points earned at any property can be used at any other, and your tier is based on spending across the whole group. See the Member tab for details.',
    ),
  },
  {
    noticeId: 'romankan-keiryu-superior', hotelId: ROMANKAN_ID, category: 'facility', priority: 'normal', publishedAt: '2026-08-01T00:00:00.000Z', sortOrder: 1,
    title: lt('渓流スーペリアルームがリニューアルオープン', '溪流高級客房重新開幕', 'Keiryu Superior Rooms reopen after renewal'),
    body: lt(
      '2026年夏、渓流側の「渓流スーペリアルーム」（39～44m²・3名様まで・禁煙）をリニューアルいたしました。渓流を眺めながらごゆっくりお過ごしください。',
      '2026 年夏季，溪流側的「溪流高級客房」（39～44m²・最多 3 人・禁菸）完成翻新。歡迎一邊欣賞溪流，一邊悠閒放鬆。',
      'In summer 2026 we renewed our riverside Keiryu Superior Rooms (39–44m², up to 3 guests, non-smoking). Relax with a view of the stream.',
    ),
    linkUrl: 'https://www.roman-kan.jp/rooms/',
  },
  {
    noticeId: 'doggys-consent-form', hotelId: DOGGYS_COAST_ID, category: 'news', priority: 'normal', publishedAt: '2026-09-15T00:00:00.000Z', sortOrder: 1,
    title: lt('ワンちゃん同伴宿泊同意書のご案内', '攜犬住宿同意書說明', 'About the dog stay consent form'),
    body: lt(
      'ワンちゃんとご宿泊の際は、チェックイン時に同伴宿泊同意書のご提出をお願いしております。チェックインは15:00、チェックアウトは11:00です。',
      '攜犬住宿時，請於辦理入住時提交攜犬住宿同意書。入住時間為 15:00，退房時間為 11:00。',
      'Guests staying with dogs are asked to submit a consent form at check-in. Check-in is from 15:00 and check-out is by 11:00.',
    ),
    linkUrl: 'https://doggyscoast-oarai.jp/room.html',
  },
  {
    noticeId: 'gyoraian-house-rules', hotelId: GYORAIAN_ID, category: 'facility', priority: 'normal', publishedAt: '2026-10-01T00:00:00.000Z', sortOrder: 1,
    title: lt('館内のご案内（全館禁煙・Wi-Fi無料）', '館內須知（全館禁菸・免費 Wi-Fi）', 'House guide: non-smoking and free Wi-Fi'),
    body: lt(
      '魚来庵は全館禁煙です。Wi-Fiは館内全域で無料でご利用いただけます（パスワードはフロントでお尋ねください）。エレベーターはございませんので、階段をご利用ください。駐車場は玄関前に約7台分、満車の場合は徒歩約3分の大洗ホテル駐車場をご案内します。',
      '魚来庵全館禁菸。館內全區提供免費 Wi-Fi（密碼請洽櫃台）。館內沒有電梯，請使用樓梯。玄關前約有 7 個停車位，客滿時將引導至步行約 3 分鐘的大洗飯店停車場。',
      'Gyoraian is entirely non-smoking. Free Wi-Fi covers the whole building (ask the front desk for the password). There is no elevator, so please use the stairs. About 7 parking spaces are in front of the entrance; when full, we will direct you to the Oarai Hotel car park, about a 3-minute walk away.',
    ),
    linkUrl: 'https://www.hotel-gyoraian.jp/faq/',
  },
];
