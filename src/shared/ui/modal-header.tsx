import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ModalHeaderProps {
  title?: string;
  onClose: () => void;
  closeLabel?: string;
  rightAction?: ReactNode;
}

export function ModalHeader({ title, onClose, closeLabel, rightAction }: ModalHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between px-4 pb-6 pt-6">
      <View className="w-20 items-start">
        <Pressable onPress={onClose} hitSlop={8}>
          <Text numberOfLines={1} className="text-base text-[#007AFF]">
            {closeLabel ?? t('common.close')}
          </Text>
        </Pressable>
      </View>
      <Text
        numberOfLines={1}
        className="flex-1 text-center text-base font-semibold text-neutral-900 dark:text-neutral-50"
      >
        {title}
      </Text>
      <View className="w-20 items-end">{rightAction}</View>
    </View>
  );
}
