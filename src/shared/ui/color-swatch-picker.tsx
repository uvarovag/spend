import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { systemColors } from '@/shared/lib/system-colors';

interface ColorSwatchPickerProps {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}

export function ColorSwatchPicker({ colors, value, onChange }: ColorSwatchPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {colors.map((color) => (
        <Pressable
          key={color}
          onPress={() => onChange(color)}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: color }}
        >
          {color === value && <Ionicons name="checkmark" size={18} color={systemColors.white} />}
        </Pressable>
      ))}
    </View>
  );
}
