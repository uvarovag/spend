import { FieldGroup, Host, ListItem, Picker } from '@expo/ui';
import { background, scrollContentBackground } from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { truncateAccountName, useAccounts } from '@/entities/account';
import { useCategories } from '@/entities/category';
import {
  defaultFeedFilters,
  setFeedFilters,
  useFeedFilters,
  type FeedFilter,
  type FeedPeriod,
} from '@/features/feed-filters';
import { groupedBackgroundColor, systemColors } from '@/shared/lib/system-colors';
import { useColorScheme } from '@/shared/lib/use-color-scheme';
import { GlassButton } from '@/shared/ui/glass-button';
import { IconBadge } from '@/shared/ui/icon-badge';
import { ModalHeader } from '@/shared/ui/modal-header';

const feedTypeFilters: FeedFilter[] = ['all', 'expense', 'income', 'transfer'];
const feedPeriods: FeedPeriod[] = ['today', 'week', 'month', 'quarter', 'year', 'all'];
const periodLabelKeys: Record<FeedPeriod, string> = {
  today: 'periodToday',
  week: 'periodWeek',
  month: 'periodMonth',
  quarter: 'periodQuarter',
  year: 'periodYear',
  all: 'periodAll',
};
const allOptionValue = 'all';

function TrailingPickerHost({ children }: { children: ReactNode }) {
  return <Host style={{ height: 32, width: 150 }}>{children}</Host>;
}

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterPickerRowProps<T extends string> {
  icon: string;
  iconColor: string;
  label: string;
  selectedValue: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
}

function FilterPickerRow<T extends string>({
  icon,
  iconColor,
  label,
  selectedValue,
  options,
  onChange,
}: FilterPickerRowProps<T>) {
  return (
    <ListItem
      leading={<IconBadge name={icon as never} backgroundColor={iconColor} />}
      trailing={
        <TrailingPickerHost>
          <Picker appearance="menu" selectedValue={selectedValue} onValueChange={(selection) => onChange(selection as T)}>
            {options.map((option) => (
              <Picker.Item key={option.value} value={option.value} label={option.label} />
            ))}
          </Picker>
        </TrailingPickerHost>
      }
    >
      {label}
    </ListItem>
  );
}

export function FeedFiltersScreen() {
  const { t } = useTranslation();
  const filters = useFeedFilters();
  const accounts = useAccounts();
  const expenseCategories = useCategories('expense');
  const incomeCategories = useCategories('income');
  const categories = [...expenseCategories, ...incomeCategories];
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? groupedBackgroundColor.dark : groupedBackgroundColor.light;
  const fieldGroupModifiers = [scrollContentBackground('hidden' as const), background(backgroundColor)];

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#F2F2F7] dark:bg-black">
      <ModalHeader title={t('feed.filtersTitle')} onClose={() => router.back()} />

      <View className="flex-1">
        <Host style={{ flex: 1 }} useViewportSizeMeasurement>
          <FieldGroup modifiers={fieldGroupModifiers}>
            <FieldGroup.Section>
              <FilterPickerRow
                icon="swap-vertical-outline"
                iconColor={systemColors.blue}
                label={t('feed.filterType')}
                selectedValue={filters.type}
                options={feedTypeFilters.map((feedFilter) => ({
                  value: feedFilter,
                  label: feedFilter === 'all' ? t('feed.filterAll') : t(`transactionType.${feedFilter}`),
                }))}
                onChange={(selection) => setFeedFilters((current) => ({ ...current, type: selection }))}
              />

              <FilterPickerRow
                icon="pricetags-outline"
                iconColor={systemColors.orange}
                label={t('feed.filterCategory')}
                selectedValue={filters.categoryId ?? allOptionValue}
                options={[
                  { value: allOptionValue, label: t('feed.filterAll') },
                  ...categories.map((category) => ({ value: category.id, label: category.name })),
                ]}
                onChange={(selection) =>
                  setFeedFilters((current) => ({
                    ...current,
                    categoryId: selection === allOptionValue ? null : selection,
                  }))
                }
              />

              <FilterPickerRow
                icon="wallet-outline"
                iconColor={systemColors.green}
                label={t('feed.filterAccount')}
                selectedValue={filters.accountId ?? allOptionValue}
                options={[
                  { value: allOptionValue, label: t('feed.filterAll') },
                  ...accounts.map((account) => ({ value: account.id, label: truncateAccountName(account.name) })),
                ]}
                onChange={(selection) =>
                  setFeedFilters((current) => ({
                    ...current,
                    accountId: selection === allOptionValue ? null : selection,
                  }))
                }
              />

              <FilterPickerRow
                icon="calendar-outline"
                iconColor={systemColors.indigo}
                label={t('feed.filterPeriod')}
                selectedValue={filters.period}
                options={feedPeriods.map((period) => ({ value: period, label: t(`feed.${periodLabelKeys[period]}`) }))}
                onChange={(selection) => setFeedFilters((current) => ({ ...current, period: selection }))}
              />
            </FieldGroup.Section>
          </FieldGroup>
        </Host>

        <View className="absolute inset-x-0 bottom-0 gap-1 bg-[#F2F2F7] px-4 pb-4 pt-2 dark:bg-black">
          <GlassButton label={t('common.done')} onPress={() => router.back()} />
          <Pressable
            onPress={() => setFeedFilters(defaultFeedFilters)}
            className="items-center py-3 active:opacity-70"
          >
            <Text className="text-base font-medium text-neutral-500 dark:text-neutral-400">
              {t('feed.resetFilters')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
