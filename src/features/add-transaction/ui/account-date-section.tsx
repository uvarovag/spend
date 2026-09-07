import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AccountCard, type Account } from '@/entities/account';
import { useAccountBalance } from '@/entities/transaction';
import { DateCard } from '@/shared/ui/date-card';

interface AccountDateSectionProps {
  accounts: Account[];
  accountId: string | undefined;
  date: Date;
  onDateChange: (date: Date) => void;
  locale: string;
  kind: 'expense' | 'income';
}

export function AccountDateSection({ accounts, accountId, date, onDateChange, locale, kind }: AccountDateSectionProps) {
  const { t } = useTranslation();
  const selectedAccount = accounts.find((account) => account.id === accountId);
  const balance = useAccountBalance(selectedAccount);

  function openAccountPicker() {
    router.push({
      pathname: '/pick-account',
      params: {
        requestId: 'account',
        title: t('settings.accounts'),
        selectedAccountId: accountId,
        allowedAccountIds: accounts.map((account) => account.id).join(','),
        role: kind === 'expense' ? 'debit' : 'credit',
      },
    });
  }

  return (
    <View className="gap-4 px-4">
      <AccountCard
        caption={t('addTransaction.account')}
        account={selectedAccount}
        balance={balance}
        locale={locale}
        onPress={openAccountPicker}
      />
      <DateCard date={date} onDateChange={onDateChange} locale={locale} />
    </View>
  );
}
