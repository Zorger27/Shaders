import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import '@/pages/menu/About.scss';
import { useSpaCleanup } from "@/hooks/useSpaCleanup";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";

export const About = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;

  useSpaCleanup();
  const [showMore, setShowMore] = useState(false);
  const [tableView, setTableView] = useState(false);
  const infoList = useSelector((state) => state.info);

  // Загружаем состояния при монтировании
  useEffect(() => {
    const savedShowMore = localStorage.getItem("about_showMore");
    if (savedShowMore !== null) {
      setShowMore(savedShowMore === "true");
    }

    const savedTableView = localStorage.getItem("about_tableView");
    if (savedTableView !== null) {
      setTableView(savedTableView === "true");
    }
  }, []);

  // Сохраняем showMore при изменении
  useEffect(() => {
    localStorage.setItem("about_showMore", String(showMore));
  }, [showMore]);

  // Сохраняем tableView при изменении
  useEffect(() => {
    localStorage.setItem("about_tableView", String(tableView));
  }, [tableView]);

  return (
    <div className="about">

      <MetaTags
        mainTitle={t('about.name')}
        metaTags={[
          { name: "description", content: t('about.disc') },

           // Open Graph meta tags
          { property: "og:title", content: t('about.name') },
          { property: "og:description", content: t('about.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/about.jpg` },
          { property: "og:url", content: `${siteUrl}/about` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('about.name') },
          { property: "twitter:description", content: t('about.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/about.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="container">
        <h1>
          {t('about.title')}
          <ToggleFooterButton />
          <i
            onClick={() => setTableView(!tableView)}
            title={tableView ? t('extra.listView') : t('extra.tableView')}
          >
            <span className={`fa ${tableView ? 'fa-list' : 'fa-th'}`}></span>
          </i>
        </h1>

        <div className="about-content">
          <section className="about-description">
            <hr className="custom-line" />

            {!showMore ? (
              <h2 className="more" onClick={() => setShowMore(true)}>
                {t('about.more01')}
                <i className="fas fa-hand-pointer" />
              </h2>
            ) : (
              <div className="more-text" onClick={() => setShowMore(false)}>
                <p>{t('about.more02')}</p>
                <p>{t('about.more03')}</p>
                <p>{t('about.more04')}</p>
                <h3>{t('about.more05')}</h3>
              </div>
            )}

            <hr className="custom-line" />
          </section>

          <section className="about-tech">
            {tableView ? (
              <div className="table">
                <table>
                  <thead>
                  <tr>
                    <th className="tech-title" colSpan="3">
                      {t('about.technologies')}
                    </th>
                  </tr>
                  <tr>
                    <th>№</th>
                    <th>{t('about.name-prg')}</th>
                    <th>{t('about.version')}</th>
                  </tr>
                  </thead>
                  <tbody>
                  {infoList.map((info) => (
                    <tr key={info.id}>
                      <td className="nomer">{info.id}</td>
                      <td className="name">
                        <a href={info.url} title={t('extra.detail')} target="_blank" rel="noopener noreferrer">
                          {info.title}
                        </a>
                      </td>
                      <td className="version">{info.version}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                <h2 className="tech-title">{t('about.technologies')}</h2>
                {infoList.map((info) => (
                  <div className="card-info" key={info.id}>
                    <a className="card-link" href={info.url} target="_blank" rel="noopener noreferrer" title={t('extra.detail')}>
                      <h3>
                        <span style={{ color: 'black' }}>{info.id}.</span>{' '}
                        <span>{info.title}</span>{' '}
                        <span style={{ color: 'red' }}>{info.version ? `v.${info.version}` : ''}</span>
                      </h3>
                    </a>
                  </div>
                ))}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};