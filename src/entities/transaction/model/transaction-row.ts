import type { transactionsTable } from './schema';
import type { Transaction } from './types';

type TransactionRow = typeof transactionsTable.$inferSelect;
type NewTransactionRow = typeof transactionsTable.$inferInsert;

// The table has one row shape for all three transaction types (see schema.ts for why), so a row
// always carries every column, with the columns that don't apply to its `type` set to null. These
// two functions are the only place that bridges that wide row shape and the app's discriminated
// `Transaction` union.
export function mapRowToTransaction(row: TransactionRow): Transaction {
  if (row.type === 'transfer') {
    return {
      id: row.id,
      date: row.date,
      note: row.note,
      type: 'transfer',
      fromAccountId: row.fromAccountId as string,
      toAccountId: row.toAccountId as string,
      fromAmount: row.fromAmount as number,
      toAmount: row.toAmount as number,
    };
  }
  return {
    id: row.id,
    date: row.date,
    note: row.note,
    type: row.type,
    accountId: row.accountId as string,
    categoryId: row.categoryId as string,
    amount: row.amount as number,
  };
}

export function mapTransactionToRow(transaction: Transaction): NewTransactionRow {
  if (transaction.type === 'transfer') {
    return {
      id: transaction.id,
      date: transaction.date,
      note: transaction.note,
      type: transaction.type,
      accountId: null,
      categoryId: null,
      amount: null,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      fromAmount: transaction.fromAmount,
      toAmount: transaction.toAmount,
    };
  }
  return {
    id: transaction.id,
    date: transaction.date,
    note: transaction.note,
    type: transaction.type,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    amount: transaction.amount,
    fromAccountId: null,
    toAccountId: null,
    fromAmount: null,
    toAmount: null,
  };
}
