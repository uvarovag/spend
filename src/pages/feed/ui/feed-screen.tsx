import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFeedFilters, useIsFeedFiltersActive } from '@/features/feed-filters';
import { formatSignedCurrency } from '@/shared/lib/format-currency';
import { GlassIconButton } from '@/shared/ui/glass-icon-button';
import { TransactionRow } from '@/widgets/transaction-row';

import { useFeedItems } from '../model/use-feed-items';
import { FeedSummary } from './feed-summary';

export function FeedScreen() {
  const { t, i18n } = useTranslation();
  const filters = useFeedFilters();
  const isFiltersActive = useIsFeedFiltersActive();
  const { items, totals } = useFeedItems(filters);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text className="text-3xl font-bold text-black dark:text-white">{t('tabs.feed')}</Text>
        <GlassIconButton icon="options-outline" active={isFiltersActive} onPress={() => router.push('/feed-filters')} />
      </View>

      <FeedSummary totals={totals} locale={i18n.language} />

      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        getItemType={(item) => item.kind}
        contentContainerStyle={{ paddingBottom: 96 }}
        renderItem={({ item }) =>
          item.kind === 'header' ? (
            <View className="flex-row items-baseline justify-between gap-3 px-4 pb-1 pt-4">
              <Text className="text-xs font-medium uppercase text-neutral-400 dark:text-neutral-500">{item.label}</Text>
              <Text numberOfLines={1} className="shrink text-xs font-medium text-neutral-400 dark:text-neutral-500">
                {item.totals
                  .map((total) => formatSignedCurrency(total.amount, total.currency, i18n.language))
                  .join(' · ')}
              </Text>
            </View>
          ) : (
            <TransactionRow
              transaction={item.transaction}
              locale={i18n.language}
              onPress={() => router.push({ pathname: '/transaction-detail', params: { id: item.transaction.id } })}
            />
          )
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pt-24">
            <Text className="text-center text-base text-neutral-400 dark:text-neutral-500">{t('feed.empty')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
