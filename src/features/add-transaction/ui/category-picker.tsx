import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useCategories, type Category, type CategoryKind } from '@/entities/category';
import { systemColors } from '@/shared/lib/system-colors';

import { CategoryTile } from './category-tile';

const tileWidthClassName = 'w-20';

interface CategoryPickerProps {
  kind: CategoryKind;
  // Whichever ranking is currently most useful — frequent-by-usage by default, or
  // note-text-relevant once the user has typed something (see AmountTransactionForm).
  rankedCategories: Category[];
  selectedCategoryId?: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryPicker({ kind, rankedCategories, selectedCategoryId, onSelect }: CategoryPickerProps) {
  const { t } = useTranslation();
  const allCategories = useCategories(kind);
  const hasMore = allCategories.length > rankedCategories.length;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="flex-row gap-2 px-4">
      {rankedCategories.map((category) => (
        <CategoryTile
          key={category.id}
          category={category}
          selected={category.id === selectedCategoryId}
          onPress={() => onSelect(category.id)}
          widthClassName={tileWidthClassName}
        />
      ))}
      {hasMore ? (
        <Pressable
          onPress={() => router.push({ pathname: '/pick-category', params: { kind } })}
          className={`${tileWidthClassName} items-center gap-1.5 rounded-2xl py-3 active:opacity-70`}
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Ionicons name="ellipsis-horizontal" size={22} color={systemColors.gray} />
          </View>
          <Text numberOfLines={1} className="text-xs text-neutral-700 dark:text-neutral-300">
            {t('addTransaction.categoriesAll')}
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
