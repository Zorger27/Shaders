import React, {useEffect, useRef, useState} from "react";
import { useTranslation } from 'react-i18next';
import '@/pages/menu/Project3.scss';
import {Link} from "react-router-dom";
import {useSpaCleanup} from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";
import CanvasFullScreen from "@/components/util/CanvasFullScreen.jsx";
import { useResponsiveStyle } from "@/hooks/useResponsiveStyle";
import WebGPUCanvas from '@/components/canvas/WebGPUCanvas.jsx';
import SceneBackground from '@/components/canvas/SceneBackground.jsx';

import * as THREE from "three";
import { OrbitControls } from '@react-three/drei';
import { instanceIndex, positionLocal, storage, wgslFn, color, uniform } from 'three/tsl'

import background03 from "@/assets/CanvasFullScreen/cube3-14.webp";

export const Project3 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();
  const canvasContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Куб с прозрачными гранями и свечением по контуру
  const Sphere = () => {

    return (
      <group>

      </group>
    );
  };

  // responsive inline-стили
  const canvasStyle = useResponsiveStyle({
    default: {
      height: 'calc(100vh - 225px)',
      width: '100%',
      marginTop: '0rem',
      marginLeft: '0rem',
    },
    "1020": {
      height: 'calc(100vh - 218px)',
      width: '100%',
      marginTop: '0rem',
      marginLeft: '0rem',
    },
    "768": {
      height: 'calc(100vh - 206px)',
      width: '100%',
      marginTop: '0rem',
      marginLeft: '0rem',
    }
  });

  return (
    <div className="project3">

      <MetaTags
        mainTitle={t('project3.name')}
        metaTags={[
          { name: "description", content: t('project3.disc') },

          // Open Graph meta tags
          { property: "og:title", content: t('project3.name') },
          { property: "og:description", content: t('project3.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/project3.jpg` },
          { property: "og:url", content: `${siteUrl}/project3` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('project3.name') },
          { property: "twitter:description", content: t('project3.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/project3.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="container">
        <h1><Link to="/" className="back-to-menu" title={t('extra.back')}>
          <i className="fa fa-arrow-circle-left"></i></Link>
          {t('project3.name')}

          <CanvasFullScreen canvasContainer={canvasContainerRef.current} onCanvasChange={setIsFullscreen}/>
          <ToggleFooterButton />
        </h1>
        <hr className="custom-line" />

        <div ref={canvasContainerRef}>

          <WebGPUCanvas style={canvasStyle}>
            <perspectiveCamera makeDefault position={[0, 0, 2.5]} />
            <ambientLight intensity={0.6} />
            <SceneBackground imagePath={background03} enabled={isFullscreen}/>

            <Sphere />

            <OrbitControls enableDamping enablePan={false} enableZoom autoRotate autoRotateSpeed={5}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};