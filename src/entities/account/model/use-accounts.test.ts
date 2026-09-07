import { eq } from 'drizzle-orm';

// Side-effect only: registers the real Redux store with `store-bridge.ts` so this entity's
// dispatch/getState calls have somewhere to go (see store-bridge.ts for why entities can't import
// `store.ts` directly).
import '@/shared/lib/store';
import { getDatabase } from '@/shared/lib/db-bridge';
import { notifyWriteFailure } from '@/shared/lib/error-notifications';
import { createFakeDatabase, mockInsert, mockSelect, mockUpdate, type FakeDatabase } from '@test-utils/fake-database';

import { accountsTable } from './schema';
import { archiveAccount, createAccount, getAccount, hydrateAccounts, updateAccount, type NewAccount } from './use-accounts';

jest.mock('@/shared/lib/db-bridge');
jest.mock('@/shared/lib/error-notifications');

const newAccount: NewAccount = { name: 'Card', type: 'card', currency: 'USD', initialBalance: 100, color: '#007AFF' };

let fakeDatabase: FakeDatabase;

beforeEach(() => {
  fakeDatabase = createFakeDatabase();
  (getDatabase as jest.Mock).mockReturnValue(fakeDatabase);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('createAccount', () => {
  it('applies the account to Redux immediately and writes it through to SQLite', async () => {
    const values = mockInsert(fakeDatabase);

    await createAccount(newAccount);

    expect(values).toHaveBeenCalledWith(expect.objectContaining({ ...newAccount, archivedAt: null }));
    expect(fakeDatabase.insert).toHaveBeenCalledWith(accountsTable);

    const accountId = values.mock.calls[0][0].id;
    expect(getAccount(accountId)).toEqual(values.mock.calls[0][0]);
  });

  it('logs and notifies, without throwing, when the SQLite write fails', async () => {
    mockInsert(fakeDatabase, new Error('disk full'));

    await expect(createAccount(newAccount)).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
    expect(notifyWriteFailure).toHaveBeenCalled();
  });
});

describe('updateAccount', () => {
  async function createTestAccount(): Promise<string> {
    const values = mockInsert(fakeDatabase);
    await createAccount(newAccount);
    return values.mock.calls[0][0].id;
  }

  it('merges the change into Redux and writes it through', async () => {
    const accountId = await createTestAccount();
    const { where } = mockUpdate(fakeDatabase);

    await updateAccount(accountId, { name: 'Renamed' });

    expect(getAccount(accountId)?.name).toBe('Renamed');
    expect(fakeDatabase.update).toHaveBeenCalledWith(accountsTable);
    expect(where).toHaveBeenCalledWith(eq(accountsTable.id, accountId));
  });

  it('logs and notifies, without throwing, when the SQLite write fails', async () => {
    const accountId = await createTestAccount();
    mockUpdate(fakeDatabase, new Error('disk full'));

    await expect(updateAccount(accountId, { name: 'Renamed' })).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
    expect(notifyWriteFailure).toHaveBeenCalled();
  });

  it("does not accept `currency` or `initialBalance` in its changes type — data-constraints.md's rule, checked by tsc, not at runtime", () => {
    // Never called — this function only exists so `tsc --noEmit` evaluates the `@ts-expect-error`
    // lines below. If either restriction is ever loosened, the matching line stops being a type
    // error and `tsc` fails the build.
    function typeOnlyRegressionGuard() {
      // @ts-expect-error `currency` is deliberately excluded: `computeAccountBalance` sums amounts
      // with no conversion, so changing it after transactions exist would reinterpret history.
      updateAccount('any-id', { currency: 'EUR' });
      // @ts-expect-error `initialBalance` is deliberately excluded: it's a fixed starting point,
      // not a value to correct after the fact.
      updateAccount('any-id', { initialBalance: 0 });
    }
    expect(typeOnlyRegressionGuard).toBeDefined();
  });
});

describe('archiveAccount', () => {
  it('sets archivedAt in Redux and writes it through', async () => {
    const values = mockInsert(fakeDatabase);
    await createAccount(newAccount);
    const accountId = values.mock.calls[0][0].id;

    const { where } = mockUpdate(fakeDatabase);
    await archiveAccount(accountId);

    expect(getAccount(accountId)?.archivedAt).not.toBeNull();
    expect(where).toHaveBeenCalledWith(eq(accountsTable.id, accountId));
  });
});

// `__DEV__` is declared `const` by React Native's own types, so it can't be reassigned through
// the type system — this cast is the standard way to flip it for a test.
function setDevMode(value: boolean): void {
  (global as unknown as { __DEV__: boolean }).__DEV__ = value;
}

// Kept last in this file on purpose: `hydrateAccounts` dispatches `accountsHydrated`, which
// replaces Redux's entire accounts collection (`adapter.setAll`) — running it before the other
// describe blocks would wipe out the accounts they create against the same real, shared store.
describe('hydrateAccounts', () => {
  const originalDev = __DEV__;

  afterEach(() => {
    setDevMode(originalDev);
  });

  it('seeds mock accounts when __DEV__ and the table is empty, then hydrates Redux from it', async () => {
    setDevMode(true);
    mockSelect(fakeDatabase, []); // the "is the table empty?" check
    const values = mockInsert(fakeDatabase); // the dev seed insert
    const seededRow = { ...newAccount, id: 'account-seed', archivedAt: null };
    mockSelect(fakeDatabase, [seededRow]); // the final read that hydrates Redux

    await hydrateAccounts();

    expect(values).toHaveBeenCalled();
    expect(getAccount('account-seed')).toEqual(seededRow);
  });

  it('does not seed when __DEV__ but the table already has rows', async () => {
    setDevMode(true);
    mockSelect(fakeDatabase, [{ id: 'existing' }]); // the "is the table empty?" check finds a row
    mockSelect(fakeDatabase, [{ ...newAccount, id: 'existing', archivedAt: null }]); // the final read

    await hydrateAccounts();

    expect(fakeDatabase.insert).not.toHaveBeenCalled();
  });

  it('never seeds outside __DEV__, even when the table is empty', async () => {
    setDevMode(false);
    mockSelect(fakeDatabase, []); // the only read: the final hydration read

    await hydrateAccounts();

    expect(fakeDatabase.insert).not.toHaveBeenCalled();
  });
});
