import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const [host = '127.0.0.1', portText = '8080'] = emulatorHost?.split(':') ?? [];
const describeWithEmulator = emulatorHost ? describe : describe.skip;
let testEnvironment: RulesTestEnvironment;

describeWithEmulator('Firestore security rules emulator', () => {
  beforeAll(async () => {
    testEnvironment = await initializeTestEnvironment({ projectId: 'demo-oarai-rules-test', firestore: { host, port: Number(portText), rules: await readFile(resolve('firebase/firestore.rules'), 'utf8') } });
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'rooms', 'published-room'), { hotelId: 'hotel-a', published: true });
      await setDoc(doc(context.firestore(), 'pointAccounts', 'user-a'), { userId: 'user-a', balance: 10 });
      await setDoc(doc(context.firestore(), 'rooms', 'draft-room'), { hotelId: 'hotel-a', published: false });
      await setDoc(doc(context.firestore(), 'memberProfiles', 'user-a'), { userId: 'user-a', tierId: 'regular' });
      await setDoc(doc(context.firestore(), 'reservations', 'res-a'), { userId: 'user-a', hotelId: 'hotel-a', status: 'confirmed', totalAmount: 30000 });
      await setDoc(doc(context.firestore(), 'reservations', 'res-b'), { userId: 'user-b', hotelId: 'hotel-a', status: 'confirmed', totalAmount: 30000 });
      await setDoc(doc(context.firestore(), 'bookingInventory', 'hotel-a__room__2026-11-01'), { allotment: 3, booked: 0, adultRate: 15000 });
      await setDoc(doc(context.firestore(), 'hotelBookingContacts', 'hotel-a'), { emails: ['front@example.com'] });
    });
  });
  afterAll(async () => testEnvironment?.cleanup());
  it('allows public published room reads', async () => { await assertSucceeds(getDoc(doc(testEnvironment.unauthenticatedContext().firestore(), 'rooms', 'published-room'))); });
  it('denies anonymous point account reads', async () => { await assertFails(getDoc(doc(testEnvironment.unauthenticatedContext().firestore(), 'pointAccounts', 'user-a'))); });
  it('denies reading another member\'s point account', async () => { await assertFails(getDoc(doc(testEnvironment.authenticatedContext('user-b').firestore(), 'pointAccounts', 'user-a'))); });
  it('allows owner point account reads but denies writes', async () => {
    const store = testEnvironment.authenticatedContext('user-a').firestore();
    expect((await assertSucceeds(getDoc(doc(store, 'pointAccounts', 'user-a')))).exists()).toBe(true);
    await assertFails(setDoc(doc(store, 'pointAccounts', 'user-a'), { balance: 10000 }));
  });
  it('hides unpublished content', async () => { await assertFails(getDoc(doc(testEnvironment.unauthenticatedContext().firestore(), 'rooms', 'draft-room'))); });
  it('denies writes to public content even when signed in', async () => {
    await assertFails(setDoc(doc(testEnvironment.authenticatedContext('user-a').firestore(), 'notices', 'fake'), { published: true }));
  });
  it('denies members raising their own tier or adding point transactions', async () => {
    const store = testEnvironment.authenticatedContext('user-a').firestore();
    await assertFails(updateDoc(doc(store, 'memberProfiles', 'user-a'), { tierId: 'platinum' }));
    await assertFails(addDoc(collection(store, 'pointTransactions'), { userId: 'user-a', type: 'earn', points: 100000 }));
  });
  it('lets a member read only their own reservations and never write them', async () => {
    const store = testEnvironment.authenticatedContext('user-a').firestore();
    await assertSucceeds(getDoc(doc(store, 'reservations', 'res-a')));
    await assertSucceeds(getDocs(query(collection(store, 'reservations'), where('userId', '==', 'user-a'))));
    await assertFails(getDoc(doc(store, 'reservations', 'res-b')));
    await assertFails(getDocs(collection(store, 'reservations')));
    await assertFails(updateDoc(doc(store, 'reservations', 'res-a'), { totalAmount: 1 }));
    await assertFails(setDoc(doc(store, 'reservations', 'res-new'), { userId: 'user-a', status: 'confirmed' }));
  });
  it('keeps booking stock and hotel addresses server-only', async () => {
    const store = testEnvironment.authenticatedContext('user-a').firestore();
    await assertFails(getDoc(doc(store, 'bookingInventory', 'hotel-a__room__2026-11-01')));
    await assertFails(updateDoc(doc(store, 'bookingInventory', 'hotel-a__room__2026-11-01'), { booked: 0 }));
    await assertFails(getDoc(doc(store, 'hotelBookingContacts', 'hotel-a')));
  });
  it('denies collections without a rule', async () => {
    await assertFails(getDoc(doc(testEnvironment.authenticatedContext('user-a').firestore(), 'adminSettings', 'x')));
  });
});
