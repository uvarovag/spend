import { colorScheme } from 'nativewind';

import { createValueStore } from '@/shared/lib/create-value-store';

export type ThemePreference = 'system' | 'light' | 'dark';

const themePreferenceStore = createValueStore<ThemePreference>('system');

export function useThemePreference(): ThemePreference {
  return themePreferenceStore.useValue();
}

export function setThemePreference(preference: ThemePreference): void {
  themePreferenceStore.setValue(preference);
  colorScheme.set(preference);
}
