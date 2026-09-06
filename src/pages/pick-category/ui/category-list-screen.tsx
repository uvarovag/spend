import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCategories, type Category, type CategoryKind } from '@/entities/category';
import { CategoryTile, pickCategoryId } from '@/features/add-transaction';
import { ModalHeader } from '@/shared/ui/modal-header';

// Matches the frequent-categories row's column count so the full grid lines up with it exactly.
const columns = 4;

function chunkIntoRows(categories: Category[]): Category[][] {
  const rows: Category[][] = [];
  for (let index = 0; index < categories.length; index += columns) {
    rows.push(categories.slice(index, index + columns));
  }
  return rows;
}

export function CategoryListScreen() {
  const { t } = useTranslation();
  const { kind } = useLocalSearchParams<{ kind: CategoryKind }>();
  const categories = useCategories(kind);
  const rows = chunkIntoRows(categories);

  function handleSelect(categoryId: string) {
    pickCategoryId(categoryId);
    router.back();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader
        title={t('addTransaction.categoriesTitle')}
        onClose={() => router.back()}
        closeLabel={t('common.back')}
      />
      <ScrollView contentContainerClassName="gap-3 px-4 pt-4">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-2">
            {row.map((category) => (
              <CategoryTile
                key={category.id}
                category={category}
                onPress={() => handleSelect(category.id)}
                widthClassName="flex-1"
              />
            ))}
            {Array.from({ length: columns - row.length }).map((_, spacerIndex) => (
              <View key={spacerIndex} className="flex-1" />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
