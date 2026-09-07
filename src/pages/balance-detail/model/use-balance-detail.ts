import { useMemo } from 'react';

import { useAccounts, type Account } from '@/entities/account';
import { computeAccountBalance, useTransactions } from '@/entities/transaction';

export interface CurrencyBalanceGroup {
  currency: string;
  total: number;
  accounts: Account[];
}

export function useBalanceDetail(): CurrencyBalanceGroup[] {
  const accounts = useAccounts();
  const transactions = useTransactions();

  return useMemo(() => {
    const balanceByAccountId = new Map(
      accounts.map((account) => [account.id, computeAccountBalance(transactions, account.id, account.initialBalance)])
    );

    const groupByCurrency = new Map<string, Account[]>();
    for (const account of accounts) {
      const group = groupByCurrency.get(account.currency);
      if (group) {
        group.push(account);
      } else {
        groupByCurrency.set(account.currency, [account]);
      }
    }

    return [...groupByCurrency.entries()]
      .map(([currency, currencyAccounts]) => ({
        currency,
        total: currencyAccounts.reduce((sum, account) => sum + (balanceByAccountId.get(account.id) ?? 0), 0),
        accounts: [...currencyAccounts].sort(
          (a, b) => (balanceByAccountId.get(b.id) ?? 0) - (balanceByAccountId.get(a.id) ?? 0)
        ),
      }))
      .sort((a, b) => b.total - a.total);
  }, [accounts, transactions]);
}
