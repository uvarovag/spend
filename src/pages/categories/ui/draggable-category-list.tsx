import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { Category } from '@/entities/category';
import { systemColors } from '@/shared/lib/system-colors';

const rowHeight = 64;

interface DraggableCategoryListProps {
  categories: Category[];
  onPressCategory: (categoryId: string) => void;
  onReorder: (orderedCategoryIds: string[]) => void;
}

export function DraggableCategoryList({ categories, onPressCategory, onReorder }: DraggableCategoryListProps) {
  const order = useSharedValue<string[]>(categories.map((category) => category.id));
  const categoryIdsKey = categories.map((category) => category.id).join(',');

  // Resyncs the drag order only when the set of categories itself changes
  // (add/remove elsewhere), not on every render.
  useEffect(() => {
    order.value = categoryIdsKey.length > 0 ? categoryIdsKey.split(',') : [];
  }, [categoryIdsKey]);

  return (
    <View style={{ height: categories.length * rowHeight }}>
      {categories.map((category, index) => (
        <DraggableRow
          key={category.id}
          category={category}
          initialIndex={index}
          order={order}
          itemsCount={categories.length}
          onPress={() => onPressCategory(category.id)}
          onReorder={onReorder}
        />
      ))}
    </View>
  );
}

interface DraggableRowProps {
  category: Category;
  initialIndex: number;
  order: SharedValue<string[]>;
  itemsCount: number;
  onPress: () => void;
  onReorder: (orderedCategoryIds: string[]) => void;
}

function DraggableRow({ category, initialIndex, order, itemsCount, onPress, onReorder }: DraggableRowProps) {
  const translateY = useSharedValue(initialIndex * rowHeight);
  const isDragging = useSharedValue(false);
  const startTranslateY = useSharedValue(0);

  useAnimatedReaction(
    () => order.value.indexOf(category.id),
    (index, previousIndex) => {
      if (!isDragging.value && index !== previousIndex) {
        translateY.value = withSpring(index * rowHeight);
      }
    }
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      startTranslateY.value = order.value.indexOf(category.id) * rowHeight;
    })
    .onUpdate((event) => {
      translateY.value = startTranslateY.value + event.translationY;
      const currentIndex = order.value.indexOf(category.id);
      const targetIndex = Math.min(itemsCount - 1, Math.max(0, Math.round(translateY.value / rowHeight)));
      if (targetIndex !== currentIndex) {
        const nextOrder = [...order.value];
        nextOrder.splice(currentIndex, 1);
        nextOrder.splice(targetIndex, 0, category.id);
        order.value = nextOrder;
      }
    })
    .onEnd(() => {
      isDragging.value = false;
      translateY.value = withSpring(order.value.indexOf(category.id) * rowHeight);
      scheduleOnRN(onReorder, order.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: rowHeight,
    transform: [{ translateY: translateY.value }],
    zIndex: isDragging.value ? 1 : 0,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="flex-row items-center gap-3 border-b border-neutral-100 bg-white px-4 dark:border-neutral-900 dark:bg-black"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: category.color }}
      >
        <Ionicons name={category.icon as never} size={18} color={systemColors.white} />
      </View>
      <Pressable onPress={onPress} className="flex-1 py-2">
        <Text className="text-base text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {category.name}
        </Text>
      </Pressable>
      <GestureDetector gesture={panGesture}>
        <View className="h-11 w-11 items-center justify-center">
          <Ionicons name="reorder-three-outline" size={22} color={systemColors.gray} />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}
