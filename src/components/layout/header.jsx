import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectHeaderLogo, selectHeaderAbout } from '@/store/view/viewSlice.js';
import { Link } from 'react-router-dom';
import '@/components/layout/header.scss';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/util/LanguageSwitcher.jsx';
import DocFullScreen from "@/components/util/DocFullScreen.jsx";

const Header = () => {
  const headerLogo = useSelector(selectHeaderLogo);
  const headerAbout = useSelector(selectHeaderAbout);
  const { t } = useTranslation();

  const [showMenu, setShowMenu] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  const burgerRef = useRef(null);
  const menuRef = useRef(null); // 👈 новый ref для выпадающего меню

  const toggleMenu = () => setShowMenu((v) => !v);
  const toggleProjects = () => setShowProjects((v) => !v);
  const closeAll = () => { setShowMenu(false); setShowProjects(false); };

  // Закрывать при клике вне бургер-кнопки И вне самого меню
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!showMenu && !showProjects) return; // 👈 проверяем оба состояния

      const burgerEl = burgerRef.current;
      const menuEl = menuRef.current;
      const target = event.target;

      const clickedInsideBurger = burgerEl && burgerEl.contains(target);
      const clickedInsideMenu = menuEl && menuEl.contains(target);

      if (!clickedInsideBurger && !clickedInsideMenu) {
        closeAll();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu, showProjects]);

  return (
    <header className="header">
      <div className="header-img">
        <div className="burger-menu" ref={burgerRef} onClick={toggleMenu}>
          <i className={`fa ${showMenu ? 'fa-times' : 'fa-bars'} burger-menu-icon`} />
        </div>

        <div className="logo">
          <Link to="/" onClick={closeAll}>
            <img src={String(headerLogo)} alt="Логотип" className="logo" title={t('header.headerImage')}/>
          </Link>
        </div>

        <div className="header-about">
          <Link to="/about" onClick={closeAll}>
            <img src={String(headerAbout)} alt="Ссылка на About" className="header-about" title={t('header.headerAbout')}/>
          </Link>
        </div>

        <div className="language"><LanguageSwitcher /></div>

        <div className="full-screen"><DocFullScreen /></div>
      </div>

      {/* Выпадающее меню — позиционируется поверх, не ломая layout хедера */}
      <div ref={menuRef} className={`menu ${showMenu ? 'is-active' : ''}`}
           onClick={(e) => e.stopPropagation()} // клики внутри не закрывают меню
      >
        <Link to="/" onClick={closeAll}>{t('home.main')}</Link>

        <div className={`menu-item ${showProjects ? 'open' : ''}`}>
          <a className="menu-toggle" onClick={toggleProjects} aria-expanded={showProjects} aria-controls="projects-submenu">
            {t('home.projects')}
            <span><i className={`fa ${showProjects ? 'fa-caret-up' : 'fa-caret-down'}`} /></span>
          </a>

          <div id="projects-submenu" className="submenu" aria-hidden={!showProjects}>
            <Link to="/project1" onClick={closeAll}>{t('project1.name')}</Link>
            <Link to="/project2" onClick={closeAll}>{t('project2.name')}</Link>
            <Link to="/project3" onClick={closeAll}>{t('project3.name')}</Link>
            <Link to="/project4" onClick={closeAll}>{t('project4.name')}</Link>
            <Link to="/project5" onClick={closeAll}>{t('project5.name')}</Link>
          </div>
        </div>

        <Link to="/about" onClick={closeAll}>{t('about.name')}</Link>
      </div>
    </header>
  );
};

export default Header;
