// End-to-end run of the Cloud Functions against the Auth, Firestore and Functions emulators:
// owner setup, seeding, allotment, membership, booking, sold-out, cancel, staff scope, points and account deletion.
// Run with `npm run test:backend` (needs Java and a built functions/lib).
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../package.json', import.meta.url));
const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFunctions, connectFunctionsEmulator, httpsCallable } = require('firebase/functions');
const { getFirestore, connectFirestoreEmulator, doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');
const req2 = createRequire(new URL('../../functions/package.json', import.meta.url));
const adminAuth = req2('firebase-admin/auth'); const adminDb = req2('firebase-admin/firestore');

const app = initializeApp({ projectId: 'demo-oarai', apiKey: 'demo-key', authDomain: 'demo-oarai.firebaseapp.com' });
const auth = getAuth(app); connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
const fns = getFunctions(app, 'asia-northeast1'); connectFunctionsEmulator(fns, '127.0.0.1', 5001);
const fs = getFirestore(app); connectFirestoreEmulator(fs, '127.0.0.1', 8080);
process.env.GCLOUD_PROJECT = 'demo-oarai';
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: 'demo-oarai' });
const lib = req2('./lib/index.js');
const call = async (name, data = {}) => (await httpsCallable(fns, name)(data)).data;
const expectFail = async (p, label) => { try { await p; throw new Error('expected failure: ' + label); } catch (e) { if (e.message.startsWith('expected')) throw e; console.log('  refused as expected:', label, e.code, e.details?.reason ?? ''); } };
const verify = async (uid) => { await adminAuth.getAuth().updateUser(uid, { emailVerified: true }); await auth.currentUser.reload(); await auth.currentUser.getIdToken(true); };

// Owner
const owner = (await createUserWithEmailAndPassword(auth, 'owner@example.com', 'owner-pass-1')).user;
await expectFail(call('adminClaimOwner'), 'claim before verify');
await verify(owner.uid);
await call('adminClaimOwner'); await auth.currentUser.getIdToken(true);
console.log('seed', await call('adminSeedContent', { overwrite: false }));
console.log('seed again', await call('adminSeedContent', { overwrite: false }));
const rooms = await getDocs(query(collection(fs, 'rooms'), where('hotelId', '==', 'oarai-hotel'), where('published', '==', true)));
console.log('public rooms for oarai-hotel', rooms.size);
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const plus = (d) => new Date(Date.parse(today + 'T00:00:00Z') + d * 864e5).toISOString().slice(0, 10);
console.log('inventory', await call('adminSetInventory', { hotelId: 'oarai-hotel', roomIds: ['moderate', 'stylish-twin'], from: plus(10), to: plus(40), allotment: 2, adultRate: 16500 }));
await call('adminSetBookingContacts', { hotelId: 'oarai-hotel', emails: ['front@example.com'] });
const n = await call('adminSaveNotice', { noticeId: '', hotelId: 'oarai-hotel', category: 'news', priority: 'normal', title: { ja: 'テスト' }, body: { ja: '本文' }, publishedAt: new Date().toISOString(), published: true, sortOrder: 0 });
console.log('notice', n.noticeId, (await call('adminListNotices')).notices.length);
await auth.signOut();

// Guest
const guest = (await createUserWithEmailAndPassword(auth, 'guest@example.com', 'guest-pass-1')).user;
console.log('profile', (await call('memberEnsureProfile', { displayName: '大洗 花子', preferredLanguage: 'zh-TW' })).membershipNumber);
console.log('profile again', (await call('memberEnsureProfile', { displayName: 'x', preferredLanguage: 'ja' })).displayName);
const search = { hotelId: 'oarai-hotel', checkIn: plus(12), checkOut: plus(14), adults: 2, children: 1, infants: 0, rooms: 1 };
const avail = (await call('bookingGetAvailability', search)).rooms;
const mod = avail.find((r) => r.roomId === 'moderate');
console.log('availability', avail.length, 'moderate', mod.remaining, mod.totalAmount, 'unset room', avail.find((r) => r.roomId === 'yunagi')?.remaining);
const booking = { ...search, roomId: 'moderate', contact: { name: '大洗 花子', phone: '090-1234-5678', email: 'guest@example.com' }, notes: '', quotedTotal: mod.totalAmount };
await expectFail(call('bookingCreateReservation', booking), 'unverified');
await verify(guest.uid);
await expectFail(call('bookingCreateReservation', { ...booking, quotedTotal: 1 }), 'price changed');
const r1 = await call('bookingCreateReservation', booking);
const r2 = await call('bookingCreateReservation', booking);
console.log('booked', r1.confirmationCode, r2.status);
await expectFail(call('bookingCreateReservation', booking), 'sold out');
console.log('remaining now', (await call('bookingGetAvailability', search)).rooms.find((r) => r.roomId === 'moderate').remaining);
console.log('own reservation read', (await getDoc(doc(fs, 'reservations', r1.reservationId))).data().status);
const c = await call('bookingCancelReservation', { reservationId: r1.reservationId });
console.log('cancelled', c.status, 'remaining', (await call('bookingGetAvailability', search)).rooms.find((r) => r.roomId === 'moderate').remaining);
await expectFail(call('adminGetInventory', { hotelId: 'oarai-hotel', from: plus(10), to: plus(12) }), 'guest admin');
const mails = await adminDb.getFirestore().collection('mail').get();
console.log('mails', mails.size, mails.docs.map((m) => m.data().message.subject).join(' | '));

// Staff limited to one hotel
await auth.signOut();
await signInWithEmailAndPassword(auth, 'owner@example.com', 'owner-pass-1');
await call('adminSetStaff', { email: 'guest@example.com', role: 'staff', hotelIds: ['gyoraian'] });
console.log('staff', (await call('adminListStaff')).staff.map((s) => `${s.email}:${s.role}`).join(','));
const list = await call('adminListReservations', { hotelId: 'oarai-hotel', from: plus(0), to: plus(30) });
console.log('hotel reservations', list.reservations.length);
await signInWithEmailAndPassword(auth, 'guest@example.com', 'guest-pass-1');
await auth.currentUser.getIdToken(true);
await expectFail(call('adminSetInventory', { hotelId: 'oarai-hotel', roomIds: ['moderate'], from: plus(10), to: plus(11), closed: true }), 'staff other hotel');
await expectFail(call('adminSetBookingContacts', { hotelId: 'gyoraian', emails: [] }), 'staff sets contacts');
console.log('own hotel inventory rows', (await call('adminGetInventory', { hotelId: 'gyoraian', from: plus(1), to: plus(3) })).rows.length);

// Points: pretend a stay already finished
const db = adminDb.getFirestore();
await db.collection('reservations').doc(r2.reservationId).update({ checkIn: plus(-3), checkOut: plus(-1) });
await lib.pointsAwardCompletedStays.run({});
const account = (await getDoc(doc(fs, 'pointAccounts', guest.uid))).data();
const ledger = await getDocs(query(collection(fs, 'pointTransactions'), where('userId', '==', guest.uid)));
console.log('points', account.balance, account.qualifyingPoints, account.tierId, 'ledger', ledger.size, 'status', (await getDoc(doc(fs, 'reservations', r2.reservationId))).data().status);
await lib.pointsAwardCompletedStays.run({});
console.log('rerun balance', (await getDoc(doc(fs, 'pointAccounts', guest.uid))).data().balance);
await call('memberDeleteAccount');
const left = await db.collection('reservations').where('userId', '==', 'deleted-account').get();
console.log('deleted; profile exists', (await db.collection('memberProfiles').doc(guest.uid).get()).exists, 'reservations kept', left.size);
await adminAuth.getAuth().getUser(guest.uid).then(() => console.log('USER STILL EXISTS'), () => console.log('auth user gone'));
process.exit(0);
