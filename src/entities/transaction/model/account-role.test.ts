import { accountFrequencyWindowInDays, getRoleAccountId, rankAccountsByRoleFrequency } from './account-role';
import type { Transaction } from './types';

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function expenseTransaction(accountId: string, date = daysAgo(0)): Transaction {
  return { id: 't', date, note: '', type: 'expense', accountId, categoryId: 'c', amount: 10 };
}

function incomeTransaction(accountId: string, date = daysAgo(0)): Transaction {
  return { id: 't', date, note: '', type: 'income', accountId, categoryId: 'c', amount: 10 };
}

function transferTransaction(fromAccountId: string, toAccountId: string, date = daysAgo(0)): Transaction {
  return { id: 't', date, note: '', type: 'transfer', fromAccountId, toAccountId, fromAmount: 10, toAmount: 10 };
}

describe('getRoleAccountId', () => {
  it('reads accountId off an expense for the debit role, and nothing for credit', () => {
    const transaction = expenseTransaction('a1');
    expect(getRoleAccountId(transaction, 'debit')).toBe('a1');
    expect(getRoleAccountId(transaction, 'credit')).toBeUndefined();
  });

  it('reads accountId off an income for the credit role, and nothing for debit', () => {
    const transaction = incomeTransaction('a1');
    expect(getRoleAccountId(transaction, 'credit')).toBe('a1');
    expect(getRoleAccountId(transaction, 'debit')).toBeUndefined();
  });

  it('reads fromAccountId/toAccountId off a transfer for debit/credit respectively', () => {
    const transaction = transferTransaction('a1', 'a2');
    expect(getRoleAccountId(transaction, 'debit')).toBe('a1');
    expect(getRoleAccountId(transaction, 'credit')).toBe('a2');
  });
});

describe('rankAccountsByRoleFrequency', () => {
  it('ranks accounts by how often they played the role within the window, most-used first', () => {
    const transactions = [
      expenseTransaction('frequent'),
      expenseTransaction('frequent'),
      expenseTransaction('rare'),
    ];

    const ranked = rankAccountsByRoleFrequency(
      [{ id: 'rare' }, { id: 'frequent' }, { id: 'unused' }],
      transactions,
      'debit'
    );

    expect(ranked.map((account) => account.id)).toEqual(['frequent', 'rare', 'unused']);
  });

  it('ignores transactions outside the frequency window', () => {
    const transactions = [
      expenseTransaction('old', daysAgo(accountFrequencyWindowInDays + 1)),
      expenseTransaction('recent', daysAgo(0)),
    ];

    const ranked = rankAccountsByRoleFrequency([{ id: 'old' }, { id: 'recent' }], transactions, 'debit');

    expect(ranked.map((account) => account.id)).toEqual(['recent', 'old']);
  });

  it('ignores transactions for the other role', () => {
    const transactions = [incomeTransaction('a1'), incomeTransaction('a1')];

    const ranked = rankAccountsByRoleFrequency([{ id: 'a2' }, { id: 'a1' }], transactions, 'debit');

    // No debit usage for either account — falls back to the input order.
    expect(ranked.map((account) => account.id)).toEqual(['a2', 'a1']);
  });
});
