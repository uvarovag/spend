import { mapRowToTransaction, mapTransactionToRow } from './transaction-row';
import type { ExpenseTransaction, TransferTransaction } from './types';

describe('mapTransactionToRow / mapRowToTransaction', () => {
  it('round-trips an expense transaction, nulling out the transfer-only columns', () => {
    const expense: ExpenseTransaction = {
      id: 't1',
      date: '2026-01-01T00:00:00.000Z',
      note: 'Lunch',
      type: 'expense',
      accountId: 'account-1',
      categoryId: 'category-1',
      amount: 500,
    };

    const row = mapTransactionToRow(expense);

    expect(row).toEqual({
      id: 't1',
      date: '2026-01-01T00:00:00.000Z',
      note: 'Lunch',
      type: 'expense',
      accountId: 'account-1',
      categoryId: 'category-1',
      amount: 500,
      fromAccountId: null,
      toAccountId: null,
      fromAmount: null,
      toAmount: null,
    });
    expect(mapRowToTransaction(row as Parameters<typeof mapRowToTransaction>[0])).toEqual(expense);
  });

  it('round-trips a transfer transaction, nulling out the expense/income-only columns', () => {
    const transfer: TransferTransaction = {
      id: 't2',
      date: '2026-01-02T00:00:00.000Z',
      note: '',
      type: 'transfer',
      fromAccountId: 'account-1',
      toAccountId: 'account-2',
      fromAmount: 100,
      toAmount: 100,
    };

    const row = mapTransactionToRow(transfer);

    expect(row).toEqual({
      id: 't2',
      date: '2026-01-02T00:00:00.000Z',
      note: '',
      type: 'transfer',
      accountId: null,
      categoryId: null,
      amount: null,
      fromAccountId: 'account-1',
      toAccountId: 'account-2',
      fromAmount: 100,
      toAmount: 100,
    });
    expect(mapRowToTransaction(row as Parameters<typeof mapRowToTransaction>[0])).toEqual(transfer);
  });
});
