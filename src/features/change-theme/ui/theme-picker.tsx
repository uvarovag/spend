import { useTranslation } from 'react-i18next';

import { SegmentedSwitcher } from '@/shared/ui/segmented-switcher';

import { setThemePreference, useThemePreference, type ThemePreference } from '../model/use-theme-preference';

const themePreferences: ThemePreference[] = ['system', 'light', 'dark'];

export function ThemePicker() {
  const { t } = useTranslation();
  const preference = useThemePreference();

  return (
    <SegmentedSwitcher
      value={preference}
      onChange={setThemePreference}
      options={themePreferences}
      getLabel={(themePreference) => t(`settings.theme.${themePreference}`)}
      width={190}
    />
  );
}
