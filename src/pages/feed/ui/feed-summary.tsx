import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { formatCurrency } from '@/shared/lib/format-currency';
import { systemColors } from '@/shared/lib/system-colors';

import type { CurrencyTotal } from '../model/use-feed-items';

interface FeedSummaryProps {
  totals: CurrencyTotal[];
  locale: string;
}

export function FeedSummary({ totals, locale }: FeedSummaryProps) {
  if (totals.length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap gap-2 px-4 pb-3">
      {totals.map((total) => {
        const isPositive = total.amount >= 0;
        return (
          <View
            key={total.currency}
            className="flex-row items-center gap-2 rounded-2xl bg-neutral-100 px-3 py-2 dark:bg-neutral-900"
          >
            <View
              className={`h-6 w-6 items-center justify-center rounded-full ${
                isPositive ? 'bg-[#34C759]' : 'bg-[#FF3B30]'
              }`}
            >
              <Ionicons name={isPositive ? 'trending-up' : 'trending-down'} size={12} color={systemColors.white} />
            </View>
            <Text
              className={`text-base font-semibold ${isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}
              numberOfLines={1}
            >
              {formatCurrency(total.amount, total.currency, locale)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
