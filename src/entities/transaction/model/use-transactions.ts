import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { eq } from 'drizzle-orm';

import { getDatabase } from '@/shared/lib/db-bridge';
import { notifyWriteFailure } from '@/shared/lib/error-notifications';
import { generateId } from '@/shared/lib/generate-id';
import { dispatch, getState, useAppSelector } from '@/shared/lib/store-bridge';

import { mockTransactions } from './mock-data';
import { transactionsTable } from './schema';
import { mapRowToTransaction, mapTransactionToRow } from './transaction-row';
import type { NewTransaction, Transaction } from './types';

const transactionsAdapter = createEntityAdapter<Transaction>({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: transactionsAdapter.getInitialState(),
  reducers: {
    transactionAdded: transactionsAdapter.addOne,
    transactionUpdated: transactionsAdapter.updateOne,
    transactionDeleted: transactionsAdapter.removeOne,
    // Replaces the whole collection with what was just read from SQLite at startup.
    transactionsHydrated: transactionsAdapter.setAll,
  },
});

export const transactionsReducer = transactionsSlice.reducer;
const { transactionAdded, transactionUpdated, transactionDeleted, transactionsHydrated } = transactionsSlice.actions;

const transactionsSelectors = transactionsAdapter.getSelectors();

export function useTransactions(): Transaction[] {
  return useAppSelector((state) => transactionsSelectors.selectAll(state.transactions));
}

// Reads the full transactions table into Redux at app startup (business-logic-plan.md, Step 9).
// In __DEV__, seeds the table from `mock-data.ts` first if it's still empty (Step 8) — a real
// build never seeds, it just starts with zero transactions (docs/app-overview.md).
export async function hydrateTransactions(): Promise<void> {
  const database = getDatabase();
  if (__DEV__) {
    const [firstRow] = await database.select({ id: transactionsTable.id }).from(transactionsTable).limit(1);
    if (!firstRow) {
      await database.insert(transactionsTable).values(mockTransactions.map(mapTransactionToRow));
    }
  }
  const rows = await database.select().from(transactionsTable);
  dispatch(transactionsHydrated(rows.map(mapRowToTransaction)));
}

// Write-through persistence (business-logic-plan.md, Step 10) — see `use-accounts.ts` for the
// rationale: optimistic Redux update first, background SQLite write second, failures logged and
// surfaced (Step 14) but never rolled back.
export async function addTransaction(transaction: NewTransaction): Promise<void> {
  const id = generateId('transaction');
  const newTransaction = { ...transaction, id } as Transaction;
  dispatch(transactionAdded(newTransaction));
  try {
    await getDatabase().insert(transactionsTable).values(mapTransactionToRow(newTransaction));
  } catch (error) {
    console.error('Failed to persist new transaction:', error);
    notifyWriteFailure();
  }
}

export function getTransaction(id: string): Transaction | undefined {
  return transactionsSelectors.selectById(getState().transactions, id);
}

export async function updateTransaction(id: string, changes: Partial<NewTransaction>): Promise<void> {
  dispatch(transactionUpdated({ id, changes }));
  try {
    await getDatabase().update(transactionsTable).set(changes).where(eq(transactionsTable.id, id));
  } catch (error) {
    console.error('Failed to persist transaction update:', error);
    notifyWriteFailure();
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  dispatch(transactionDeleted(id));
  try {
    await getDatabase().delete(transactionsTable).where(eq(transactionsTable.id, id));
  } catch (error) {
    console.error('Failed to persist transaction delete:', error);
    notifyWriteFailure();
  }
}
