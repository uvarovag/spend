import { Text, View } from 'react-native';

import { currencySymbol } from '@/shared/lib/format-currency';

interface AmountInputProps {
  expression: string;
  currency: string;
  locale: string;
}

export function AmountInput({ expression, currency, locale }: AmountInputProps) {
  return (
    <View className="items-center justify-center py-6">
      <Text className="text-5xl font-semibold text-neutral-900 dark:text-neutral-50">
        {currencySymbol(currency, locale)}
        {expression.length > 0 ? expression : '0'}
      </Text>
    </View>
  );
}
