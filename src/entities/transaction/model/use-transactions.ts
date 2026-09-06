import { createStore } from '@/shared/lib/create-store';
import { generateId } from '@/shared/lib/generate-id';
import { useStore } from '@/shared/lib/use-store';

import { mockTransactions } from './mock-data';
import type { NewTransaction, Transaction } from './types';

const transactionStore = createStore<Transaction[]>(mockTransactions);

export function useTransactions(): Transaction[] {
  return useStore(transactionStore, (transactions) => transactions);
}

export function addTransaction(transaction: NewTransaction): void {
  const id = generateId('transaction');
  transactionStore.setState((transactions) => [{ ...transaction, id } as Transaction, ...transactions]);
}

export function getTransaction(id: string): Transaction | undefined {
  return transactionStore.getState().find((transaction) => transaction.id === id);
}

export function updateTransaction(id: string, changes: Partial<NewTransaction>): void {
  transactionStore.setState((transactions) =>
    transactions.map((transaction) => (transaction.id === id ? ({ ...transaction, ...changes } as Transaction) : transaction)),
  );
}

export function deleteTransaction(id: string): void {
  transactionStore.setState((transactions) => transactions.filter((transaction) => transaction.id !== id));
}
