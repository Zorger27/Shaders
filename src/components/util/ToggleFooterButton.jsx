import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import FooterContext from '@/components/layout/FooterContext.jsx';
import { useLocation } from 'react-router-dom';
import '@/components/util/ToggleFooterButton.scss';

const ToggleFooterButton = ({ className = '', style = {} }) => {
  const { t } = useTranslation();
  const { isFooterHidden, toggleFooter } = useContext(FooterContext) ?? {};
  const location = useLocation();

  const isNotFound = location.pathname.startsWith('/404');
  const isOgImage = location.pathname.startsWith('/ogimage/');

  // Если нет контекста или мы на страницах, где кнопка не нужна
  if (!toggleFooter || isNotFound || isOgImage) {
    return null;
  }

  return (
    <button
      onClick={toggleFooter}
      className={`toggle-footer-btn ${className}`.trim()} // гарантируем, что лишних пробелов не будет
      style={style} // проброс инлайн-стилей, если передали
      title={isFooterHidden ? t('extra.openFooter') : t('extra.closeFooter')}
      aria-pressed={!!isFooterHidden}
    >
      <i className={`fa ${isFooterHidden ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
    </button>
  );
};

export default ToggleFooterButton;
