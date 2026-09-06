import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickAccount, useAccounts, type Account } from '@/entities/account';
import { useTransactions, type Transaction } from '@/entities/transaction';
import { systemColors } from '@/shared/lib/system-colors';
import { ModalHeader } from '@/shared/ui/modal-header';
import { AccountListRow } from '@/widgets/account-list-row';

type AccountRole = 'debit' | 'credit';

// The account that plays this role most recently is the one the user is most likely to pick
// again — expense/transfer-from count as "debit", income/transfer-to count as "credit".
function getRoleAccountId(transaction: Transaction, role: AccountRole): string | undefined {
  if (role === 'debit') {
    if (transaction.type === 'expense') {
      return transaction.accountId;
    }
    return transaction.type === 'transfer' ? transaction.fromAccountId : undefined;
  }
  if (transaction.type === 'income') {
    return transaction.accountId;
  }
  return transaction.type === 'transfer' ? transaction.toAccountId : undefined;
}

function sortAccountsByRole(accounts: Account[], transactions: Transaction[], role: AccountRole): Account[] {
  const lastUsedDateByAccountId = new Map<string, number>();

  for (const transaction of transactions) {
    const accountId = getRoleAccountId(transaction, role);
    if (!accountId) {
      continue;
    }
    const time = new Date(transaction.date).getTime();
    const previousTime = lastUsedDateByAccountId.get(accountId);
    if (previousTime === undefined || time > previousTime) {
      lastUsedDateByAccountId.set(accountId, time);
    }
  }

  return [...accounts].sort(
    (a, b) => (lastUsedDateByAccountId.get(b.id) ?? -Infinity) - (lastUsedDateByAccountId.get(a.id) ?? -Infinity)
  );
}

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
  const accounts = role ? sortAccountsByRole(filteredAccounts, transactions, role) : filteredAccounts;

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
