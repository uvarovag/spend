import { Pressable, Text } from 'react-native';

import { GlassSurface } from './glass-surface';

interface GlassButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

const tintColor = 'rgba(0, 122, 255, 0.92)'; // systemColors.blue (#007AFF) at high opacity

export function GlassButton({ label, onPress, disabled }: GlassButtonProps) {
  return (
    <GlassSurface
      tintColor={tintColor}
      isInteractive={!disabled}
      style={{ width: '100%', borderRadius: 28, overflow: 'hidden', opacity: disabled ? 0.4 : 1 }}
    >
      <Pressable onPress={onPress} disabled={disabled} className="items-center justify-center py-4">
        <Text className="text-lg font-semibold text-white">{label}</Text>
      </Pressable>
    </GlassSurface>
  );
}
