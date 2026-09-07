import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { eq } from 'drizzle-orm';

import { getDatabase } from '@/shared/lib/db-bridge';
import { notifyWriteFailure } from '@/shared/lib/error-notifications';
import { generateId } from '@/shared/lib/generate-id';
import { dispatch, getState, useAppSelector } from '@/shared/lib/store-bridge';

import { mockAccounts } from './mock-data';
import { accountsTable } from './schema';
import type { Account } from './types';

const accountsAdapter = createEntityAdapter<Account>();

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: accountsAdapter.getInitialState(),
  reducers: {
    accountAdded: accountsAdapter.addOne,
    accountUpdated: accountsAdapter.updateOne,
    // Replaces the whole collection with what was just read from SQLite at startup.
    accountsHydrated: accountsAdapter.setAll,
  },
});

export const accountsReducer = accountsSlice.reducer;
const { accountAdded, accountUpdated, accountsHydrated } = accountsSlice.actions;

const accountsSelectors = accountsAdapter.getSelectors();

const selectNonArchivedAccounts = createSelector(accountsSelectors.selectAll, (accounts) =>
  accounts.filter((account) => account.archivedAt === null)
);

export function useAccounts(): Account[] {
  return useAppSelector((state) => selectNonArchivedAccounts(state.accounts));
}

export function useAccount(accountId: string | undefined): Account | undefined {
  return useAppSelector((state) => (accountId ? accountsSelectors.selectById(state.accounts, accountId) : undefined));
}

export function getAccount(accountId: string): Account | undefined {
  return accountsSelectors.selectById(getState().accounts, accountId);
}

export type NewAccount = Omit<Account, 'id' | 'archivedAt'>;

// Reads the full accounts table into Redux at app startup (business-logic-plan.md, Step 9). In
// __DEV__, seeds the table from `mock-data.ts` first if it's still empty, so manual testing keeps
// working the way it did with the old in-memory seed (Step 6) — a real build never seeds, it just
// starts with zero accounts (docs/app-overview.md).
export async function hydrateAccounts(): Promise<void> {
  const database = getDatabase();
  if (__DEV__) {
    const [firstRow] = await database.select({ id: accountsTable.id }).from(accountsTable).limit(1);
    if (!firstRow) {
      await database.insert(accountsTable).values(mockAccounts);
    }
  }
  const accounts = await database.select().from(accountsTable);
  dispatch(accountsHydrated(accounts));
}

// Write-through persistence (business-logic-plan.md, Step 10): the Redux dispatch applies
// immediately so the UI updates optimistically, then the same change is written to SQLite in the
// background. A write failure is logged and surfaced to the user (Step 14) but never rolled back
// and never rejects this promise — callers can fire-and-forget it.
export async function createAccount(account: NewAccount): Promise<void> {
  const id = generateId('account');
  const newAccount: Account = { ...account, id, archivedAt: null };
  dispatch(accountAdded(newAccount));
  try {
    await getDatabase().insert(accountsTable).values(newAccount);
  } catch (error) {
    console.error('Failed to persist new account:', error);
    notifyWriteFailure();
  }
}

// Currency is excluded on purpose: `computeAccountBalance` sums transaction amounts with no
// conversion, so changing an account's currency after transactions exist would silently
// reinterpret its whole history in the new currency.
// Initial balance is excluded on purpose too: it's the account's starting point at creation —
// letting it be rewritten later would silently rewrite history even though the running balance
// itself would still recompute correctly.
export async function updateAccount(
  accountId: string,
  changes: Partial<Omit<NewAccount, 'currency' | 'initialBalance'>>
): Promise<void> {
  dispatch(accountUpdated({ id: accountId, changes }));
  try {
    await getDatabase().update(accountsTable).set(changes).where(eq(accountsTable.id, accountId));
  } catch (error) {
    console.error('Failed to persist account update:', error);
    notifyWriteFailure();
  }
}

export async function archiveAccount(accountId: string): Promise<void> {
  const archivedAt = new Date().toISOString();
  dispatch(accountUpdated({ id: accountId, changes: { archivedAt } }));
  try {
    await getDatabase().update(accountsTable).set({ archivedAt }).where(eq(accountsTable.id, accountId));
  } catch (error) {
    console.error('Failed to persist account archive:', error);
    notifyWriteFailure();
  }
}
