import { useState } from 'react';

import { useAccounts } from '@/entities/account';
import { addTransaction, type TransactionType } from '@/entities/transaction';
import { evaluateAmountExpression } from '@/shared/lib/evaluate-amount-expression';
import { applyKeypadKey } from '@/shared/lib/keypad-input';

import { setLastUsedAccountId, useLastUsedAccountId } from './last-used-account-store';

type AmountTransactionType = Extract<TransactionType, 'expense' | 'income'>;

export function useTransactionForm(kind: AmountTransactionType) {
  const accounts = useAccounts();
  const lastUsedAccountId = useLastUsedAccountId();
  const [accountIdOverride, setAccountIdOverride] = useState<string | undefined>(undefined);
  const [amountExpression, setAmountExpression] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  const accountId = accountIdOverride ?? lastUsedAccountId ?? accounts[0]?.id;
  const canSubmit = evaluateAmountExpression(amountExpression) > 0 && !!accountId && !!categoryId;

  function pressKey(key: string) {
    setAmountExpression((expression) => applyKeypadKey(expression, key));
  }

  function commit(): boolean {
    const amount = evaluateAmountExpression(amountExpression);
    if (amount <= 0 || !accountId || !categoryId) {
      return false;
    }

    addTransaction({
      type: kind,
      date: date.toISOString(),
      note,
      accountId,
      categoryId,
      amount,
    });

    setLastUsedAccountId(accountId);
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
