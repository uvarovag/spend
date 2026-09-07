import i18next from 'i18next';
import { Storage } from 'expo-sqlite/kv-store';
import { initReactI18next } from 'react-i18next';

import { detectDeviceLanguage, supportedLanguages, type SupportedLanguage } from '@/shared/lib/detect-device-language';

import en from './locales/en.json';
import ru from './locales/ru.json';

const LANGUAGE_STORAGE_KEY = 'language';

function readPersistedLanguage(): SupportedLanguage | undefined {
  const raw = Storage.getItemSync(LANGUAGE_STORAGE_KEY);
  return supportedLanguages.includes(raw as SupportedLanguage) ? (raw as SupportedLanguage) : undefined;
}

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  // A manually picked language (business-logic-plan.md, Step 11) takes precedence over the
  // device's own language over restarts; falls back to device detection the first time.
  lng: readPersistedLanguage() ?? detectDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18next.on('languageChanged', (language) => {
  Storage.setItemSync(LANGUAGE_STORAGE_KEY, language);
});

export { i18next };
