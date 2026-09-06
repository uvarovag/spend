import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { useColorScheme } from '@/shared/lib/use-color-scheme';

interface GlassSurfaceProps {
  tintColor: string;
  style: StyleProp<ViewStyle>;
  isInteractive?: boolean;
  children: ReactNode;
}

const liquidGlassAvailable = isLiquidGlassAvailable();

export function GlassSurface({ tintColor, style, isInteractive = true, children }: GlassSurfaceProps) {
  const colorScheme = useColorScheme();

  if (liquidGlassAvailable) {
    return (
      <GlassView glassEffectStyle="regular" tintColor={tintColor} isInteractive={isInteractive} style={style}>
        {children}
      </GlassView>
    );
  }

  return (
    <View style={style}>
      <BlurView
        intensity={60}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tintColor }} />
      {children}
    </View>
  );
}
