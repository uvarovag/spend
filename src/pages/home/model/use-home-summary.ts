import { useMemo } from 'react';

import { useAccounts } from '@/entities/account';
import { useCategories } from '@/entities/category';
import { computeAccountBalance, useTransactions, type Transaction } from '@/entities/transaction';
import { getStartOfMonth } from '@/shared/lib/format-date';

const recentTransactionsLimit = 4;

export interface CategorySpending {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
}

interface HomeSummary {
  totalBalance: number;
  monthSpent: number;
  monthIncome: number;
  categorySpendings: CategorySpending[];
  recentTransactions: Transaction[];
}

export function useCurrencies(): string[] {
  const accounts = useAccounts();
  return useMemo(() => [...new Set(accounts.map((account) => account.currency))], [accounts]);
}

export function useHomeSummary(currency: string): HomeSummary {
  const accounts = useAccounts();
  const transactions = useTransactions();
  const expenseCategories = useCategories('expense');

  return useMemo(() => {
    const currencyAccounts = accounts.filter((account) => account.currency === currency);
    const currencyAccountIds = new Set(currencyAccounts.map((account) => account.id));

    const totalBalance = currencyAccounts.reduce(
      (sum, account) => sum + computeAccountBalance(transactions, account.id, account.initialBalance),
      0
    );

    const monthStart = getStartOfMonth();

    let monthSpent = 0;
    let monthIncome = 0;
    const spentByCategoryId = new Map<string, number>();

    for (const transaction of transactions) {
      if (transaction.type === 'transfer' || !currencyAccountIds.has(transaction.accountId)) {
        continue;
      }
      if (new Date(transaction.date) < monthStart) {
        continue;
      }
      if (transaction.type === 'expense') {
        monthSpent += transaction.amount;
        const previousAmount = spentByCategoryId.get(transaction.categoryId) ?? 0;
        spentByCategoryId.set(transaction.categoryId, previousAmount + transaction.amount);
      } else {
        monthIncome += transaction.amount;
      }
    }

    const categorySpendings: CategorySpending[] = expenseCategories
      .map((category) => ({
        categoryId: category.id,
        name: category.name,
        color: category.color,
        amount: spentByCategoryId.get(category.id) ?? 0,
      }))
      .filter((categorySpending) => categorySpending.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const recentTransactions = transactions
      .filter((transaction) =>
        transaction.type === 'transfer'
          ? currencyAccountIds.has(transaction.fromAccountId) || currencyAccountIds.has(transaction.toAccountId)
          : currencyAccountIds.has(transaction.accountId)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, recentTransactionsLimit);

    return { totalBalance, monthSpent, monthIncome, categorySpendings, recentTransactions };
  }, [accounts, transactions, expenseCategories, currency]);
}
