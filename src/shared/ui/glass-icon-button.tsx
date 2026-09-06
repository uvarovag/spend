import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { labelColor, neutralGlassTint } from '@/shared/lib/system-colors';
import { useColorScheme } from '@/shared/lib/use-color-scheme';

import { GlassSurface } from './glass-surface';

interface GlassIconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
  size?: number;
}

export function GlassIconButton({ icon, onPress, active, size = 40 }: GlassIconButtonProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? labelColor.dark : labelColor.light;
  const tintColor = colorScheme === 'dark' ? neutralGlassTint.dark : neutralGlassTint.light;

  return (
    <GlassSurface tintColor={tintColor} style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
      <Pressable
        onPress={onPress}
        style={{ width: size, height: size }}
        className="items-center justify-center active:opacity-70"
      >
        <Ionicons name={icon} size={20} color={iconColor} />
        {active && <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#007AFF]" />}
      </Pressable>
    </GlassSurface>
  );
}
