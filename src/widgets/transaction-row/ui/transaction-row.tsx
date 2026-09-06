import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { getAccount } from '@/entities/account';
import { getCategory } from '@/entities/category';
import type { Transaction } from '@/entities/transaction';
import { formatCurrency, formatNumber } from '@/shared/lib/format-currency';
import { systemColors } from '@/shared/lib/system-colors';

interface TransactionRowProps {
  transaction: Transaction;
  locale: string;
  onPress?: () => void;
}

export function TransactionRow({ transaction, locale, onPress }: TransactionRowProps) {
  if (transaction.type === 'transfer') {
    const fromAccount = getAccount(transaction.fromAccountId);
    const toAccount = getAccount(transaction.toAccountId);

    return (
      <Pressable onPress={onPress} className="flex-row items-center gap-3 px-4 py-3 active:opacity-70">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <Ionicons name="swap-horizontal-outline" size={20} color={systemColors.gray} />
        </View>
        <View className="flex-1">
          <Text className="text-base text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
            {fromAccount?.name} → {toAccount?.name}
          </Text>
          {transaction.note.length > 0 && (
            <Text className="text-xs text-neutral-400 dark:text-neutral-500" numberOfLines={1}>
              {transaction.note}
            </Text>
          )}
        </View>
        <Text className="text-base text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
          {fromAccount ? formatCurrency(transaction.fromAmount, fromAccount.currency, locale) : ''}
        </Text>
      </Pressable>
    );
  }

  const category = getCategory(transaction.categoryId);
  const account = getAccount(transaction.accountId);
  const isExpense = transaction.type === 'expense';

  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 px-4 py-3 active:opacity-70">
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: category?.color ?? systemColors.gray }}
      >
        <Ionicons name={(category?.icon ?? 'ellipsis-horizontal-outline') as never} size={18} color={systemColors.white} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {category?.name ?? ''}
        </Text>
        <Text className="text-xs text-neutral-400 dark:text-neutral-500" numberOfLines={1}>
          {account?.name}
          {transaction.note.length > 0 ? ` · ${transaction.note}` : ''}
        </Text>
      </View>
      <Text className={isExpense ? 'text-base text-[#FF3B30]' : 'text-base text-[#34C759]'} numberOfLines={1}>
        {isExpense ? '−' : '+'}
        {account ? formatCurrency(transaction.amount, account.currency, locale) : formatNumber(transaction.amount, locale)}
      </Text>
    </Pressable>
  );
}
