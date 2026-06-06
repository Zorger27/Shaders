import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '@/pages/menu/Home.scss';
import {useSpaCleanup} from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";

import Project1 from "@/assets/img/main/Project1.webp"
import Project2 from "@/assets/img/main/Project2.webp"
import Project3 from "@/assets/img/main/Project3.webp"
import Project4 from "@/assets/img/main/Project4.webp"
import Project5 from "@/assets/img/main/Project5.webp"

const Home = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;

  useSpaCleanup();

  return (
    <div className="home">

      <MetaTags
        mainTitle={t('home.name')}
        metaTags={[
          { name: "description", content: t('home.disc') },

          // Open Graph meta tags
          { property: "og:title", content: t('home.name') },
          { property: "og:description", content: t('home.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/home.jpg` },
          { property: "og:url", content: `${siteUrl}` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('home.name') },
          { property: "twitter:description", content: t('home.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/home.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="container">
        <h1>
          {t('home.title')}
          <ToggleFooterButton />
        </h1>
        <hr className="custom-line" />
        <div className="projects-grid">
          <div className="inner">
            <Link to="/project1" className="project-card-link">
              <div className="project-card">
                <div className="project-img">
                  <img src={ String(Project1) } alt="project1" />
                </div>
                <div className="project-text">
                  <h3>{t('project1.name')}</h3>
                  <p>{t('project1.disc')}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="inner">
            <Link to="/project2" className="project-card-link">
              <div className="project-card">
                <div className="project-img">
                  <img src={ String(Project2) } alt="project2" />
                </div>
                <div className="project-text">
                  <h3>{t('project2.name')}</h3>
                  <p>{t('project2.disc')}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="inner">
            <Link to="/project3" className="project-card-link">
              <div className="project-card">
                <div className="project-img">
                  <img src={ String(Project3) } alt="project3" />
                </div>
                <div className="project-text">
                  <h3>{t('project3.name')}</h3>
                  <p>{t('project3.disc')}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="inner">
            <Link to="/project4" className="project-card-link">
              <div className="project-card">
                <div className="project-img">
                  <img src={ String(Project4) } alt="project4" />
                </div>
                <div className="project-text">
                  <h3>{t('project4.name')}</h3>
                  <p>{t('project4.disc')}</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="inner">
            <Link to="/project5" className="project-card-link">
              <div className="project-card">
                <div className="project-img">
                  <img src={ String(Project5) } alt="project5" />
                </div>
                <div className="project-text">
                  <h3>{t('project5.name')}</h3>
                  <p>{t('project5.disc')}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;