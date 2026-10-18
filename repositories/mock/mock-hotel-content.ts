import type {
  ContentImage,
  Facility,
  FaqItem,
  FloorGuide,
  HotelPublicProfile,
  LocalizedText,
  Room,
} from '@/types';

export const OARAI_HOTEL_ID = 'oarai-hotel';
const hotelId = OARAI_HOTEL_ID;

export const lt = (ja: string, zhTW: string, en: string): LocalizedText => ({ ja, 'zh-TW': zhTW, en });
export const localImage = (source: number, ja: string, zhTW: string, en: string): ContentImage => ({
  kind: 'local',
  source,
  accessibilityLabel: lt(ja, zhTW, en),
});

const roomAmenities = [
  lt('作務衣', '作務衣', 'Samue'),
  lt('歯ブラシ', '牙刷', 'Toothbrush'),
  lt('ヘアブラシ', '髮梳', 'Hairbrush'),
  lt('綿棒', '棉花棒', 'Cotton swabs'),
  lt('シャワーキャップ', '浴帽', 'Shower cap'),
  lt('お子様用歯ブラシ', '兒童牙刷', "Children's toothbrush"),
  lt('カミソリ', '刮鬍刀', 'Razor'),
  lt('ボディタオル', '沐浴巾', 'Body towel'),
];

const standardCategory = lt('スタンダードルーム', '標準客房', 'Standard rooms');
const bathCategory = lt('半露天風呂付き客室', '附半露天風呂客房', 'Rooms with semi-open-air baths');
const oceanView = lt('オーシャンビュー', '海景', 'Ocean view');
const semiOpenBath = lt('半露天風呂', '半露天風呂', 'Semi-open-air bath');

function room(
  roomId: string,
  name: LocalizedText,
  shortDescription: LocalizedText,
  description: LocalizedText,
  capacityMin: number | null,
  capacityMax: number,
  roomSize: string,
  imageSource: number,
  category: LocalizedText,
  features: LocalizedText[],
  sortOrder: number,
  bedType?: LocalizedText,
): Room {
  return {
    roomId,
    hotelId,
    name,
    shortDescription,
    description,
    capacityMin,
    capacityMax,
    ...(bedType ? { bedType } : {}),
    roomSize: lt(roomSize, roomSize, roomSize),
    images: [localImage(imageSource, `${name.ja ?? ''} 客室`, `${name['zh-TW'] ?? ''}客房`, `${name.en ?? ''} room`)],
    amenities: roomAmenities,
    features,
    category,
    sortOrder,
  };
}

export const mockHotelProfile: HotelPublicProfile = {
  hotelId,
  name: lt('大洗ホテル', '大洗飯店', 'Oarai Hotel'),
  area: lt('茨城県大洗町', '茨城縣大洗町', 'Oarai, Ibaraki'),
  shortDescription: lt(
    '楽しみ、つぎつぎ。心が躍るインクルーシブステイ',
    '樂趣接連不斷，令人心動的全包式住宿體驗',
    'One delightful discovery after another. An uplifting all-inclusive stay.',
  ),
  description: lt(
    '雄大な太平洋を望む客室。スタンダードから半露天風呂付きまで、旅のスタイルに合わせてお選びいただけます。',
    '眺望壯闊太平洋的客房，從標準房到附半露天風呂房型，可依旅遊方式選擇。',
    'Ocean-facing rooms ranging from standard rooms to rooms with semi-open-air baths.',
  ),
  highlights: [
    lt('オールインクルーシブ', '全包式住宿', 'All-inclusive'),
    lt('全室オーシャンビュー', '海景客房', 'Ocean-view rooms'),
    lt('展望大浴場', '展望大浴場', 'Panoramic public bath'),
  ],
  address: lt('〒311-1301 茨城県東茨城郡大洗町磯浜町6881', '〒311-1301 茨城縣東茨城郡大洗町磯濱町6881', '6881 Isohamacho, Oarai, Higashiibaraki District, Ibaraki 311-1301'),
  phone: '029-267-2151',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  heroImage: localImage(
    require('@/assets/brand/hero.webp'),
    '大洗ホテルの海辺のテラス',
    '大洗飯店海濱露台',
    'Oarai Hotel seaside terrace',
  ),
  logo: localImage(require('@/assets/brand/logo.png'), '大洗ホテル ロゴ', '大洗飯店標誌', 'Oarai Hotel logo'),
  links: [
    { id: 'official', label: lt('公式サイト', '官方網站', 'Official website'), url: 'https://www.oarai-hotel.co.jp/' },
    { id: 'contact', label: lt('お問い合わせフォーム', '聯絡表單', 'Contact form'), url: 'https://www.oarai-hotel.co.jp/contact.html' },
  ],
  websiteUrl: 'https://www.oarai-hotel.co.jp/',
  sortOrder: 1,
};

export const mockRooms: Room[] = [
  room(
    'stylish-twin',
    lt('スタイリッシュツイン', '時尚雙床房', 'Stylish Twin Room'),
    lt('2～3名・26m²・海景', '2～3 人・26m²・海景', '2–3 guests · 26m² · Ocean view'),
    lt('海の景色を身近に感じる、明るく機能的なツインルームです。', '明亮實用的雙床客房，讓海景近在眼前。', 'A bright, functional twin room that keeps the ocean close.'),
    2,
    3,
    '26m²',
    require('@/assets/content/room-stylish.jpg'),
    standardCategory,
    [oceanView, lt('ツインベッド', '雙床', 'Twin beds')],
    1,
    lt('ツインベッド', '雙床', 'Twin beds'),
  ),
  room(
    'moderate',
    lt('モデレート', 'Moderate 客房', 'Moderate Room'),
    lt('2～4名・40～47m²・海景', '2～4 人・40～47m²・海景', '2–4 guests · 40–47m² · Ocean view'),
    lt('ご家族やグループでゆったり過ごせる、快適なオーシャンビュー客室です。', '適合家庭及團體悠閒入住的舒適海景客房。', 'A comfortable ocean-view room for a relaxed family or group stay.'),
    2,
    4,
    '40–47m²',
    require('@/assets/content/room-moderate.jpg'),
    standardCategory,
    [oceanView, lt('ファミリー向け', '適合家庭', 'Family friendly')],
    2,
  ),
  room(
    'yunagi',
    lt('プレミアムルーム 夕凪', 'Premium 夕凪', 'Premium Room Yunagi'),
    lt('2～4名・52m²・半露天風呂', '2～4 人・52m²・半露天風呂', '2–4 guests · 52m² · Semi-open-air bath'),
    lt('半露天風呂と海の眺望を楽しむ、上質なプレミアムルームです。', '設有半露天浴池，可享海景的高級客房。', 'A premium room with a semi-open-air bath and sweeping ocean views.'),
    2,
    4,
    '52m²',
    require('@/assets/content/room-yunagi.jpg'),
    bathCategory,
    [semiOpenBath, oceanView],
    3,
  ),
  room('executive-suite', lt('エグゼクティブスイート', '行政套房', 'Executive Suite Room'), bathCategory, bathCategory, null, 5, '70m²', require('@/assets/content/room-executive.jpg'), bathCategory, [semiOpenBath], 4),
  room('premium-asian', lt('プレミアムルーム アジアン', '亞洲風尊爵客房', 'Premium Room Asian'), bathCategory, bathCategory, null, 4, '52m²', require('@/assets/content/room-asian.jpg'), bathCategory, [semiOpenBath], 5),
  room('premium-japanese', lt('プレミアムルーム ジャパニーズ', '日式尊爵客房', 'Premium Room Japanese'), bathCategory, bathCategory, null, 4, '52m²', require('@/assets/content/room-japanese.jpg'), bathCategory, [semiOpenBath], 6),
  room('premium-japanese-resort', lt('プレミアムルーム ジャパニーズリゾート', '日式度假尊爵客房', 'Premium Room Japanese Resort'), bathCategory, bathCategory, null, 4, '52m²', require('@/assets/content/room-jresort.jpg'), bathCategory, [semiOpenBath], 7),
  room('premium-asahi', lt('プレミアムルーム 朝日', '朝日尊爵客房', 'Premium Room Asahi'), bathCategory, bathCategory, null, 4, '52m²', require('@/assets/content/room-asahi.jpg'), bathCategory, [semiOpenBath], 8),
  room('neo-modern', lt('ネオモダン和室', '新現代和室', 'Neo Modern Japanese Room'), bathCategory, bathCategory, null, 3, '35m²', require('@/assets/content/room-neomodern.jpg'), bathCategory, [semiOpenBath], 9),
  room('superior-twin', lt('スーペリアツイン', '高級雙床房', 'Superior Twin Room'), bathCategory, bathCategory, null, 3, '35m²', require('@/assets/content/room-superior.jpg'), bathCategory, [semiOpenBath], 10),
];

const central = lt('中央館', '中央館', 'Central Wing');
const east = lt('東館', '東館', 'East Wing');
const west = lt('西館', '西館', 'West Wing');

function facility(
  facilityId: string,
  name: LocalizedText,
  description: LocalizedText,
  category: LocalizedText,
  sortOrder: number,
  options: { location?: LocalizedText; hours?: LocalizedText; image?: number; features?: LocalizedText[] } = {},
): Facility {
  return {
    facilityId,
    hotelId,
    name,
    shortDescription: description,
    description,
    category,
    ...(options.location ? { location: options.location } : {}),
    ...(options.hours ? { businessHours: options.hours } : {}),
    images: options.image ? [localImage(options.image, `${name.ja ?? ''} の写真`, `${name['zh-TW'] ?? ''}照片`, `${name.en ?? ''} photo`)] : [],
    features: options.features ?? [],
    sortOrder,
  };
}

export const mockFacilities: Facility[] = [
  facility('premium-bar', lt('プレミアムバー', 'Premium Bar', 'Premium Bar'), lt('ソフトドリンク、アルコール、おつまみをご用意', '提供無酒精飲料、酒類及下酒小點', 'Soft drinks, alcoholic beverages and snacks'), central, 1, { location: lt('中央館1F', '中央館1樓', 'Central Wing 1F'), hours: lt('07:30～11:30 / 14:00～21:30', '07:30–11:30 / 14:00–21:30', '07:30–11:30 / 14:00–21:30') }),
  facility('garden-terrace', lt('ガーデンテラス', '花園露台', 'Garden Terrace'), lt('潮風と波音、ファイヤーピットを楽しむテラス', '享受海風、浪聲與火爐的露台', 'Terrace with ocean breeze, waves and a fire pit'), central, 2, { location: lt('屋外ガーデンエリア', '戶外花園區', 'Outdoor garden area') }),
  facility('play-room', lt('プレイルーム', '遊戲室', 'Playroom'), lt('卓球、ボードゲーム、ホッケー、ダーツ', '桌球、桌遊、空氣曲棍球與飛鏢', 'Table tennis, board games, air hockey and darts'), central, 3, { location: lt('中央館2F', '中央館2樓', 'Central Wing 2F'), hours: lt('08:00～11:00 / 14:00～21:00', '08:00–11:00 / 14:00–21:00', '08:00–11:00 / 14:00–21:00'), image: require('@/assets/content/facility-play.jpg') }),
  facility('kids-room', lt('キッズルーム', '兒童遊戲室', 'Kids Room'), lt('ボールプールや知育玩具で遊べる空間', '設有球池與益智玩具的遊戲空間', 'Play space with a ball pool and educational toys'), central, 4, { location: lt('中央館2F', '中央館2樓', 'Central Wing 2F'), hours: lt('08:00～11:00 / 14:00～21:00', '08:00–11:00 / 14:00–21:00', '08:00–11:00 / 14:00–21:00'), image: require('@/assets/content/facility-kids.jpg') }),
  facility('kazenagi', lt('KAZENAGI', 'KAZENAGI', 'KAZENAGI'), lt('海を眺めながら過ごすリラクゼーションスペース', '眺望海景的放鬆空間', 'A relaxation space overlooking the ocean'), central, 5, { location: lt('中央館2F', '中央館2樓', 'Central Wing 2F'), hours: lt('24時間', '24小時', '24 hours'), image: require('@/assets/content/facility-kazenagi.jpg') }),
  facility('shop', lt('ショップ', '商店', 'Shop'), lt('茨城のお酒、大洗のお土産、地元の名産品', '茨城酒類、大洗伴手禮與在地名產', 'Ibaraki drinks, Oarai souvenirs and local specialties'), central, 6, { location: lt('中央館1F', '中央館1樓', 'Central Wing 1F'), hours: lt('08:00～11:30 / 15:00～20:00', '08:00–11:30 / 15:00–20:00', '08:00–11:30 / 15:00–20:00') }),
  facility('hinode', lt('日の出', '日の出', 'Hinode'), lt('大洗の海と茨城の大地が育む旬のビュッフェ', '以大洗海洋與茨城大地孕育的當季自助料理', 'Seasonal buffet inspired by Oarai and Ibaraki'), east, 7, { location: lt('東館2F', '東館2樓', 'East Wing 2F'), hours: lt('朝食 07:00～09:00 / 夕食 17:30～20:30', '早餐 07:00–09:00 / 晚餐 17:30–20:30', 'Breakfast 07:00–09:00 / Dinner 17:30–20:30'), image: require('@/assets/content/facility-hinode.jpg') }),
  facility('bath', lt('展望大浴場', '展望大浴場', 'Panoramic Public Bath'), lt('太平洋を一望。最終入場は各終了時刻の30分前', '眺望太平洋，最晚入場為結束前30分鐘', 'Pacific views; last admission is 30 minutes before closing'), east, 8, { location: lt('東館9F', '東館9樓', 'East Wing 9F'), hours: lt('05:00～10:00 / 15:00～24:00', '05:00–10:00 / 15:00–24:00', '05:00–10:00 / 15:00–24:00'), image: require('@/assets/content/facility-bath.jpg') }),
  facility('seaside-pool', lt('シーサイドプール', '海濱泳池', 'Seaside Pool'), lt('大人用18×10mと水深30cmのお子様用プール', '18×10公尺成人池及水深30公分兒童池', '18×10m adult pool and 30cm-deep children’s pool'), east, 9, { hours: lt('夏季 09:00～16:30', '夏季 09:00–16:30', 'Summer 09:00–16:30'), image: require('@/assets/content/facility-pool.jpg') }),
  facility('sunahama-lounge', lt('sunahama ラウンジ', 'sunahama 休息室', 'sunahama Lounge'), lt('白い砂と蒼い海を楽しむラウンジ', '享受白沙與蔚藍大海的休息空間', 'A lounge inspired by white sand and blue sea'), west, 10, { location: lt('西館2F', '西館2樓', 'West Wing 2F'), hours: lt('14:00～22:00', '14:00–22:00', '14:00–22:00'), image: require('@/assets/content/facility-lounge.jpg') }),
  facility('craft-corner', lt('クラフトコーナー', '手作體驗區', 'Craft Corner'), lt('専属スタッフと楽しむ20～30分のクラフト体験', '由專人協助的20至30分鐘手作體驗', 'A 20–30 minute craft activity with staff support'), west, 11, { location: lt('西館2F', '西館2樓', 'West Wing 2F'), hours: lt('09:00～11:00 / 14:00～20:00', '09:00–11:00 / 14:00–20:00', '09:00–11:00 / 14:00–20:00'), image: require('@/assets/content/facility-craft.jpg') }),
];

const floorMap = localImage(require('@/assets/content/floor-map.jpg'), '大洗ホテル館内マップ', '大洗飯店館內地圖', 'Oarai Hotel floor map');
export const mockFloorGuides: FloorGuide[] = [
  { floorId: 'central-1f', hotelId, label: lt('中央館1F', '中央館1樓', 'Central Wing 1F'), description: central, mapImage: floorMap, facilityIds: ['premium-bar', 'shop'], sortOrder: 1 },
  { floorId: 'central-2f', hotelId, label: lt('中央館2F', '中央館2樓', 'Central Wing 2F'), description: central, mapImage: floorMap, facilityIds: ['play-room', 'kids-room', 'kazenagi'], sortOrder: 2 },
  { floorId: 'east-2f', hotelId, label: lt('東館2F', '東館2樓', 'East Wing 2F'), description: east, mapImage: floorMap, facilityIds: ['hinode'], sortOrder: 3 },
  { floorId: 'east-9f', hotelId, label: lt('東館9F', '東館9樓', 'East Wing 9F'), description: east, mapImage: floorMap, facilityIds: ['bath'], sortOrder: 4 },
  { floorId: 'west-2f', hotelId, label: lt('西館2F', '西館2樓', 'West Wing 2F'), description: west, mapImage: floorMap, facilityIds: ['sunahama-lounge', 'craft-corner'], sortOrder: 5 },
];

const stayCategory = lt('宿泊', '住宿', 'Stay');
const facilitiesCategory = lt('館内施設', '館內設施', 'Facilities');
export const mockFaq: FaqItem[] = [
  { faqId: 'check-in-out', hotelId, question: lt('チェックイン・チェックアウトの時間は？', '入住與退房時間？', 'What are the check-in and check-out times?'), answer: lt('チェックインは15:00以降、チェックアウトは11:00までです。早めに到着された場合はお荷物をお預かりします。', '入住時間為 15:00 後，退房時間為 11:00 前。如需提早抵達，可先寄放行李。', 'Check-in is from 3 PM and check-out is by 11 AM. We can store luggage for early arrivals.'), category: stayCategory, sortOrder: 1 },
  { faqId: 'change-cancel', hotelId, question: lt('予約の変更・キャンセルはできますか？', '可以更改或取消預約嗎？', 'Can I change or cancel my reservation?'), answer: lt('可能です。期限や料金はプランにより異なります。予約確認メールまたはフロントよりお手続きください。', '可以。實際期限與費用依訂房方案而異，請透過預約確認信或聯絡櫃檯辦理。', 'Yes. Deadlines and fees vary by plan; use your confirmation email or contact reception.'), category: stayCategory, sortOrder: 2 },
  { faqId: 'parking', hotelId, question: lt('駐車場はありますか？', '館內有停車場嗎？', 'Is parking available?'), answer: lt('ご宿泊者専用駐車場をご用意しています。予約時に車両情報をご登録ください。', '館內備有住客專用停車位。建議於預約時一併登記車輛資訊。', 'Guest parking is available. Please register your vehicle when booking.'), category: facilitiesCategory, sortOrder: 3 },
  { faqId: 'children-bath', hotelId, question: lt('子どもも大浴場を利用できますか？', '兒童也可以使用大浴場嗎？', 'Can children use the public bath?'), answer: lt('ご利用いただけます。大人の方が付き添い、浴場の利用規則をお守りください。', '可以，請由成人陪同並遵守館內浴場使用規則。', 'Yes. Children must be accompanied by an adult and follow the bath rules.'), category: facilitiesCategory, sortOrder: 4 },
];
