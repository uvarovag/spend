import type { Transaction } from './types';

// Shared by every "which account does the user use most" default in the app: the default account
// for expense/income entry, the pick-account list order, and the frequent transfer pair.
export const accountFrequencyWindowInDays = 7;

export type AccountRole = 'debit' | 'credit';

// The account that plays this role most often is the one the user is most likely to pick again —
// expense/transfer-from count as "debit", income/transfer-to count as "credit".
export function getRoleAccountId(transaction: Transaction, role: AccountRole): string | undefined {
  if (role === 'debit') {
    if (transaction.type === 'expense') {
      return transaction.accountId;
    }
    return transaction.type === 'transfer' ? transaction.fromAccountId : undefined;
  }
  if (transaction.type === 'income') {
    return transaction.accountId;
  }
  return transaction.type === 'transfer' ? transaction.toAccountId : undefined;
}

// Ranks `accounts` by how often each played `role` within the last `accountFrequencyWindowInDays`,
// most-used first; accounts with no matching usage keep their relative input order at the end
// (stable sort, both sides fall back to a 0 count).
export function rankAccountsByRoleFrequency<T extends { id: string }>(
  accounts: T[],
  transactions: Transaction[],
  role: AccountRole
): T[] {
  const windowStart = Date.now() - accountFrequencyWindowInDays * 24 * 60 * 60 * 1000;
  const usageCountByAccountId = new Map<string, number>();

  for (const transaction of transactions) {
    if (new Date(transaction.date).getTime() < windowStart) {
      continue;
    }
    const accountId = getRoleAccountId(transaction, role);
    if (!accountId) {
      continue;
    }
    usageCountByAccountId.set(accountId, (usageCountByAccountId.get(accountId) ?? 0) + 1);
  }

  return [...accounts].sort(
    (a, b) => (usageCountByAccountId.get(b.id) ?? 0) - (usageCountByAccountId.get(a.id) ?? 0)
  );
}
