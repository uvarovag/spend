import { updateTransaction, type TransferTransaction } from '@/entities/transaction';
import { useTransferFormCore, type TransferFormState } from '@/features/transfer';

export function useEditTransferForm(transaction: TransferTransaction): TransferFormState {
  const core = useTransferFormCore({
    fromAccountId: transaction.fromAccountId,
    toAccountId: transaction.toAccountId,
    date: new Date(transaction.date),
    fromAmountText: String(transaction.fromAmount),
    toAmountText: String(transaction.toAmount),
  });

  function updateFromAmount(text: string) {
    core.setFromAmountText(text);
    if (core.sameCurrency) {
      core.setToAmountText(text);
    }
  }

  function commit(): boolean {
    if (!core.canSubmit || !core.fromAccountId || !core.toAccountId) {
      return false;
    }

    void updateTransaction(transaction.id, {
      date: core.date.toISOString(),
      fromAccountId: core.fromAccountId,
      toAccountId: core.toAccountId,
      fromAmount: core.fromAmount,
      toAmount: core.toAmount,
    });

    return true;
  }

  return { ...core, updateFromAmount, commit };
}
