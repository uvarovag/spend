import { useState } from 'react';

import { useAccounts } from '@/entities/account';
import { addTransaction, type TransactionType } from '@/entities/transaction';
import { evaluateAmountExpression } from '@/shared/lib/evaluate-amount-expression';
import { applyKeypadKey } from '@/shared/lib/keypad-input';

import { useFrequentAccountId } from './use-frequent-account-id';

type AmountTransactionType = Extract<TransactionType, 'expense' | 'income'>;

export function useTransactionForm(kind: AmountTransactionType) {
  const accounts = useAccounts();
  const frequentAccountId = useFrequentAccountId(kind === 'expense' ? 'debit' : 'credit');
  const [accountIdOverride, setAccountIdOverride] = useState<string | undefined>(undefined);
  const [amountExpression, setAmountExpression] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  // rankAccountsByRoleFrequency always returns every account (falling back to the accounts'
  // original order once none of them have role usage yet), so no further fallback is needed here.
  const accountId = accountIdOverride ?? frequentAccountId;
  const canSubmit = evaluateAmountExpression(amountExpression) > 0 && !!accountId && !!categoryId;

  function pressKey(key: string) {
    setAmountExpression((expression) => applyKeypadKey(expression, key));
  }

  function commit(): boolean {
    const amount = evaluateAmountExpression(amountExpression);
    if (amount <= 0 || !accountId || !categoryId) {
      return false;
    }

    void addTransaction({
      type: kind,
      date: date.toISOString(),
      note,
      accountId,
      categoryId,
      amount,
    });

    setAmountExpression('');
    setNote('');
    setCategoryId(undefined);
    return true;
  }

  return {
    accounts,
    accountId,
    setAccountId: setAccountIdOverride,
    amountExpression,
    pressKey,
    date,
    setDate,
    note,
    setNote,
    categoryId,
    setCategoryId,
    canSubmit,
    commit,
  };
}
