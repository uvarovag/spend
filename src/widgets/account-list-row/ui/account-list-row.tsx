import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { accountTypeIcons, type Account } from '@/entities/account';
import { useAccountBalance } from '@/entities/transaction';
import { formatCurrency } from '@/shared/lib/format-currency';
import { systemColors } from '@/shared/lib/system-colors';

interface AccountListRowProps {
  account: Account;
  locale: string;
  onPress?: () => void;
  trailing?: ReactNode;
}

export function AccountListRow({ account, locale, onPress, trailing }: AccountListRowProps) {
  const { t } = useTranslation();
  const balance = useAccountBalance(account);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 border-b border-neutral-100 px-4 py-3 active:opacity-70 dark:border-neutral-900"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: account.color }}
      >
        <Ionicons name={accountTypeIcons[account.type] as never} size={18} color={systemColors.white} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {account.name}
        </Text>
        <Text className="text-xs text-neutral-400 dark:text-neutral-500" numberOfLines={1}>
          {t(`accounts.type.${account.type}`)}
        </Text>
      </View>
      <Text className="text-base text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
        {formatCurrency(balance, account.currency, locale)}
      </Text>
      {trailing}
    </Pressable>
  );
}
