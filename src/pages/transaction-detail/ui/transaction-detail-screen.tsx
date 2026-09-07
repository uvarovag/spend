import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearPickedAccount, useAccount, usePickedAccount } from '@/entities/account';
import { deleteTransaction, getTransaction, type ExpenseTransaction, type IncomeTransaction, type TransferTransaction } from '@/entities/transaction';
import {
  AccountDateSection,
  AmountInput,
  CategoryPicker,
  NoteField,
  clearPickedCategoryId,
  useFrequentCategories,
  useNoteRelevantCategories,
  usePickedCategoryId,
} from '@/features/add-transaction';
import { TransferForm } from '@/features/transfer';
import { GlassButton } from '@/shared/ui/glass-button';
import { ModalHeader } from '@/shared/ui/modal-header';
import { NumericKeypad } from '@/shared/ui/numeric-keypad';

import { useEditTransactionForm } from '../model/use-edit-transaction-form';
import { useEditTransferForm } from '../model/use-edit-transfer-form';

interface EditFormProps<T> {
  transaction: T;
  onSaved: () => void;
  onDelete: () => void;
}

function EditAmountTransactionForm({
  transaction,
  onSaved,
  onDelete,
}: EditFormProps<ExpenseTransaction | IncomeTransaction>) {
  const { t, i18n } = useTranslation();
  const form = useEditTransactionForm(transaction);
  const frequentCategories = useFrequentCategories(transaction.type);
  const noteRelevantCategories = useNoteRelevantCategories(transaction.type, form.note);
  const account = useAccount(form.accountId);
  const pickedCategoryId = usePickedCategoryId();
  const pickedAccount = usePickedAccount();
  // The category already saved on this transaction is itself a deliberate choice — editing the
  // note must not silently swap it out, only a fresh manual/note-driven pick does.
  const categoryManuallySetRef = useRef(true);

  function handleSelectCategory(categoryId: string) {
    categoryManuallySetRef.current = true;
    form.setCategoryId(categoryId);
  }

  // Reacts only to a new pick from the categories screen, not to every re-render.
  useEffect(() => {
    if (pickedCategoryId) {
      clearPickedCategoryId();
      categoryManuallySetRef.current = true;
      form.setCategoryId(pickedCategoryId);
    }
  }, [pickedCategoryId]);

  // Reacts only to a new pick from the account-list screen, not to every re-render.
  useEffect(() => {
    if (pickedAccount && pickedAccount.requestId === 'account') {
      clearPickedAccount();
      form.setAccountId(pickedAccount.accountId);
    }
  }, [pickedAccount]);

  const rankedCategories =
    noteRelevantCategories.categories.length > 0 ? noteRelevantCategories.categories : frequentCategories;

  return (
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <ScrollView className="flex-1" contentContainerClassName="pb-40" keyboardShouldPersistTaps="handled">
        <AmountInput expression={form.amountExpression} currency={account?.currency ?? ''} locale={i18n.language} />
        <NumericKeypad onKeyPress={form.pressKey} />
        <View className="pt-4">
          <CategoryPicker
            kind={transaction.type}
            rankedCategories={rankedCategories}
            selectedCategoryId={form.categoryId}
            onSelect={handleSelectCategory}
          />
        </View>
        <View className="pt-4">
          <AccountDateSection
            accounts={form.accounts}
            accountId={form.accountId}
            date={form.date}
            onDateChange={form.setDate}
            locale={i18n.language}
            kind={transaction.type}
          />
        </View>
        <NoteField value={form.note} onChange={form.setNote} />
      </ScrollView>
      <View className="absolute inset-x-0 bottom-0 gap-1 px-4 pb-4 pt-2">
        <GlassButton
          label={t('transactionDetail.save')}
          onPress={() => {
            if (form.save()) {
              onSaved();
            }
          }}
        />
        <Pressable onPress={onDelete} className="items-center py-3 active:opacity-70">
          <Text className="text-base font-medium text-[#FF3B30]">{t('transactionDetail.delete')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function EditTransferForm({ transaction, onSaved, onDelete }: EditFormProps<TransferTransaction>) {
  const { t } = useTranslation();
  const form = useEditTransferForm(transaction);

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-40" keyboardShouldPersistTaps="handled">
        <TransferForm form={form} />
      </ScrollView>
      <View className="absolute inset-x-0 bottom-0 gap-1 px-4 pb-4 pt-2">
        <GlassButton
          label={t('transactionDetail.save')}
          onPress={() => {
            if (form.commit()) {
              onSaved();
            }
          }}
        />
        <Pressable onPress={onDelete} className="items-center py-3 active:opacity-70">
          <Text className="text-base font-medium text-[#FF3B30]">{t('transactionDetail.delete')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function TransactionDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const transaction = id ? getTransaction(id) : undefined;

  // The transaction can disappear mid-session (e.g. deleted from another screen); bail out of the modal.
  useEffect(() => {
    if (!transaction) {
      router.back();
    }
  }, [transaction]);

  if (!transaction) {
    return null;
  }

  const currentTransaction = transaction;

  function handleDelete() {
    void deleteTransaction(currentTransaction.id);
    router.back();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader title={t(`transactionType.${transaction.type}`)} onClose={() => router.back()} />
      {transaction.type === 'transfer' ? (
        <EditTransferForm transaction={transaction} onSaved={() => router.back()} onDelete={handleDelete} />
      ) : (
        <EditAmountTransactionForm transaction={transaction} onSaved={() => router.back()} onDelete={handleDelete} />
      )}
    </SafeAreaView>
  );
}
