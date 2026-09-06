import { computeAccountBalance } from './compute-account-balance';
import { useTransactions } from './use-transactions';

export function useAccountBalance(account: { id: string; initialBalance: number } | undefined): number {
  const transactions = useTransactions();
  return account ? computeAccountBalance(transactions, account.id, account.initialBalance) : 0;
}
