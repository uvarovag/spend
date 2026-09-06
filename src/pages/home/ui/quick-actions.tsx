import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { TransactionType } from '@/entities/transaction';
import { systemColors } from '@/shared/lib/system-colors';

interface QuickAction {
  type: TransactionType;
  icon: keyof typeof Ionicons.glyphMap;
  colorClassName: string;
}

const quickActions: QuickAction[] = [
  { type: 'expense', icon: 'arrow-up', colorClassName: 'bg-[#FF3B30]' },
  { type: 'income', icon: 'arrow-down', colorClassName: 'bg-[#34C759]' },
  { type: 'transfer', icon: 'swap-horizontal', colorClassName: 'bg-[#007AFF]' },
];

export function QuickActions() {
  const { t } = useTranslation();

  return (
    <View className="flex-row justify-between">
      {quickActions.map((action) => (
        <Pressable
          key={action.type}
          onPress={() => router.push({ pathname: '/add-transaction', params: { type: action.type } })}
          className="flex-1 items-center gap-1.5 active:opacity-70"
        >
          <View className={`h-12 w-12 items-center justify-center rounded-full ${action.colorClassName}`}>
            <Ionicons name={action.icon} size={20} color={systemColors.white} />
          </View>
          <Text className="text-xs text-neutral-600 dark:text-neutral-300">
            {t(`transactionType.${action.type}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
