import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

// Get saved language or default to 'en'
const savedLanguage = localStorage.getItem('app-settings');
let defaultLanguage = 'en';

if (savedLanguage) {
  try {
    const settings = JSON.parse(savedLanguage);
    if (settings.state?.language) {
      defaultLanguage = settings.state.language;
    }
  } catch (e) {
    // Ignore parse errors
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
