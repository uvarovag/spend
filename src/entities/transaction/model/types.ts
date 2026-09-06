interface BaseTransaction {
  id: string;
  date: string;
  note: string;
}

export interface ExpenseTransaction extends BaseTransaction {
  type: 'expense';
  accountId: string;
  categoryId: string;
  amount: number;
}

export interface IncomeTransaction extends BaseTransaction {
  type: 'income';
  accountId: string;
  categoryId: string;
  amount: number;
}

export interface TransferTransaction extends BaseTransaction {
  type: 'transfer';
  fromAccountId: string;
  toAccountId: string;
  fromAmount: number;
  toAmount: number;
}

export type Transaction = ExpenseTransaction | IncomeTransaction | TransferTransaction;
export type TransactionType = Transaction['type'];

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type NewTransaction = DistributiveOmit<Transaction, 'id'>;
