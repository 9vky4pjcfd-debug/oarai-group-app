import type { ContentImage, HotelPublicProfile, LocalizedText, Room } from '@/types';
import { lt, mockHotelProfile, mockRooms } from './mock-hotel-content';

// Source: each property's official website (checked 2026-10). Photos are loaded from those
// sites by URL; move them to Firebase Storage once the backend is set up.

export const ROMANKAN_ID = 'omoide-romankan';
export const DOGGYS_COAST_ID = 'doggys-coast-oarai';
export const GYORAIAN_ID = 'gyoraian';

const nonSmoking = lt('禁煙', '禁菸', 'Non-smoking');
const keiryu = lt('渓流側', '溪流側', 'Riverside');
const yuhi = lt('夕陽側', '夕陽側', 'Sunset side');
const openAirBath = lt('露天風呂付き', '附露天浴池', 'Private open-air bath');
const oceanView = lt('オーシャンビュー', '海景', 'Ocean view');
const dogFriendly = lt('愛犬同伴', '可攜帶愛犬', 'Dogs welcome');

const remoteImage = (uri: string, ja: string, zhTW: string, en: string): ContentImage => ({
  kind: 'remote',
  uri,
  accessibilityLabel: lt(ja, zhTW, en),
});

/** Attaches photos to rooms by roomId; rooms without an entry keep the placeholder. */
function withImages(rooms: Room[], images: Record<string, ContentImage[]>): Room[] {
  return rooms.map((room) => ({ ...room, images: images[room.roomId] ?? room.images }));
}

function simpleRoom(
  hotelId: string,
  roomId: string,
  name: LocalizedText,
  description: LocalizedText,
  capacityMax: number,
  roomSize: string,
  category: LocalizedText,
  features: LocalizedText[],
  sortOrder: number,
  options: { capacityMin?: number; bedType?: LocalizedText } = {},
): Room {
  return {
    roomId,
    hotelId,
    name,
    shortDescription: description,
    description,
    capacityMin: options.capacityMin ?? null,
    capacityMax,
    ...(options.bedType ? { bedType: options.bedType } : {}),
    roomSize: lt(roomSize, roomSize, roomSize),
    images: [],
    amenities: [],
    features,
    category,
    sortOrder,
  };
}

const romankanProfile: HotelPublicProfile = {
  hotelId: ROMANKAN_ID,
  name: lt('袋田温泉 思い出浪漫館', '袋田溫泉 思い出浪漫館', 'Fukuroda Onsen Omoide Romankan'),
  area: lt('奥久慈・袋田温泉', '奧久慈・袋田溫泉', 'Okukuji, Fukuroda Onsen'),
  shortDescription: lt('袋田の滝まで車で約5分。渓流沿いの露天風呂を楽しむ温泉旅館', '距袋田瀑布車程約5分鐘，可享溪畔露天溫泉的旅館', 'An onsen ryokan with riverside open-air baths, 5 minutes by car from Fukuroda Falls'),
  description: lt(
    '日本三名瀑のひとつ「袋田の滝」に近い奥久慈の温泉旅館。渓流露天風呂、露天風呂付き客室、茨城・奥久慈の旬の味覚をオールインクルーシブで楽しめます。',
    '位於奧久慈、鄰近日本三大名瀑「袋田瀑布」的溫泉旅館。溪流露天溫泉、附露天浴池客房與茨城・奧久慈當季美食，以全包式方案盡情享受。',
    'An Okukuji onsen ryokan near Fukuroda Falls, one of Japan’s three great waterfalls, with riverside open-air baths, rooms with private baths and seasonal local cuisine, all-inclusive.',
  ),
  highlights: [
    lt('渓流露天風呂', '溪流露天溫泉', 'Riverside open-air bath'),
    lt('オールインクルーシブ', '全包式住宿', 'All-inclusive'),
    lt('袋田駅から無料送迎', '袋田站免費接駁', 'Free shuttle from Fukuroda Station'),
  ],
  address: lt('〒319-3523 茨城県久慈郡大子町袋田978', '〒319-3523 茨城縣久慈郡大子町袋田978', '978 Fukuroda, Daigo, Kuji District, Ibaraki 319-3523'),
  phone: '0570-200-418',
  checkInTime: '15:00',
  checkOutTime: '10:00',
  heroImage: remoteImage('https://www.roman-kan.jp/assets/image/home/261014/hero01.jpg', '袋田温泉 思い出浪漫館', '袋田溫泉 思い出浪漫館', 'Fukuroda Onsen Omoide Romankan'),
  websiteUrl: 'https://www.roman-kan.jp/',
  links: [{ id: 'official', label: lt('公式サイト', '官方網站', 'Official website'), url: 'https://www.roman-kan.jp/' }],
  sortOrder: 2,
};

const romankanRoomPhoto = remoteImage('https://www.roman-kan.jp/assets/image/rooms/main-image.jpg', '客室イメージ', '客房示意', 'Guest room (representative photo)');
const romankanRooms: Room[] = withImages([
  simpleRoom(ROMANKAN_ID, 'premium-japanese', lt('【渓流側・露天風呂付き】プレミアム和室', '【溪流側・附露天浴池】尊爵和室', 'Premium Japanese Room (riverside, open-air bath)'), lt('渓流を望む露天風呂付きの広々とした和室です。', '附露天浴池、可眺望溪流的寬敞和室。', 'A spacious Japanese-style room with a private open-air bath overlooking the river.'), 5, '47–61m²', lt('露天風呂付き客室', '附露天浴池客房', 'Rooms with open-air baths'), [keiryu, openAirBath, nonSmoking], 1),
  simpleRoom(ROMANKAN_ID, 'premium-twin', lt('【渓流側・露天風呂付き】プレミアムツインルーム', '【溪流側・附露天浴池】尊爵雙床房', 'Premium Twin Room (riverside, open-air bath)'), lt('渓流を望む露天風呂付きのツインルームです。', '附露天浴池、可眺望溪流的雙床客房。', 'A twin room with a private open-air bath overlooking the river.'), 4, '48–55m²', lt('露天風呂付き客室', '附露天浴池客房', 'Rooms with open-air baths'), [keiryu, openAirBath, nonSmoking], 2, { capacityMin: 3 }),
  simpleRoom(ROMANKAN_ID, 'keiryu-superior', lt('【渓流側】渓流スーペリアルーム', '【溪流側】溪流高級客房', 'Keiryu Superior Room (riverside)'), lt('2026年夏リニューアルオープンの渓流側客室です。', '2026年夏季重新裝修開幕的溪流側客房。', 'A riverside room renewed in summer 2026.'), 3, '39–44m²', lt('スタンダードルーム', '標準客房', 'Standard rooms'), [keiryu, lt('2026年夏リニューアル', '2026年夏季翻新', 'Renewed summer 2026'), nonSmoking], 3),
  simpleRoom(ROMANKAN_ID, 'universal-twin', lt('【渓流側】ユニバーサルツインルーム', '【溪流側】無障礙雙床房', 'Universal Twin Room (riverside)'), lt('渓流側のユニバーサルデザインのツインルームです。', '溪流側的通用設計雙床客房。', 'A riverside twin room with universal design.'), 2, '39m²', lt('スタンダードルーム', '標準客房', 'Standard rooms'), [keiryu, nonSmoking], 4),
  simpleRoom(ROMANKAN_ID, 'standard-twin', lt('【夕陽側】スタンダードツインルーム', '【夕陽側】標準雙床房', 'Standard Twin Room (sunset side)'), lt('夕陽側のスタンダードツインルームです。', '夕陽側的標準雙床客房。', 'A standard twin room on the sunset side.'), 3, '39m²', lt('スタンダードルーム', '標準客房', 'Standard rooms'), [yuhi, nonSmoking], 5),
  simpleRoom(ROMANKAN_ID, 'standard', lt('【渓流側・夕陽側】スタンダードルーム', '【溪流側・夕陽側】標準客房', 'Standard Room (riverside or sunset side)'), lt('最大6名まで泊まれる12.5畳のスタンダードルームです。', '最多可入住6人的12.5疊標準客房。', 'A 12.5-tatami standard room for up to 6 guests.'), 6, '12.5畳', lt('スタンダードルーム', '標準客房', 'Standard rooms'), [keiryu, yuhi, nonSmoking], 6),
], Object.fromEntries(['premium-japanese', 'premium-twin', 'keiryu-superior', 'universal-twin', 'standard-twin', 'standard'].map((id) => [id, [romankanRoomPhoto]])));

const doggysProfile: HotelPublicProfile = {
  hotelId: DOGGYS_COAST_ID,
  name: lt('ドギーズコースト 大洗', 'Doggy’s Coast 大洗', 'Doggy’s Coast Oarai'),
  area: lt('茨城県大洗町', '茨城縣大洗町', 'Oarai, Ibaraki'),
  shortDescription: lt('愛犬と過ごす太平洋沿いのドッグリゾート', '與愛犬共度的太平洋沿岸狗狗度假飯店', 'A Pacific-coast resort to stay with your dog'),
  description: lt(
    '愛犬と一緒に過ごせる大洗のリゾートホテル。全天候型の屋内ドッグパーク、松林の屋外ドッグラン、セルフグルーミングルーム、愛犬と食事ができるレストランを備えています。',
    '可與愛犬同住的大洗度假飯店。設有全天候室內狗狗公園、松林中的戶外狗狗運動場、自助美容室，以及可與愛犬一同用餐的餐廳。',
    'An Oarai resort hotel for guests travelling with dogs, with an all-weather indoor dog park, outdoor dog runs in a pine grove, a self-grooming room and a restaurant where dogs can join you.',
  ),
  highlights: [
    lt('屋内ドッグパーク', '室內狗狗公園', 'Indoor dog park'),
    lt('サイズ別ドッグラン', '依體型分區運動場', 'Dog runs by size'),
    lt('愛犬と食事ができるレストラン', '可與愛犬用餐的餐廳', 'Dine with your dog'),
  ],
  address: lt('〒311-1303 茨城県東茨城郡大洗町東光台8234-1', '〒311-1303 茨城縣東茨城郡大洗町東光台8234-1', '8234-1 Tokodai, Oarai, Higashiibaraki District, Ibaraki 311-1303'),
  checkInTime: '15:00',
  checkOutTime: '11:00',
  heroImage: remoteImage('https://doggyscoast-oarai.jp/assets/img/home/features01.jpg', '愛犬と遊ぶ', '與愛犬同樂', 'Playing with your dog'),
  websiteUrl: 'https://doggyscoast-oarai.jp/',
  links: [{ id: 'official', label: lt('公式サイト', '官方網站', 'Official website'), url: 'https://doggyscoast-oarai.jp/' }],
  sortOrder: 3,
};

const doggysCategory = lt('愛犬同伴客室', '可攜犬客房', 'Dog-friendly rooms');
const doggysRooms: Room[] = withImages([
  simpleRoom(DOGGYS_COAST_ID, 'premium-panorama', lt('プレミアムパノラマオーシャンビュー', '尊爵全景海景房', 'Premium Panoramic Ocean View'), lt('3～4階、最も広い54.6m²の客室。小・中型犬3頭まで（大型犬を含む場合2頭まで）同伴できます。', '位於3～4樓、面積最大的54.6m²客房。可攜帶小・中型犬最多3隻（含大型犬時最多2隻）。', 'The largest room at 54.6m² on floors 3–4. Up to 3 small or medium dogs, or 2 including a large dog.'), 4, '54.6m²', doggysCategory, [oceanView, dogFriendly, lt('バス・トイレ別', '衛浴分離', 'Separate bath and toilet')], 1),
  simpleRoom(DOGGYS_COAST_ID, 'twin-ocean', lt('ツインルームオーシャンビュー', '雙床海景房', 'Twin Room Ocean View'), lt('3～4階のツインルーム。小・中型犬2頭まで、または大型犬1頭まで同伴できます。', '位於3～4樓的雙床客房。可攜帶小・中型犬最多2隻，或大型犬1隻。', 'A twin room on floors 3–4. Up to 2 small or medium dogs, or 1 large dog.'), 2, '31.6m²', doggysCategory, [oceanView, dogFriendly], 2, { bedType: lt('ツインベッド', '雙床', 'Twin beds') }),
  simpleRoom(DOGGYS_COAST_ID, 'standard-ocean', lt('スタンダードオーシャンビュー', '標準海景房', 'Standard Ocean View'), lt('3階の海が見える客室。小・中型犬2頭まで、または大型犬1頭まで同伴できます。', '位於3樓可看海的客房。可攜帶小・中型犬最多2隻，或大型犬1隻。', 'A 3rd-floor room facing the sea. Up to 2 small or medium dogs, or 1 large dog.'), 3, '25.1m²', doggysCategory, [oceanView, dogFriendly], 3),
  simpleRoom(DOGGYS_COAST_ID, 'standard-garden', lt('スタンダードガーデンビュー', '標準花園景觀房', 'Standard Garden View'), lt('2階の客室。エレベーターが苦手な愛犬も階段で移動できます。小・中型犬2頭まで、または大型犬1頭まで。', '位於2樓的客房，不習慣電梯的狗狗也能走樓梯。可攜帶小・中型犬最多2隻，或大型犬1隻。', 'A 2nd-floor room reachable by stairs for dogs nervous of lifts. Up to 2 small or medium dogs, or 1 large dog.'), 3, '25.1m²', doggysCategory, [lt('ガーデンビュー', '花園景觀', 'Garden view'), dogFriendly], 4),
], {
  'premium-panorama': [remoteImage('https://doggyscoast-oarai.jp/assets/img/home/guestroom01_01.jpg', 'プレミアムパノラマオーシャンビュー', '尊爵全景海景房', 'Premium Panoramic Ocean View')],
  'twin-ocean': [remoteImage('https://doggyscoast-oarai.jp/assets/img/home/guestroom01_03.jpg', 'ツインルームオーシャンビュー', '雙床海景房', 'Twin Room Ocean View')],
  'standard-ocean': [remoteImage('https://doggyscoast-oarai.jp/assets/img/home/guestroom01_04.jpg', 'スタンダードオーシャンビュー', '標準海景房', 'Standard Ocean View')],
  'standard-garden': [remoteImage('https://doggyscoast-oarai.jp/assets/img/home/guestroom01_02.jpg', 'スタンダードガーデンビュー', '標準花園景觀房', 'Standard Garden View')],
});

const gyoraianProfile: HotelPublicProfile = {
  hotelId: GYORAIAN_ID,
  name: lt('大洗ホテルANNEX 魚来庵', '大洗飯店ANNEX 魚来庵', 'Oarai Hotel ANNEX Gyoraian'),
  area: lt('茨城県大洗町', '茨城縣大洗町', 'Oarai, Ibaraki'),
  shortDescription: lt('全室オーシャンビュー。神磯の鳥居と日の出を望むホテル', '全客房海景，可眺望神磯鳥居與日出', 'Every room faces the sea, with views of the Kamiiso torii and sunrise'),
  description: lt(
    '2019年夏にリニューアルオープンした、全室から海を望むホテル。神磯の鳥居や日の出を眺められ、大洗を活動的に楽しみたい方におすすめです。',
    '2019年夏季重新開幕、所有客房皆可看海的飯店。可眺望神磯鳥居與日出，推薦給想盡情遊玩大洗的旅客。',
    'Renewed in summer 2019, every room looks out to sea with views of the Kamiiso torii and sunrise, ideal for guests who want to explore Oarai.',
  ),
  highlights: [
    lt('全室オーシャンビュー', '全客房海景', 'Ocean view from every room'),
    lt('神磯の鳥居と日の出', '神磯鳥居與日出', 'Kamiiso torii and sunrise'),
    lt('全室Wi-Fi', '全客房Wi-Fi', 'Wi-Fi in all rooms'),
  ],
  address: lt('〒311-1301 茨城県東茨城郡大洗町磯浜町6885', '〒311-1301 茨城縣東茨城郡大洗町磯濱町6885', '6885 Isohamacho, Oarai, Higashiibaraki District, Ibaraki 311-1301'),
  phone: '029-212-3488',
  checkInTime: '15:00',
  checkOutTime: '10:00',
  heroImage: remoteImage('https://www.hotel-gyoraian.jp/ogp.jpg', '大洗ホテルANNEX 魚来庵', '大洗飯店ANNEX 魚来庵', 'Oarai Hotel ANNEX Gyoraian'),
  websiteUrl: 'https://www.hotel-gyoraian.jp/',
  links: [{ id: 'official', label: lt('公式サイト', '官方網站', 'Official website'), url: 'https://www.hotel-gyoraian.jp/' }],
  sortOrder: 4,
};

const westernCategory = lt('洋室', '西式客房', 'Western-style rooms');
const japaneseCategory = lt('和室', '和室', 'Japanese-style rooms');
const gyoraianRooms: Room[] = withImages([
  simpleRoom(GYORAIAN_ID, 'standard-twin', lt('3F スタンダードツイン', '3F 標準雙床房', '3F Standard Twin'), lt('窓辺のカウンター付きツイン。おひとり様のビジネス利用にも。', '附窗邊吧台的雙床房，也適合單人商務入住。', 'A twin room with a window counter, also suited to solo business stays.'), 2, '24m²', westernCategory, [oceanView, lt('Wi-Fi・USB', 'Wi-Fi・USB', 'Wi-Fi and USB')], 1, { bedType: lt('ツインベッド', '雙床', 'Twin beds') }),
  simpleRoom(GYORAIAN_ID, 'superior-twin', lt('3F スーペリアツイン', '3F 高級雙床房', '3F Superior Twin'), lt('ツインベッドに小上がりの畳スペースを備えた客室です。', '雙床加上架高榻榻米空間的客房。', 'Twin beds plus a raised tatami area.'), 3, '30m²', westernCategory, [oceanView, lt('小上がり畳スペース', '架高榻榻米', 'Raised tatami area')], 2, { bedType: lt('ツインベッド', '雙床', 'Twin beds') }),
  simpleRoom(GYORAIAN_ID, 'japanese-standard', lt('4F 和室スタンダード', '4F 標準和室', '4F Japanese Standard Room'), lt('最大4名まで泊まれる8畳の和室です。', '最多可入住4人的8疊和室。', 'An 8-tatami Japanese-style room for up to 4 guests.'), 4, '8畳', japaneseCategory, [oceanView], 3),
  simpleRoom(GYORAIAN_ID, 'neo-modern', lt('4F ネオモダン和室', '4F 新現代和室', '4F Neo Modern Japanese Room'), lt('ツインベッドを備えた10畳の和室です。', '附雙床的10疊和室。', 'A 10-tatami Japanese-style room with twin beds.'), 4, '10畳', japaneseCategory, [oceanView], 4, { bedType: lt('ツインベッド', '雙床', 'Twin beds') }),
], Object.fromEntries(
  (['standard-twin', 'superior-twin', 'japanese-standard', 'neo-modern'] as const).map((id, index) => {
    const base = `https://www.hotel-gyoraian.jp/wp-gyoraian/wp-content/themes/gyoraian/assets/image/1x/picture/room/0${index + 1}`;
    return [id, [1, 2].map((n) => remoteImage(`${base}/gallery0${n}.jpg`, '客室写真', '客房照片', 'Room photo'))];
  }),
));

/** All properties of the group. Add a new property by appending its profile and rooms here (or in Firestore). */
export const mockHotels: HotelPublicProfile[] = [mockHotelProfile, romankanProfile, doggysProfile, gyoraianProfile];
export const mockGroupRooms: Room[] = [...mockRooms, ...romankanRooms, ...doggysRooms, ...gyoraianRooms];
