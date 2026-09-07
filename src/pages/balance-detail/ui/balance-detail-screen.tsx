import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatCurrency } from '@/shared/lib/format-currency';
import { AccountListRow } from '@/widgets/account-list-row';

import { useBalanceDetail } from '../model/use-balance-detail';

export function BalanceDetailScreen() {
  const { t, i18n } = useTranslation();
  const groups = useBalanceDetail();

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-black">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: t('balanceDetail.title'),
        }}
      />
      <ScrollView contentContainerClassName="pb-6" contentInsetAdjustmentBehavior="automatic">
        {groups.map((group) => (
          <View key={group.currency} className="pt-4">
            <View className="flex-row items-baseline justify-between px-4 pb-1">
              <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{group.currency}</Text>
              <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {formatCurrency(group.total, group.currency, i18n.language)}
              </Text>
            </View>
            <View>
              {group.accounts.map((account) => (
                <AccountListRow key={account.id} account={account} locale={i18n.language} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
