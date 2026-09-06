import { useTranslation } from 'react-i18next';

import { supportedLanguages, type SupportedLanguage } from '@/shared/lib/detect-device-language';
import { SegmentedSwitcher } from '@/shared/ui/segmented-switcher';

const languageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  ru: 'Русский',
};

export function LanguagePicker() {
  const { i18n } = useTranslation();

  return (
    <SegmentedSwitcher
      value={i18n.language as SupportedLanguage}
      onChange={(language) => i18n.changeLanguage(language)}
      options={supportedLanguages}
      getLabel={(language) => languageLabels[language]}
      width={160}
    />
  );
}
