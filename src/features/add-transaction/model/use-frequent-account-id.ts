import { useAccounts } from '@/entities/account';
import { rankAccountsByRoleFrequency, useTransactions, type AccountRole } from '@/entities/transaction';

export function useFrequentAccountId(role: AccountRole): string | undefined {
  const accounts = useAccounts();
  const transactions = useTransactions();
  return rankAccountsByRoleFrequency(accounts, transactions, role)[0]?.id;
}
