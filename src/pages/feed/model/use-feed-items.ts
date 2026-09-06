import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getAccount } from '@/entities/account';
import { useTransactions, type Transaction } from '@/entities/transaction';
import type { FeedFilters, FeedPeriod } from '@/features/feed-filters';
import { formatDate, getStartOfMonth, isSameDay } from '@/shared/lib/format-date';

type FeedListItem =
  | { kind: 'header'; id: string; label: string }
  | { kind: 'transaction'; id: string; transaction: Transaction };

export interface CurrencyTotal {
  currency: string;
  amount: number;
}

function getPeriodStart(period: FeedPeriod): Date | null {
  const start = new Date();
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      return start;
    case 'week':
      start.setDate(start.getDate() - 7);
      return start;
    case 'month':
      return getStartOfMonth();
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      return start;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      return start;
    default:
      return null;
  }
}

function matchesFilters(transaction: Transaction, filters: FeedFilters, periodStart: Date | null): boolean {
  if (filters.type !== 'all' && transaction.type !== filters.type) {
    return false;
  }
  if (filters.accountId) {
    const matchesAccount =
      transaction.type === 'transfer'
        ? transaction.fromAccountId === filters.accountId || transaction.toAccountId === filters.accountId
        : transaction.accountId === filters.accountId;
    if (!matchesAccount) {
      return false;
    }
  }
  if (filters.categoryId && (!('categoryId' in transaction) || transaction.categoryId !== filters.categoryId)) {
    return false;
  }
  if (periodStart && new Date(transaction.date) < periodStart) {
    return false;
  }
  return true;
}

// Sums non-transfer amounts per account currency — the app never converts between currencies
// (see use-home-summary.ts), so a single mixed-currency total would be misleading.
function computeTotals(transactions: Transaction[]): CurrencyTotal[] {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type === 'transfer') {
      continue;
    }
    const account = getAccount(transaction.accountId);
    if (!account) {
      continue;
    }
    const signedAmount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    totals.set(account.currency, (totals.get(account.currency) ?? 0) + signedAmount);
  }

  return [...totals.entries()].map(([currency, amount]) => ({ currency, amount }));
}

export function useFeedItems(filters: FeedFilters): { items: FeedListItem[]; totals: CurrencyTotal[] } {
  const { t, i18n } = useTranslation();
  const transactions = useTransactions();

  return useMemo(() => {
    const periodStart = getPeriodStart(filters.period);
    const filteredTransactions = transactions.filter((transaction) => matchesFilters(transaction, filters, periodStart));
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const items: FeedListItem[] = [];
    let lastDateKey: string | null = null;

    for (const transaction of sortedTransactions) {
      const date = new Date(transaction.date);
      const dateKey = date.toDateString();

      if (dateKey !== lastDateKey) {
        const label = isSameDay(date, today)
          ? t('feed.today')
          : isSameDay(date, yesterday)
            ? t('feed.yesterday')
            : formatDate(date, i18n.language);
        items.push({ kind: 'header', id: `header-${dateKey}`, label });
        lastDateKey = dateKey;
      }

      items.push({ kind: 'transaction', id: transaction.id, transaction });
    }

    return { items, totals: computeTotals(filteredTransactions) };
  }, [transactions, filters, t, i18n.language]);
}
