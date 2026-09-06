// ----- Apple system colors (iOS light-mode UIColor values) -----------------
// https://developer.apple.com/design/human-interface-guidelines/color#iOS-iPadOS
export const systemColors = {
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  mint: '#00C7BE',
  teal: '#30B0C7',
  cyan: '#32ADE6',
  blue: '#007AFF',
  indigo: '#5856D6',
  purple: '#AF52DE',
  pink: '#FF2D55',
  brown: '#A2845E',
  gray: '#8E8E93',
  gray2: '#636366',
  gray3: '#C7C7CC',
  white: '#FFFFFF',
} as const;

// ----- Theme-dependent UI colors --------------------------------------------
// Fixed literals (not NativeWind classes) for spots that force an explicit color to match
// a native SwiftUI surface — see feed-filters-screen.tsx and glass-icon-button.tsx.
export const groupedBackgroundColor = { light: '#F2F2F7', dark: '#000000' } as const;
export const labelColor = { light: '#111827', dark: '#F5F5F5' } as const;

// A flat "regular" Liquid Glass effect is nearly invisible over a plain-color background — it
// reads mostly from edge highlights, not a flat tint. Used by GlassIconButton to keep glass
// surfaces readable regardless of what's behind them.
export const neutralGlassTint = { light: 'rgba(0, 0, 0, 0.06)', dark: 'rgba(255, 255, 255, 0.14)' } as const;
