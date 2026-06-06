import React from 'react';
import { Link } from 'react-router-dom';
import '@/pages/service/PageNotFound.scss';
import {useTranslation} from "react-i18next";
import {useSpaCleanup} from "@/hooks/useSpaCleanup.js";
import MetaTags from "@/components/seo/MetaTags.jsx";

const PageNotFound = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;

  useSpaCleanup();

  return (
    <div className="page-not-found">

      <MetaTags
        mainTitle={t('page404.name')}
        metaTags={[
          { name: "description", content: t('page404.disc') },

          // Open Graph meta tags
          { property: "og:title", content: t('page404.name') },
          { property: "og:description", content: t('page404.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/404.jpg` },
          { property: "og:url", content: `${siteUrl}/404` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('page404.name') },
          { property: "twitter:description", content: t('page404.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/404.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="inner">
        <h1>404</h1>
        <p>{t('page404.info404')}</p>
        <Link to="/">{t('page404.btn404')}</Link>
      </div>
    </div>
  );
};

export default PageNotFound;