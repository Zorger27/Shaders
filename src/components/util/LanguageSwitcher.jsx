import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/components/util/LanguageSwitcher.scss';

const flags = {
  en: '🇬🇧',
  uk: '🇺🇦',
  es: '🇪🇸',
};

const languageTitles = {
  en: 'English',
  uk: 'Українська',
  es: 'Español',
};

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const current = i18n.language;

  const changeLang = (lang) => {
    void i18n.changeLanguage(lang);
    localStorage.setItem('user-locale', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = current;
  }, [current]);

  return (
    <div className="lang-switcher">
      {Object.keys(languageTitles).map((lng) => (
        <button
          key={lng}
          title={t(`language.${lng}`)}
          className={`lang-btn ${lng === current ? 'active' : ''}`}
          onClick={() => changeLang(lng)}
        >
          {flags[lng]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
