import * as Localization from 'expo-localization';

export const supportedLanguages = ['en', 'ru'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export function detectDeviceLanguage(): SupportedLanguage {
  const deviceLanguageCode = Localization.getLocales()[0]?.languageCode;
  return supportedLanguages.includes(deviceLanguageCode as SupportedLanguage)
    ? (deviceLanguageCode as SupportedLanguage)
    : 'en';
}
