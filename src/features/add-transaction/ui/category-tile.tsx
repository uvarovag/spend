import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { Category } from '@/entities/category';
import { systemColors } from '@/shared/lib/system-colors';

interface CategoryTileProps {
  category: Category;
  selected?: boolean;
  onPress: () => void;
  widthClassName?: string;
}

export function CategoryTile({ category, selected, onPress, widthClassName = 'w-[22%]' }: CategoryTileProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`${widthClassName} items-center gap-1.5 rounded-2xl py-3 active:opacity-70 ${
        selected ? 'bg-neutral-100 dark:bg-neutral-800' : ''
      }`}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: category.color }}
      >
        <Ionicons name={category.icon as never} size={22} color={systemColors.white} />
        {selected && (
          <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-[#007AFF]">
            <Ionicons name="checkmark" size={10} color={systemColors.white} />
          </View>
        )}
      </View>
      <Text numberOfLines={1} className="text-xs text-neutral-700 dark:text-neutral-300">
        {category.name}
      </Text>
    </Pressable>
  );
}
