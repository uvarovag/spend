import { colorScheme } from 'nativewind';

import { createValueStore } from '@/shared/lib/create-value-store';

export type ThemePreference = 'system' | 'light' | 'dark';

const themePreferenceStore = createValueStore<ThemePreference>('system', 'theme-preference');

// Applies a theme preference restored from persistence at module load: `colorScheme` from
// nativewind is in-memory only, so without this a persisted "light"/"dark" choice would render
// correctly from the second app start's settings screen but not actually take effect until the
// user re-picks it.
colorScheme.set(themePreferenceStore.getValue());

export function useThemePreference(): ThemePreference {
  return themePreferenceStore.useValue();
}

export function setThemePreference(preference: ThemePreference): void {
  themePreferenceStore.setValue(preference);
  colorScheme.set(preference);
}
