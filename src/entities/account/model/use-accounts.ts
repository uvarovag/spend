import { createStore } from '@/shared/lib/create-store';
import { generateId } from '@/shared/lib/generate-id';
import { useStore } from '@/shared/lib/use-store';

import { mockAccounts } from './mock-data';
import type { Account } from './types';

const accountStore = createStore<Account[]>(mockAccounts);

export function useAccounts(): Account[] {
  return useStore(accountStore, (accounts) => accounts.filter((account) => account.archivedAt === null));
}

export function useAccount(accountId: string | undefined): Account | undefined {
  return useStore(accountStore, (accounts) => accounts.find((account) => account.id === accountId));
}

export function getAccount(accountId: string): Account | undefined {
  return accountStore.getState().find((account) => account.id === accountId);
}

export type NewAccount = Omit<Account, 'id' | 'archivedAt'>;

export function createAccount(account: NewAccount): void {
  const id = generateId('account');
  accountStore.setState((accounts) => [...accounts, { ...account, id, archivedAt: null }]);
}

// Currency is excluded on purpose: `computeAccountBalance` sums transaction amounts with no
// conversion, so changing an account's currency after transactions exist would silently
// reinterpret its whole history in the new currency.
// Initial balance is excluded on purpose too: it's the account's starting point at creation —
// letting it be rewritten later would silently rewrite history even though the running balance
// itself would still recompute correctly.
export function updateAccount(accountId: string, changes: Partial<Omit<NewAccount, 'currency' | 'initialBalance'>>): void {
  accountStore.setState((accounts) =>
    accounts.map((account) => (account.id === accountId ? { ...account, ...changes } : account))
  );
}

export function archiveAccount(accountId: string): void {
  accountStore.setState((accounts) =>
    accounts.map((account) => (account.id === accountId ? { ...account, archivedAt: new Date().toISOString() } : account))
  );
}
