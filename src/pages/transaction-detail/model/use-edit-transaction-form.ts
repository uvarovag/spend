import { useMemo, useState } from 'react';

import { getAccount, useAccounts } from '@/entities/account';
import { updateTransaction, type ExpenseTransaction, type IncomeTransaction } from '@/entities/transaction';
import { evaluateAmountExpression } from '@/shared/lib/evaluate-amount-expression';
import { applyKeypadKey } from '@/shared/lib/keypad-input';

export function useEditTransactionForm(transaction: ExpenseTransaction | IncomeTransaction) {
  const allAccounts = useAccounts();
  // The amount is denominated in the original account's currency and there's no conversion
  // anywhere in the app, so reassigning to a different-currency account would silently mix
  // currencies into that account's derived balance — restrict the picker to matching accounts.
  const originalCurrency = useMemo(() => getAccount(transaction.accountId)?.currency, [transaction.accountId]);
  const accounts = useMemo(
    () => allAccounts.filter((account) => account.currency === originalCurrency),
    [allAccounts, originalCurrency]
  );
  const [accountId, setAccountId] = useState(transaction.accountId);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [amountExpression, setAmountExpression] = useState(String(transaction.amount));
  const [date, setDate] = useState(() => new Date(transaction.date));
  const [note, setNote] = useState(transaction.note);

  function pressKey(key: string) {
    setAmountExpression((expression) => applyKeypadKey(expression, key));
  }

  function save(): boolean {
    const amount = evaluateAmountExpression(amountExpression);
    if (amount <= 0 || !accountId) {
      return false;
    }

    updateTransaction(transaction.id, {
      date: date.toISOString(),
      note,
      accountId,
      categoryId,
      amount,
    });

    return true;
  }

  return {
    accounts,
    accountId,
    setAccountId,
    categoryId,
    setCategoryId,
    amountExpression,
    pressKey,
    date,
    setDate,
    note,
    setNote,
    save,
  };
}
