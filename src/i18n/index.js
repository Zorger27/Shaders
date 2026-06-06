import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import uk from './locales/uk.json';
import es from './locales/es.json';

const locales = ['en', 'uk', 'es'];

const saved = localStorage.getItem('user-locale');
const browser = navigator.language.slice(0, 2);
const lng = locales.includes(saved) ? saved : locales.includes(browser) ? browser : 'en';

document.documentElement.lang = lng;

(async () => {
  await i18n
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en }, uk: { translation: uk }, es: { translation: es } },
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
})();

export default i18n;
