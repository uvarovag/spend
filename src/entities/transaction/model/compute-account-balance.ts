import type { Transaction } from './types';

export function computeAccountBalance(transactions: Transaction[], accountId: string, initialBalance: number): number {
  let balance = initialBalance;

  for (const transaction of transactions) {
    if (transaction.type === 'expense' && transaction.accountId === accountId) {
      balance -= transaction.amount;
    } else if (transaction.type === 'income' && transaction.accountId === accountId) {
      balance += transaction.amount;
    } else if (transaction.type === 'transfer') {
      if (transaction.fromAccountId === accountId) {
        balance -= transaction.fromAmount;
      }
      if (transaction.toAccountId === accountId) {
        balance += transaction.toAmount;
      }
    }
  }

  return balance;
}
