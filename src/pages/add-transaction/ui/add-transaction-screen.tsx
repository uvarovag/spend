import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearPickedAccount, useAccount, usePickedAccount } from '@/entities/account';
import type { TransactionType } from '@/entities/transaction';
import {
  AccountDateSection,
  AmountInput,
  CategoryPicker,
  NoteField,
  clearPickedCategoryId,
  useFrequentCategories,
  usePickedCategoryId,
  useTransactionForm,
} from '@/features/add-transaction';
import { TransferForm, useTransferForm } from '@/features/transfer';
import { GlassButton } from '@/shared/ui/glass-button';
import { ModalHeader } from '@/shared/ui/modal-header';
import { NumericKeypad } from '@/shared/ui/numeric-keypad';

type AmountTransactionKind = Extract<TransactionType, 'expense' | 'income'>;

interface AmountTransactionFormProps {
  kind: AmountTransactionKind;
  form: ReturnType<typeof useTransactionForm>;
  onSubmit: () => void;
  canSubmit: boolean;
}

function AmountTransactionForm({ kind, form, onSubmit, canSubmit }: AmountTransactionFormProps) {
  const { t, i18n } = useTranslation();
  const frequentCategories = useFrequentCategories(kind);
  const account = useAccount(form.accountId);
  const pickedCategoryId = usePickedCategoryId();
  const pickedAccount = usePickedAccount();

  // Reacts only to a new pick from the categories screen, not to every re-render.
  useEffect(() => {
    if (pickedCategoryId) {
      clearPickedCategoryId();
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

  return (
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <ScrollView className="flex-1" contentContainerClassName="pb-40" keyboardShouldPersistTaps="handled">
        <AmountInput expression={form.amountExpression} currency={account?.currency ?? ''} locale={i18n.language} />
        <NumericKeypad onKeyPress={form.pressKey} />
        <NoteField value={form.note} onChange={form.setNote} />
        <View className="pt-4">
          <CategoryPicker
            kind={kind}
            frequentCategories={frequentCategories}
            selectedCategoryId={form.categoryId}
            onSelect={form.setCategoryId}
          />
        </View>
        <View className="pt-4">
          <AccountDateSection
            accounts={form.accounts}
            accountId={form.accountId}
            date={form.date}
            onDateChange={form.setDate}
            locale={i18n.language}
            kind={kind}
          />
        </View>
      </ScrollView>
      <View className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-2">
        <GlassButton label={t('common.done')} onPress={onSubmit} disabled={!canSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}

export function AddTransactionScreen() {
  const { t } = useTranslation();
  const { type: paramType } = useLocalSearchParams<{ type?: TransactionType }>();
  const type: TransactionType = paramType ?? 'expense';
  const amountKind: AmountTransactionKind = type === 'transfer' ? 'expense' : type;
  const form = useTransactionForm(amountKind);
  const transferForm = useTransferForm();

  const canSubmit = type === 'transfer' ? transferForm.canSubmit : form.canSubmit;

  function handleSubmit() {
    const committed = type === 'transfer' ? transferForm.commit() : form.commit();
    if (committed) {
      router.back();
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader title={t(`transactionType.${type}`)} onClose={() => router.back()} />

      {type === 'transfer' ? (
        <KeyboardAvoidingView className="flex-1" behavior="padding">
          <ScrollView className="flex-1" contentContainerClassName="pb-40" keyboardShouldPersistTaps="handled">
            <TransferForm form={transferForm} />
          </ScrollView>
          <View className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-2">
            <GlassButton label={t('common.done')} onPress={handleSubmit} disabled={!canSubmit} />
          </View>
        </KeyboardAvoidingView>
      ) : (
        <AmountTransactionForm kind={type} form={form} onSubmit={handleSubmit} canSubmit={canSubmit} />
      )}
    </SafeAreaView>
  );
}
