import { computeAccountBalance } from './compute-account-balance';
import type { Transaction } from './types';

describe('computeAccountBalance', () => {
  it('returns the initial balance when there are no transactions', () => {
    expect(computeAccountBalance([], 'account-1', 1000)).toBe(1000);
  });

  it('subtracts expenses and adds income for the given account', () => {
    const transactions: Transaction[] = [
      { id: 't1', date: '2026-01-01', note: '', type: 'expense', accountId: 'account-1', categoryId: 'c1', amount: 200 },
      { id: 't2', date: '2026-01-02', note: '', type: 'income', accountId: 'account-1', categoryId: 'c2', amount: 500 },
    ];

    expect(computeAccountBalance(transactions, 'account-1', 1000)).toBe(1300);
  });

  it('ignores transactions belonging to a different account', () => {
    const transactions: Transaction[] = [
      { id: 't1', date: '2026-01-01', note: '', type: 'expense', accountId: 'account-2', categoryId: 'c1', amount: 200 },
    ];

    expect(computeAccountBalance(transactions, 'account-1', 1000)).toBe(1000);
  });

  it('debits the source account and credits the destination account of a transfer', () => {
    const transactions: Transaction[] = [
      {
        id: 't1',
        date: '2026-01-01',
        note: '',
        type: 'transfer',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        fromAmount: 300,
        toAmount: 300,
      },
    ];

    expect(computeAccountBalance(transactions, 'account-1', 1000)).toBe(700);
    expect(computeAccountBalance(transactions, 'account-2', 0)).toBe(300);
  });

  it('applies both sides of a transfer when the same account is both source and destination', () => {
    const transactions: Transaction[] = [
      {
        id: 't1',
        date: '2026-01-01',
        note: '',
        type: 'transfer',
        fromAccountId: 'account-1',
        toAccountId: 'account-1',
        fromAmount: 300,
        toAmount: 300,
      },
    ];

    expect(computeAccountBalance(transactions, 'account-1', 1000)).toBe(1000);
  });
});
