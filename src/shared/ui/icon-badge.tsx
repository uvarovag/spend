import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { systemColors } from '@/shared/lib/system-colors';

interface IconBadgeProps {
  name: ComponentProps<typeof Ionicons>['name'];
  backgroundColor: string;
}

export function IconBadge({ name, backgroundColor }: IconBadgeProps) {
  return (
    <View className="h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor }}>
      <Ionicons name={name} size={16} color={systemColors.white} />
    </View>
  );
}
