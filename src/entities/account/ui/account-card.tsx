import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { formatCurrency } from '@/shared/lib/format-currency';
import { systemColors } from '@/shared/lib/system-colors';

import { accountTypeIcons } from '../lib/account-type-icons';
import type { Account } from '../model/types';

interface AccountCardProps {
  caption: string;
  account: Account | undefined;
  balance: number;
  locale: string;
  onPress: () => void;
}

export function AccountCard({ caption, account, balance, locale, onPress }: AccountCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl bg-neutral-100 px-4 py-3 active:opacity-70 dark:bg-neutral-900"
    >
      {account && (
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: account.color }}
        >
          <Ionicons name={accountTypeIcons[account.type] as never} size={18} color={systemColors.white} />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {account?.name ?? ''}
        </Text>
        <Text className="text-xs text-neutral-400 dark:text-neutral-500" numberOfLines={1}>
          {caption}
        </Text>
      </View>
      {account && (
        <Text className="text-sm text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
          {formatCurrency(balance, account.currency, locale)}
        </Text>
      )}
      <Ionicons name="chevron-forward" size={16} color={systemColors.gray} />
    </Pressable>
  );
}
