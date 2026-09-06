import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';

import { AccountCard, clearPickedAccount, usePickedAccount } from '@/entities/account';
import { useAccountBalance } from '@/entities/transaction';
import { currencySymbol, formatNumber } from '@/shared/lib/format-currency';
import { systemColors } from '@/shared/lib/system-colors';
import { CompactDatePicker } from '@/shared/ui/compact-date-picker';
import { GlassIconButton } from '@/shared/ui/glass-icon-button';

import type { TransferFormState } from '../model/use-transfer-form';

type TransferAccountField = 'from' | 'to';

interface AmountFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

function AmountField({ label, value, onChangeText }: AmountFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">{label}</Text>
      <TextInput
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
        placeholder="0"
        placeholderTextColor={systemColors.gray}
        className="rounded-xl bg-neutral-100 px-4 py-2.5 text-lg text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50"
      />
    </View>
  );
}

interface TransferFormProps {
  form: TransferFormState;
}

export function TransferForm({ form }: TransferFormProps) {
  const { t, i18n } = useTranslation();
  const pickedAccount = usePickedAccount();
  const fromBalance = useAccountBalance(form.fromAccount);
  const toBalance = useAccountBalance(form.toAccount);

  // Reacts only to a new pick from the account-list screen, not to every re-render.
  useEffect(() => {
    if (pickedAccount && (pickedAccount.requestId === 'from' || pickedAccount.requestId === 'to')) {
      clearPickedAccount();
      if (pickedAccount.requestId === 'from') {
        form.setFromAccountId(pickedAccount.accountId);
      } else {
        form.setToAccountId(pickedAccount.accountId);
      }
    }
  }, [pickedAccount]);

  function openAccountPicker(
    field: TransferAccountField,
    selectedAccountId: string | undefined,
    excludeAccountId: string | undefined
  ) {
    router.push({
      pathname: '/pick-account',
      params: {
        requestId: field,
        title: t(field === 'from' ? 'transfer.from' : 'transfer.to'),
        selectedAccountId,
        excludeAccountId,
        role: field === 'from' ? 'debit' : 'credit',
      },
    });
  }

  function getRateLabel(): string | undefined {
    if (form.sameCurrency || form.rate === undefined || !form.fromAccount || !form.toAccount) {
      return undefined;
    }
    // Whichever side has the smaller amount is the "1 unit" side, so the rate reads the same
    // (e.g. 75) regardless of whether the transfer goes USD → RUB or RUB → USD.
    const fromIsBase = form.fromAmount <= form.toAmount;
    const baseCurrency = fromIsBase ? form.fromAccount.currency : form.toAccount.currency;
    const quoteCurrency = fromIsBase ? form.toAccount.currency : form.fromAccount.currency;
    const formattedRate = formatNumber(form.rate, i18n.language);
    return `${t('transfer.rate')}: 1 ${currencySymbol(baseCurrency, i18n.language)} = ${formattedRate} ${currencySymbol(quoteCurrency, i18n.language)}`;
  }

  const rateLabel = getRateLabel();

  return (
    <View className="gap-4 px-4 pt-4">
      <View className="gap-4">
        <AccountCard
          caption={t('transfer.sent')}
          account={form.fromAccount}
          balance={fromBalance}
          locale={i18n.language}
          onPress={() => openAccountPicker('from', form.fromAccountId, form.toAccountId)}
        />
        <View className="items-center">
          <GlassIconButton icon="swap-vertical" onPress={form.swapAccounts} />
        </View>
        <AccountCard
          caption={t('transfer.received')}
          account={form.toAccount}
          balance={toBalance}
          locale={i18n.language}
          onPress={() => openAccountPicker('to', form.toAccountId, form.fromAccountId)}
        />
      </View>

      <AmountField label={t('transfer.sent')} value={form.fromAmountText} onChangeText={form.updateFromAmount} />

      {!form.sameCurrency && (
        <AmountField label={t('transfer.received')} value={form.toAmountText} onChangeText={form.setToAmountText} />
      )}

      {rateLabel && <Text className="text-xs text-neutral-400 dark:text-neutral-500">{rateLabel}</Text>}

      <View className="gap-2">
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">{t('transfer.date')}</Text>
        <CompactDatePicker date={form.date} onDateChange={form.setDate} />
      </View>
    </View>
  );
}
