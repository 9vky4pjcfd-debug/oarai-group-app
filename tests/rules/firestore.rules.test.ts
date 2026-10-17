import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
      await setDoc(doc(context.firestore(), 'pointAccounts', 'hotel-a__user-a'), { hotelId: 'hotel-a', userId: 'user-a', balance: 10 });
    });
  });
  afterAll(async () => testEnvironment?.cleanup());
  it('allows public published room reads', async () => { await assertSucceeds(getDoc(doc(testEnvironment.unauthenticatedContext().firestore(), 'rooms', 'published-room'))); });
  it('denies anonymous point account reads', async () => { await assertFails(getDoc(doc(testEnvironment.unauthenticatedContext().firestore(), 'pointAccounts', 'hotel-a__user-a'))); });
  it('allows owner point account reads but denies writes', async () => {
    const store = testEnvironment.authenticatedContext('user-a').firestore();
    expect((await assertSucceeds(getDoc(doc(store, 'pointAccounts', 'hotel-a__user-a')))).exists()).toBe(true);
    await assertFails(setDoc(doc(store, 'pointAccounts', 'hotel-a__user-a'), { balance: 10000 }));
  });
});
