import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleView, selectFooterLogo } from '@/store/view/viewSlice.js';
import { useTranslation } from 'react-i18next';
import '@/components/layout/footer.scss';
import SocialSharing from "@/components/seo/SocialSharing.jsx";

const Footer = () => {
  const dispatch = useDispatch();
  const footerLogo = useSelector(selectFooterLogo);
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const progYear = 2026;

  const handleClick = () => {dispatch(toggleView());};

  const displayYear =
    progYear && progYear !== currentYear
      ? `${progYear}–${currentYear}`
      : `${currentYear}`;

  const isProgYearEqual = progYear === currentYear;

  return (
    <footer className="footer">
      <div className="footer-logo" onClick={handleClick}>
        <img src={footerLogo} title={t('footer.footerLogo')} alt="Footer Logo Image" />
      </div>

      <div className="footer-content">
        <Author />
        <Copyright displayYear={displayYear} isProgYearEqual={isProgYearEqual} />
      </div>
      <SocialSharing />
    </footer>
  );
};

// Вложенный компонент Author
const Author = () => {
  const { t } = useTranslation();
  return (
    <div className="author">
      {t('footer.develop')} <b><a href="https://zorin.expert" title={t('footer.portfolio')} target="_blank" rel="noopener noreferrer">{t('footer.zorger')}</a>{t('footer.point')}</b>
    </div>
  );
};

// Вложенный компонент Copyright
const Copyright = ({ displayYear, isProgYearEqual }) => {
  const { t } = useTranslation();
  return (
    <div className={`copyright ${isProgYearEqual ? 'is-prog-year-equal' : ''}`}>
      <b>&copy; {displayYear}</b> – {t('footer.rights')}
    </div>
  );
};

export default Footer;
