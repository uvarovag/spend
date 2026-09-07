import { useState } from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { systemColors } from '@/shared/lib/system-colors';

interface NoteFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteField({ value, onChange }: NoteFieldProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <Pressable
        onPress={() => setExpanded(true)}
        className="mx-4 my-2 rounded-xl bg-neutral-100 px-4 py-3.5 dark:bg-neutral-900"
      >
        <Text
          numberOfLines={2}
          className={
            value.length > 0
              ? 'text-[16px] text-neutral-900 dark:text-neutral-50'
              : 'text-[16px] text-neutral-400 dark:text-neutral-500'
          }
        >
          {value.length > 0 ? value : t('addTransaction.notePlaceholder')}
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="mx-4 my-2 rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-900">
      <Pressable onPress={() => Keyboard.dismiss()} hitSlop={8} className="self-end pb-1">
        <Text className="text-xs font-medium text-[#007AFF]">{t('addTransaction.noteDone')}</Text>
      </Pressable>
      <TextInput
        autoFocus
        multiline
        textAlignVertical="top"
        value={value}
        onChangeText={onChange}
        placeholder={t('addTransaction.notePlaceholder')}
        placeholderTextColor={systemColors.gray}
        onBlur={() => setExpanded(false)}
        className="min-h-[80px] text-[16px] text-neutral-900 dark:text-neutral-50"
      />
    </View>
  );
}
