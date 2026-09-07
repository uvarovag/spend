import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCategory, type CategoryKind } from '@/entities/category';
import { CategoryFormFields } from '@/features/category-form';
import { ModalHeader } from '@/shared/ui/modal-header';

export function CategoryFormScreen() {
  const { t } = useTranslation();
  const { id, kind: kindParam } = useLocalSearchParams<{ id?: string; kind?: CategoryKind }>();
  const existingCategory = id ? getCategory(id) : undefined;
  const kind = existingCategory?.kind ?? kindParam ?? 'expense';

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader
        title={existingCategory ? t('categories.editTitle') : t('categories.newTitle')}
        onClose={() => router.back()}
      />
      <CategoryFormFields
        existingCategory={existingCategory}
        kind={kind}
        onSaved={() => router.back()}
        onArchived={() => router.back()}
      />
    </SafeAreaView>
  );
}
