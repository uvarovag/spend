import { eq } from 'drizzle-orm';

// Side-effect only: registers the real Redux store with `store-bridge.ts` (see the equivalent
// import in `entities/account/model/use-accounts.test.ts` for why).
import '@/shared/lib/store';
import { getDatabase } from '@/shared/lib/db-bridge';
import { notifyWriteFailure } from '@/shared/lib/error-notifications';
import { createFakeDatabase, mockDelete, mockInsert, mockSelect, mockUpdate, type FakeDatabase } from '@test-utils/fake-database';

import { transactionsTable } from './schema';
import {
  addTransaction,
  deleteTransaction,
  getTransaction,
  hydrateTransactions,
  updateTransaction,
} from './use-transactions';
import type { NewTransaction } from './types';

jest.mock('@/shared/lib/db-bridge');
jest.mock('@/shared/lib/error-notifications');

const newExpense: NewTransaction = {
  type: 'expense',
  date: '2026-01-01T00:00:00.000Z',
  note: '',
  accountId: 'account-1',
  categoryId: 'category-1',
  amount: 250,
};

let fakeDatabase: FakeDatabase;

beforeEach(() => {
  fakeDatabase = createFakeDatabase();
  (getDatabase as jest.Mock).mockReturnValue(fakeDatabase);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function createTestTransaction(): Promise<string> {
  const values = mockInsert(fakeDatabase);
  await addTransaction(newExpense);
  return values.mock.calls[0][0].id as string;
}

describe('addTransaction', () => {
  it('applies the transaction to Redux and writes the wide-table row through to SQLite', async () => {
    const values = mockInsert(fakeDatabase);

    await addTransaction(newExpense);

    expect(fakeDatabase.insert).toHaveBeenCalledWith(transactionsTable);
    const insertedRow = values.mock.calls[0][0];
    // The transfer-only columns must be nulled out, not left undefined, for an expense row.
    expect(insertedRow).toEqual(expect.objectContaining({ fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null }));

    const transactionId = insertedRow.id as string;
    expect(getTransaction(transactionId)).toEqual({ ...newExpense, id: transactionId });
  });

  it('logs and notifies, without throwing, when the SQLite write fails', async () => {
    mockInsert(fakeDatabase, new Error('disk full'));

    await expect(addTransaction(newExpense)).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
    expect(notifyWriteFailure).toHaveBeenCalled();
  });
});

describe('updateTransaction', () => {
  it('merges the change into Redux and writes it through', async () => {
    const transactionId = await createTestTransaction();
    const { where } = mockUpdate(fakeDatabase);

    await updateTransaction(transactionId, { amount: 999 });

    expect(getTransaction(transactionId)).toEqual({ ...newExpense, id: transactionId, amount: 999 });
    expect(where).toHaveBeenCalledWith(eq(transactionsTable.id, transactionId));
  });

  it('logs and notifies, without throwing, when the SQLite write fails', async () => {
    const transactionId = await createTestTransaction();
    mockUpdate(fakeDatabase, new Error('disk full'));

    await expect(updateTransaction(transactionId, { amount: 999 })).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
    expect(notifyWriteFailure).toHaveBeenCalled();
  });
});

describe('deleteTransaction', () => {
  it('removes the transaction from Redux and writes the delete through', async () => {
    const transactionId = await createTestTransaction();
    const { where } = mockDelete(fakeDatabase);

    await deleteTransaction(transactionId);

    expect(getTransaction(transactionId)).toBeUndefined();
    expect(where).toHaveBeenCalledWith(eq(transactionsTable.id, transactionId));
  });

  it('logs and notifies, without throwing, when the SQLite write fails', async () => {
    const transactionId = await createTestTransaction();
    mockDelete(fakeDatabase, new Error('disk full'));

    await expect(deleteTransaction(transactionId)).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
    expect(notifyWriteFailure).toHaveBeenCalled();
  });
});

// Kept last in this file on purpose: `hydrateTransactions` dispatches `transactionsHydrated`,
// which replaces Redux's entire transactions collection (`adapter.setAll`) — running it before the
// other describe blocks would wipe out the transactions they create against the same shared store.
describe('hydrateTransactions', () => {
  function setDevMode(value: boolean): void {
    (global as unknown as { __DEV__: boolean }).__DEV__ = value;
  }
  const originalDev = __DEV__;

  afterEach(() => {
    setDevMode(originalDev);
  });

  it('seeds mock transactions when __DEV__ and the table is empty, mapping rows back to the union type', async () => {
    setDevMode(true);
    mockSelect(fakeDatabase, []); // the "is the table empty?" check
    const values = mockInsert(fakeDatabase); // the dev seed insert
    const seededRow = {
      id: 'transaction-seed',
      date: newExpense.date,
      note: newExpense.note,
      type: 'expense',
      accountId: newExpense.accountId,
      categoryId: newExpense.categoryId,
      amount: newExpense.amount,
      fromAccountId: null,
      toAccountId: null,
      fromAmount: null,
      toAmount: null,
    };
    mockSelect(fakeDatabase, [seededRow]); // the final read that hydrates Redux

    await hydrateTransactions();

    expect(values).toHaveBeenCalled();
    expect(getTransaction('transaction-seed')).toEqual({ ...newExpense, id: 'transaction-seed' });
  });
});
