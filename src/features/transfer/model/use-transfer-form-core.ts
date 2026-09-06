import { useState } from 'react';

import { useAccounts, type Account } from '@/entities/account';
import { parseAmount } from '@/shared/lib/parse-amount';

export interface TransferFormCoreInitial {
  fromAccountId?: string;
  toAccountId?: string;
  date?: Date;
  fromAmountText?: string;
  toAmountText?: string;
}

export interface TransferFormCore {
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
  setFromAmountText: (text: string) => void;
  setToAmountText: (text: string) => void;
  sameCurrency: boolean;
  fromAmount: number;
  toAmount: number;
  rate: number | undefined;
  canSubmit: boolean;
}

// Shared state and math behind both the create-transfer and edit-transfer forms: which two
// accounts, same-currency detection, the symmetric rate, and submit validity. The two call
// sites differ only in initial values and how they commit — see use-transfer-form.ts and
// pages/transaction-detail/model/use-edit-transfer-form.ts.
export function useTransferFormCore(initial: TransferFormCoreInitial = {}): TransferFormCore {
  const accounts = useAccounts();

  const [fromAccountId, setFromAccountId] = useState(initial.fromAccountId ?? accounts[0]?.id);
  const [toAccountId, setToAccountId] = useState(initial.toAccountId ?? accounts[1]?.id ?? accounts[0]?.id);
  const [date, setDate] = useState(() => initial.date ?? new Date());
  const [fromAmountText, setFromAmountText] = useState(initial.fromAmountText ?? '');
  const [toAmountText, setToAmountText] = useState(initial.toAmountText ?? '');

  const fromAccount = accounts.find((account) => account.id === fromAccountId);
  const toAccount = accounts.find((account) => account.id === toAccountId);
  const sameCurrency = Boolean(fromAccount && toAccount && fromAccount.currency === toAccount.currency);

  function swapAccounts() {
    setFromAccountId(toAccountId);
    setToAccountId(fromAccountId);
    setFromAmountText(toAmountText);
    setToAmountText(fromAmountText);
  }

  const fromAmount = parseAmount(fromAmountText);
  const toAmount = parseAmount(sameCurrency ? fromAmountText : toAmountText);
  // The rate is shown independently of transfer direction: converting 1000 USD → 75000 RUB and
  // 75000 RUB → 1000 USD should both read as a rate of 75, not 75 vs. its reciprocal 0.0133.
  const rate = fromAmount > 0 && toAmount > 0 ? Math.max(fromAmount, toAmount) / Math.min(fromAmount, toAmount) : undefined;

  const canSubmit = Boolean(
    fromAccountId && toAccountId && fromAccountId !== toAccountId && fromAmount > 0 && toAmount > 0
  );

  return {
    accounts,
    fromAccountId,
    setFromAccountId,
    toAccountId,
    setToAccountId,
    swapAccounts,
    fromAccount,
    toAccount,
    date,
    setDate,
    fromAmountText,
    toAmountText: sameCurrency ? fromAmountText : toAmountText,
    setFromAmountText,
    setToAmountText,
    sameCurrency,
    fromAmount,
    toAmount,
    rate,
    canSubmit,
  };
}
