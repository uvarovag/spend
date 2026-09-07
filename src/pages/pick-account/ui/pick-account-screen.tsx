import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickAccount, useAccounts } from '@/entities/account';
import { rankAccountsByRoleFrequency, useTransactions, type AccountRole } from '@/entities/transaction';
import { systemColors } from '@/shared/lib/system-colors';
import { ModalHeader } from '@/shared/ui/modal-header';
import { AccountListRow } from '@/widgets/account-list-row';

export function PickAccountScreen() {
  const { t, i18n } = useTranslation();
  const { requestId, title, selectedAccountId, excludeAccountId, allowedAccountIds, role } = useLocalSearchParams<{
    requestId: string;
    title: string;
    selectedAccountId?: string;
    excludeAccountId?: string;
    allowedAccountIds?: string;
    role?: AccountRole;
  }>();
  const allowedAccountIdSet = allowedAccountIds ? new Set(allowedAccountIds.split(',')) : undefined;
  const filteredAccounts = useAccounts().filter(
    (account) => account.id !== excludeAccountId && (!allowedAccountIdSet || allowedAccountIdSet.has(account.id))
  );
  const transactions = useTransactions();
  const accounts = role ? rankAccountsByRoleFrequency(filteredAccounts, transactions, role) : filteredAccounts;

  function handleSelect(accountId: string) {
    pickAccount(requestId, accountId);
    router.back();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader title={title} onClose={() => router.back()} closeLabel={t('common.back')} />
      <ScrollView contentContainerClassName="pb-6 pt-2">
        {accounts.map((account) => (
          <AccountListRow
            key={account.id}
            account={account}
            locale={i18n.language}
            onPress={() => handleSelect(account.id)}
            trailing={
              account.id === selectedAccountId ? (
                <Ionicons name="checkmark" size={20} color={systemColors.blue} />
              ) : undefined
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
