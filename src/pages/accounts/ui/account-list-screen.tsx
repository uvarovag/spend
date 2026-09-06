import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAccounts } from '@/entities/account';
import { systemColors } from '@/shared/lib/system-colors';
import { AccountListRow } from '@/widgets/account-list-row';

export function AccountListScreen() {
  const { t, i18n } = useTranslation();
  const accounts = useAccounts();

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-black">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: t('settings.accounts'),
          headerRight: ({ tintColor }) => (
            <Pressable onPress={() => router.push('/account-form')} hitSlop={8}>
              <Ionicons name="add" size={24} color={tintColor ?? systemColors.blue} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerClassName="pb-24 pt-2" contentInsetAdjustmentBehavior="automatic">
        {accounts.map((account) => (
          <AccountListRow
            key={account.id}
            account={account}
            locale={i18n.language}
            onPress={() => router.push({ pathname: '/account-form', params: { id: account.id } })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
