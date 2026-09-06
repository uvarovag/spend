import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useCategories, type Category, type CategoryKind } from '@/entities/category';
import { systemColors } from '@/shared/lib/system-colors';

import { CategoryTile } from './category-tile';

const rowSize = 4;

interface CategoryPickerProps {
  kind: CategoryKind;
  frequentCategories: Category[];
  selectedCategoryId?: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryPicker({ kind, frequentCategories, selectedCategoryId, onSelect }: CategoryPickerProps) {
  const { t } = useTranslation();
  const allCategories = useCategories(kind);
  const hasMore = allCategories.length > frequentCategories.length || frequentCategories.length > rowSize;
  const visibleCategories = frequentCategories.slice(0, hasMore ? rowSize - 1 : rowSize);

  return (
    <View className="flex-row gap-2 px-4">
      {visibleCategories.map((category) => (
        <CategoryTile
          key={category.id}
          category={category}
          selected={category.id === selectedCategoryId}
          onPress={() => onSelect(category.id)}
          widthClassName="flex-1"
        />
      ))}
      {hasMore ? (
        <Pressable
          onPress={() => router.push({ pathname: '/pick-category', params: { kind } })}
          className="flex-1 items-center gap-1.5 rounded-2xl py-3 active:opacity-70"
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Ionicons name="ellipsis-horizontal" size={22} color={systemColors.gray} />
          </View>
          <Text numberOfLines={1} className="text-xs text-neutral-700 dark:text-neutral-300">
            {t('addTransaction.categoriesMore')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
