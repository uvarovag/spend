import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { archiveCategory, createCategory, getCategory, updateCategory, type CategoryKind } from '@/entities/category';
import { colorPresets } from '@/shared/lib/color-presets';
import { systemColors } from '@/shared/lib/system-colors';
import { ColorSwatchPicker } from '@/shared/ui/color-swatch-picker';
import { GlassButton } from '@/shared/ui/glass-button';
import { ModalHeader } from '@/shared/ui/modal-header';

import { categoryIconPresets } from '../model/category-presets';

export function CategoryFormScreen() {
  const { t } = useTranslation();
  const { id, kind: kindParam } = useLocalSearchParams<{ id?: string; kind?: CategoryKind }>();
  const existingCategory = id ? getCategory(id) : undefined;
  const kind = existingCategory?.kind ?? kindParam ?? 'expense';

  const [name, setName] = useState(existingCategory?.name ?? '');
  const [icon, setIcon] = useState(existingCategory?.icon ?? categoryIconPresets[0]);
  const [color, setColor] = useState(existingCategory?.color ?? colorPresets[0]);

  function handleSave() {
    if (name.trim().length === 0) {
      return;
    }
    if (existingCategory) {
      updateCategory(existingCategory.id, { name: name.trim(), icon, color });
    } else {
      createCategory({ name: name.trim(), icon, color, kind });
    }
    router.back();
  }

  function handleArchive() {
    if (existingCategory) {
      archiveCategory(existingCategory.id);
      router.back();
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader
        title={existingCategory ? t('categories.editTitle') : t('categories.newTitle')}
        onClose={() => router.back()}
      />
      <View className="flex-1">
        <ScrollView contentContainerClassName="gap-4 px-4 pb-40 pt-4">
          <View className="items-center gap-3">
            <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
              <Ionicons name={icon as never} size={28} color={systemColors.white} />
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('categories.namePlaceholder')}
              placeholderTextColor={systemColors.gray}
              className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-center text-base text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50"
            />
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
    </SafeAreaView>
  );
}
