import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { defaultFeedFilters, setFeedFilters } from '@/features/feed-filters';
import { formatCurrency } from '@/shared/lib/format-currency';
import { systemColors } from '@/shared/lib/system-colors';
import { TransactionRow } from '@/widgets/transaction-row';

import { useCurrencies, useHomeSummary } from '../model/use-home-summary';
import { CategorySpendingDonut } from './category-spending-donut';
import { CurrencySwitcher } from './currency-switcher';
import { QuickActions } from './quick-actions';

function StatCard({
  label,
  value,
  icon,
  iconColorClassName,
  onPress,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColorClassName: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1 gap-2 rounded-2xl bg-neutral-100 p-4 active:opacity-70 dark:bg-neutral-900">
      <View className={`h-7 w-7 items-center justify-center rounded-full ${iconColorClassName}`}>
        <Ionicons name={icon} size={14} color={systemColors.white} />
      </View>
      <Text className="text-xs text-neutral-500 dark:text-neutral-400">{label}</Text>
      <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{value}</Text>
    </Pressable>
  );
}

function goToFilteredFeed(type: 'expense' | 'income') {
  setFeedFilters({ ...defaultFeedFilters, type, period: 'month' });
  router.push('/feed');
}

export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const currencies = useCurrencies();
  const [currency, setCurrency] = useState(currencies[0] ?? '');
  const selectedCurrency = currencies.includes(currency) ? currency : (currencies[0] ?? '');
  const summary = useHomeSummary(selectedCurrency);

  if (currencies.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-neutral-400 dark:text-neutral-500">{t('home.empty')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const monthNet = summary.monthIncome - summary.monthSpent;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-4 pt-4">
        {currencies.length > 1 && (
          <View className="flex-row justify-end">
            <View style={{ width: currencies.length * 44 }}>
              <CurrencySwitcher
                currencies={currencies}
                value={selectedCurrency}
                onChange={setCurrency}
                locale={i18n.language}
              />
            </View>
          </View>
        )}

        <View className="gap-3 rounded-3xl bg-[#007AFF] p-6">
          <Text className="text-sm text-white/70">{t('home.balance')}</Text>
          <Text className="text-4xl font-bold text-white">
            {formatCurrency(summary.totalBalance, selectedCurrency, i18n.language)}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name={monthNet >= 0 ? 'trending-up' : 'trending-down'} size={14} color={systemColors.white} />
            <Text className="text-sm text-white/80">
              {t('home.netThisMonth')}: {monthNet >= 0 ? '+' : ''}
              {formatCurrency(monthNet, selectedCurrency, i18n.language)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <StatCard
            label={t('home.monthSpent')}
            value={formatCurrency(summary.monthSpent, selectedCurrency, i18n.language)}
            icon="arrow-up"
            iconColorClassName="bg-[#FF3B30]"
            onPress={() => goToFilteredFeed('expense')}
          />
          <StatCard
            label={t('home.monthIncome')}
            value={formatCurrency(summary.monthIncome, selectedCurrency, i18n.language)}
            icon="arrow-down"
            iconColorClassName="bg-[#34C759]"
            onPress={() => goToFilteredFeed('income')}
          />
        </View>

        {summary.categorySpendings.length > 0 && (
          <View className="gap-2">
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">{t('home.categoryChartTitle')}</Text>
            <CategorySpendingDonut
              categorySpendings={summary.categorySpendings}
              currency={selectedCurrency}
              locale={i18n.language}
            />
          </View>
        )}

        {summary.recentTransactions.length > 0 && (
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">{t('home.recentTitle')}</Text>
              <Pressable onPress={() => router.push('/feed')} hitSlop={8}>
                <Text className="text-sm font-medium text-[#007AFF]">{t('home.recentAll')}</Text>
              </Pressable>
            </View>
            <View className="overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
              {summary.recentTransactions.map((transaction, index) => (
                <View
                  key={transaction.id}
                  className={index > 0 ? 'border-t border-neutral-200 dark:border-neutral-800' : undefined}
                >
                  <TransactionRow transaction={transaction} locale={i18n.language} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View className="px-4 pb-2 pt-2">
        <QuickActions />
      </View>
    </SafeAreaView>
  );
}
