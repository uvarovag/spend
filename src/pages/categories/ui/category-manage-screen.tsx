import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { reorderCategories, useCategories, type CategoryKind } from '@/entities/category';
import { systemColors } from '@/shared/lib/system-colors';
import { SegmentedSwitcher } from '@/shared/ui/segmented-switcher';

import { DraggableCategoryList } from './draggable-category-list';

const kinds: CategoryKind[] = ['expense', 'income'];

export function CategoryManageScreen() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<CategoryKind>('expense');
  const categories = useCategories(kind);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-black">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: t('settings.categories'),
          headerRight: ({ tintColor }) => (
            <Pressable onPress={() => router.push({ pathname: '/category-form', params: { kind } })} hitSlop={8}>
              <Ionicons name="add" size={24} color={tintColor ?? systemColors.blue} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerClassName="pb-24"
        contentInsetAdjustmentBehavior="automatic"
        stickyHeaderIndices={[0]}
      >
        <View className="bg-white px-4 pb-2 pt-2 dark:bg-black">
          <SegmentedSwitcher value={kind} onChange={setKind} options={kinds} getLabel={(k) => t(`transactionType.${k}`)} />
        </View>
        <DraggableCategoryList
          categories={categories}
          onPressCategory={(categoryId) => router.push({ pathname: '/category-form', params: { id: categoryId } })}
          onReorder={(orderedCategoryIds) => void reorderCategories(kind, orderedCategoryIds)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
