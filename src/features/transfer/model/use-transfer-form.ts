import { useAccounts, type Account } from '@/entities/account';
import { accountFrequencyWindowInDays, addTransaction, useTransactions, type Transaction } from '@/entities/transaction';
import { parseAmount } from '@/shared/lib/parse-amount';

import { useTransferFormCore } from './use-transfer-form-core';

interface TransferPair {
  fromAccountId: string;
  toAccountId: string;
}

// Prefills the transfer with the account pair the user transfers between most often, rather than
// always starting from the first two accounts in the list — same analysis window as every other
// "which account does the user use most" default (accountFrequencyWindowInDays).
function findMostFrequentTransferPair(transactions: Transaction[], accounts: Account[]): TransferPair | undefined {
  const windowStart = Date.now() - accountFrequencyWindowInDays * 24 * 60 * 60 * 1000;
  const accountIds = new Set(accounts.map((account) => account.id));
  const usageCountByPair = new Map<string, { pair: TransferPair; count: number }>();

  for (const transaction of transactions) {
    if (transaction.type !== 'transfer') {
      continue;
    }
    if (new Date(transaction.date).getTime() < windowStart) {
      continue;
    }
    if (!accountIds.has(transaction.fromAccountId) || !accountIds.has(transaction.toAccountId)) {
      continue;
    }
    const key = `${transaction.fromAccountId}→${transaction.toAccountId}`;
    const previous = usageCountByPair.get(key);
    usageCountByPair.set(key, {
      pair: { fromAccountId: transaction.fromAccountId, toAccountId: transaction.toAccountId },
      count: (previous?.count ?? 0) + 1,
    });
  }

  let mostFrequent: { pair: TransferPair; count: number } | undefined;
  for (const entry of usageCountByPair.values()) {
    if (!mostFrequent || entry.count > mostFrequent.count) {
      mostFrequent = entry;
    }
  }

  return mostFrequent?.pair;
}

function findLastRate(
  fromCurrency: string,
  toCurrency: string,
  accounts: Account[],
  transactions: Transaction[]
): number | undefined {
  const currencyByAccountId = new Map(accounts.map((account) => [account.id, account.currency]));

  const lastMatchingTransfer = transactions.find(
    (transaction) =>
      transaction.type === 'transfer' &&
      currencyByAccountId.get(transaction.fromAccountId) === fromCurrency &&
      currencyByAccountId.get(transaction.toAccountId) === toCurrency
  );

  return lastMatchingTransfer?.type === 'transfer'
    ? lastMatchingTransfer.toAmount / lastMatchingTransfer.fromAmount
    : undefined;
}

export interface TransferFormState {
  accounts: Account[];
  fromAccountId: string | undefined;
  setFromAccountId: (accountId: string) => void;
  toAccountId: string | undefined;
  setToAccountId: (accountId: string) => void;
  swapAccounts: () => void;
  fromAccount: Account | undefined;
  toAccount: Account | undefined;
  date: Date;
  setDate: (date: Date) => void;
  fromAmountText: string;
  toAmountText: string;
  setToAmountText: (text: string) => void;
  updateFromAmount: (text: string) => void;
  sameCurrency: boolean;
  fromAmount: number;
  toAmount: number;
  rate: number | undefined;
  canSubmit: boolean;
  commit: () => boolean;
}

export function useTransferForm(): TransferFormState {
  const accounts = useAccounts();
  const transactions = useTransactions();
  const frequentPair = findMostFrequentTransferPair(transactions, accounts);

  const core = useTransferFormCore({
    fromAccountId: frequentPair?.fromAccountId,
    toAccountId: frequentPair?.toAccountId,
  });

  const lastRate =
    core.fromAccount && core.toAccount && !core.sameCurrency
      ? findLastRate(core.fromAccount.currency, core.toAccount.currency, accounts, transactions)
      : undefined;

  function updateFromAmount(text: string) {
    core.setFromAmountText(text);
    if (core.sameCurrency) {
      core.setToAmountText(text);
      return;
    }
    if (core.toAmountText.length === 0 && lastRate !== undefined) {
      const draftAmount = parseAmount(text) * lastRate;
      core.setToAmountText(draftAmount > 0 ? String(Math.round(draftAmount * 100) / 100) : '');
    }
  }

  function commit(): boolean {
    if (!core.canSubmit || !core.fromAccountId || !core.toAccountId) {
      return false;
    }

    void addTransaction({
      type: 'transfer',
      date: core.date.toISOString(),
      note: '',
      fromAccountId: core.fromAccountId,
      toAccountId: core.toAccountId,
      fromAmount: core.fromAmount,
      toAmount: core.toAmount,
    });

    core.setFromAmountText('');
    core.setToAmountText('');
    return true;
  }

  return { ...core, updateFromAmount, commit };
}
