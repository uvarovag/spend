import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { archiveCategory, createCategory, updateCategory, type Category, type CategoryKind } from '@/entities/category';
import { colorPresets } from '@/shared/lib/color-presets';
import { systemColors } from '@/shared/lib/system-colors';
import { ColorSwatchPicker } from '@/shared/ui/color-swatch-picker';
import { GlassButton } from '@/shared/ui/glass-button';

import { categoryIconPresets } from '../model/category-presets';

interface CategoryFormFieldsProps {
  existingCategory?: Category;
  // Only used to create a new category — an existing one keeps its own kind (data-constraints.md:
  // kind can't change after creation).
  kind: CategoryKind;
  onSaved: () => void;
  onArchived?: () => void;
}

// The actual body of the category create/edit modal (`pages/categories/ui/category-form-screen.tsx`)
// — pulled out so it can also be embedded directly as an onboarding step. See
// `features/account-form/ui/account-form-fields.tsx` for the same pattern and its rationale.
export function CategoryFormFields({ existingCategory, kind, onSaved, onArchived }: CategoryFormFieldsProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(existingCategory?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [icon, setIcon] = useState(existingCategory?.icon ?? categoryIconPresets[0]);
  const [color, setColor] = useState(existingCategory?.color ?? colorPresets[0]);

  function handleChangeName(text: string) {
    setName(text);
    setNameError(null);
  }

  function handleSave() {
    if (name.trim().length === 0) {
      setNameError(t('categories.nameRequired'));
      return;
    }
    if (existingCategory) {
      void updateCategory(existingCategory.id, { name: name.trim(), icon, color });
    } else {
      void createCategory({ name: name.trim(), icon, color, kind });
    }
    onSaved();
  }

  function handleArchive() {
    if (existingCategory) {
      void archiveCategory(existingCategory.id);
      onArchived?.();
    }
  }

  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="gap-4 px-4 pb-40 pt-4">
        <View className="items-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
            <Ionicons name={icon as never} size={28} color={systemColors.white} />
          </View>
          <TextInput
            value={name}
            onChangeText={handleChangeName}
            placeholder={t('categories.namePlaceholder')}
            placeholderTextColor={systemColors.gray}
            className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-center text-base text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50"
          />
          {nameError && <Text className="text-xs text-[#FF3B30]">{nameError}</Text>}
        </View>

        <View className="gap-2">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">{t('categories.icon')}</Text>
          <View className="flex-row flex-wrap gap-3">
            {categoryIconPresets.map((iconOption) => (
              <Pressable
                key={iconOption}
                onPress={() => setIcon(iconOption)}
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  iconOption === icon ? '' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
                style={iconOption === icon ? { backgroundColor: color } : undefined}
              >
                <Ionicons
                  name={iconOption as never}
                  size={20}
                  color={iconOption === icon ? systemColors.white : systemColors.gray}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">{t('categories.color')}</Text>
          <ColorSwatchPicker colors={colorPresets} value={color} onChange={setColor} />
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 gap-1 px-4 pb-4 pt-2">
        <GlassButton label={t('categories.save')} onPress={handleSave} />
        {existingCategory && (
          <Pressable onPress={handleArchive} className="items-center py-3 active:opacity-70">
            <Text className="text-base font-medium text-[#FF3B30]">{t('categories.archive')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
