import React, { useState, useEffect, useCallback } from 'react';
import {BrowserRouter as Router, Routes, Route, useLocation, Navigate} from 'react-router-dom';
import Canonical from '@/components/seo/Canonical.jsx';
import GoogleAnalytics from '@/components/seo/GoogleAnalytics.jsx';

import Header from '@/components/layout/header.jsx';
import Footer from '@/components/layout/footer.jsx';
import FooterContext from '@/components/layout/FooterContext.jsx';
import Home from '@/pages/menu/Home.jsx';
import { Project1 } from '@/pages/menu/Project1.jsx';
import { Project2 } from '@/pages/menu/Project2.jsx';
import { Project3 } from '@/pages/menu/Project3.jsx';
import { Project4 } from '@/pages/menu/Project4.jsx';
import { Project5 } from '@/pages/menu/Project5.jsx';
import { About } from '@/pages/menu/About.jsx';
import PageNotFound from '@/pages/service/PageNotFound.jsx';
import '@/App.scss';

const AppLayout = () => {
  const location = useLocation();
  const isNotFound = location.pathname.startsWith('/404');
  const routeKey = location.pathname;

  const [isFooterHidden, setIsFooterHidden] = useState(false);

  // Загружаем состояние при смене маршрута
  useEffect(() => {
    const stored = localStorage.getItem(`footerHidden_${routeKey}`);
    setIsFooterHidden(stored === 'true');
  }, [routeKey]);

  // Функция переключения
  const toggleFooter = useCallback(() => {
    setIsFooterHidden(prev => {
      const next = !prev;
      try {
        localStorage.setItem(`footerHidden_${routeKey}`, String(next));
      } catch (err) {
        console.warn('Could not write footer state to localStorage', err);
      }
      return next;
    });
  }, [routeKey]);

  return (
    <FooterContext.Provider value={{ isFooterHidden, toggleFooter }}>
      <div className="app">
        <Canonical url={`${import.meta.env.VITE_SITE_URL}${location.pathname}`} />
        <GoogleAnalytics id={import.meta.env.VITE_GOOGLE_ANALYTICS_ID} />

        {!isNotFound && <Header />}
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project1" element={<Project1 />} />
            <Route path="/project2" element={<Project2 />} />
            <Route path="/project3" element={<Project3 />} />
            <Route path="/project4" element={<Project4 />} />
            <Route path="/project5" element={<Project5 />} />
            <Route path="/about" element={<About />} />
            <Route path="/404" element={<PageNotFound />} />

            {/* Обработка неизвестных маршрутов */}
            <Route path="*" element={<Navigate to="/404" replace />} />

          </Routes>
        </main>
        {!isNotFound && !isFooterHidden && <Footer />}
      </div>
    </FooterContext.Provider>
  );
};

const App = () => (
    <Router>
      <AppLayout />
    </Router>
);

export default App;