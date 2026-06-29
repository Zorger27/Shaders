import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import '@/pages/menu/Project5.scss';
import { Link } from "react-router-dom";
import { useSpaCleanup } from "@/hooks/useSpaCleanup.js";
import ToggleFooterButton from "@/components/util/ToggleFooterButton.jsx";
import MetaTags from "@/components/seo/MetaTags.jsx";
import CanvasFullScreen from "@/components/util/CanvasFullScreen.jsx";
import { useResponsiveStyle } from "@/hooks/useResponsiveStyle";
import WebGPUCanvas from '@/components/canvas/WebGPUCanvas.jsx';
import SceneBackground from '@/components/canvas/SceneBackground.jsx';
import { TslGridCube } from '@/components/canvas/TslGridCube.jsx';
import { OrbitControls } from '@react-three/drei';
import background05 from "@/assets/CanvasFullScreen/cube3-15.webp";

export const Project5 = () => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL;
  useSpaCleanup();

  const canvasContainerRef = useRef(null);
  const controlsRef = useRef(null);
  // Реф для направления маятника (1 = вправо, -1 = влево)
  const sizeDirRef = useRef(1);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // --- СОСТОЯНИЯ УПРАВЛЕНИЯ ---
  const [gridSize, setGridSize] = useState(5.0);
  const [autoSize, setAutoSize] = useState(false);

  // Цвета осей (по дефолту: Красный, Зеленый, Синий)
  const [colorX, setColorX] = useState('#ff0000');
  const [colorY, setColorY] = useState('#00ff00');
  const [colorZ, setColorZ] = useState('#0000ff');

  // Чекбоксы вращения
  const [rotateObject, setRotateObject] = useState(false);
  const [rotateScene, setRotateScene] = useState(false);

  // Закрытие меню по клику вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setIsControlsOpen(false);
      }
    };
    if (isControlsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isControlsOpen]);

  // Бесконечный цикл Авторазмера (Маятник 5 -> 25 -> 5)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (time) => {
      if (autoSize) {
        const delta = time - lastTime;
        lastTime = time;
        const speed = 0.005; // Скорость маятника

        setGridSize((prev) => {
          let next = prev + (delta * speed * sizeDirRef.current);
          if (next >= 25.0) {
            next = 25.0;
            sizeDirRef.current = -1;
          } else if (next <= 5.0) {
            next = 5.0;
            sizeDirRef.current = 1;
          }
          return next;
        });
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    if (autoSize) animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoSize]);

  const handleReset = () => {
    setGridSize(5.0);
    setAutoSize(false);
    setColorX('#ff0000');
    setColorY('#00ff00');
    setColorZ('#0000ff');
    setRotateObject(false);
    setRotateScene(false);
    sizeDirRef.current = 1;
    setResetKey(prev => prev + 1);
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
    <div className="project5">

      <MetaTags
        mainTitle={t('project5.name')}
        metaTags={[
          { name: "description", content: t('project5.disc') },

          // Open Graph meta tags
          { property: "og:title", content: t('project5.name') },
          { property: "og:description", content: t('project5.disc') },
          { property: "og:image", content: `${siteUrl}/ogimage/project5.jpg` },
          { property: "og:url", content: `${siteUrl}/project5` },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: `${siteUrl}` },

          // Twitter meta tags
          { property: "twitter:title", content: t('project5.name') },
          { property: "twitter:description", content: t('project5.disc') },
          { property: "twitter:image", content: `${siteUrl}/ogimage/project5.jpg` },
          { name: "twitter:card", content: "summary_large_image" },

          // SEO-теги
          { name: "author", content: "Anatolii Zorin" },
          { name: "robots", content: "index,follow" },
        ]}
      />

      <div className="container">
        <h1><Link to="/" className="back-to-menu" title={t('extra.back')}>
          <i className="fa fa-arrow-circle-left"></i></Link>
          {t('project5.name')}

          <CanvasFullScreen canvasContainer={canvasContainerRef.current} onCanvasChange={setIsFullscreen}/>
          <ToggleFooterButton />
        </h1>
        <hr className="custom-line" />

        <div ref={canvasContainerRef} className="canvas-wrapper">

          {/* НАСТРОЙКИ UI ИНТЕРФЕЙСА */}
          <div className="controls-container" ref={controlsRef}>
            {!isControlsOpen ? (
              <button className="open-controls-btn" onClick={() => setIsControlsOpen(true)}><i className="fa fa-sliders"></i></button>
            ) : (
              <div className="shader-controls">

                {/* Авторазмер */}
                <button
                  className={`auto-morph-btn ${autoSize ? 'active' : ''}`}
                  onClick={() => setAutoSize(!autoSize)}
                >
                  <i className="fa-solid fa-arrows-left-right"></i> {t('project5.autoSize') || 'Авторазмер'}
                </button>

                {/* Ползунок размерности (5 - 25) */}
                <div className="control-group">
                  <label>{t('project5.dimension') || 'Размерность'}: {gridSize.toFixed(1)}</label>
                  <div className="slider-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <button
                      className="slider-button minus"
                      onClick={() => {
                        setAutoSize(false);
                        setGridSize(prev => Math.max(5, Math.floor((prev - 0.1) / 5) * 5));
                      }}
                      disabled={gridSize <= 5}
                    >
                      <i className="fa-solid fa-minus-circle" />
                    </button>
                    <input
                      type="range" min="5" max="25" step="0.01" value={gridSize}
                      onChange={(e) => {
                        setAutoSize(false);
                        setGridSize(parseFloat(e.target.value));
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="slider-button plus"
                      onClick={() => {
                        setAutoSize(false);
                        setGridSize(prev => Math.min(25, Math.ceil((prev + 0.1) / 5) * 5));
                      }}
                      disabled={gridSize >= 25}
                    >
                      <i className="fa-solid fa-plus-circle" />
                    </button>
                  </div>
                </div>

                {/* Цвета осей */}
                <div className="control-group">
                  <label>{t('project5.colors') || 'Цвета осей (X, Y, Z)'}</label>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '5px' }}>
                    <input type="color" value={colorX} onChange={e => setColorX(e.target.value)} title="Ось X" style={{ width: '100%', cursor: 'pointer' }}/>
                    <input type="color" value={colorY} onChange={e => setColorY(e.target.value)} title="Ось Y" style={{ width: '100%', cursor: 'pointer' }}/>
                    <input type="color" value={colorZ} onChange={e => setColorZ(e.target.value)} title="Ось Z" style={{ width: '100%', cursor: 'pointer' }}/>
                  </div>
                </div>

                {/* Чекбоксы вращения */}
                <div className="control-group checkboxes-group">
                  <label className="custom-checkbox">
                    <input type="checkbox" checked={rotateObject} onChange={e => setRotateObject(e.target.checked)} />
                    <span className="checkmark"></span>
                    {t('project5.rotateObject') || 'Вращение куба'}
                  </label>
                  <label className="custom-checkbox">
                    <input type="checkbox" checked={rotateScene} onChange={e => setRotateScene(e.target.checked)} />
                    <span className="checkmark"></span>
                    {t('project5.rotateScene') || 'Вращение сцены'}
                  </label>
                </div>

                <div className="control-group"><button className="reset" onClick={handleReset}>{t ('project4.reset')}</button></div>

              </div>
            )}
          </div>

          <WebGPUCanvas style={canvasStyle} key={resetKey}>
            <perspectiveCamera makeDefault position={[0, 0, 4.5]} />

            <ambientLight intensity={0.7} /> {/* Небольшой общий свет, чтобы тени не были абсолютно черными */}

            {/* Четко закрепленный прожектор */}
            <spotLight
              position={[3, 3, 1.5]} // Координаты: X (вправо), Y (вверх), Z (ближе к экрану)
              angle={0.7}            // Ширина светового конуса (в радианах). Чем меньше, тем уже луч
              penumbra={0.3}         // Степень размытия краев светового пятна (от 0 — жесткие края, до 1 — мягкие)
              intensity={55}         // Интенсивность (для spotLight значения нужны выше, чем для directional)
              decay={1.2}            // Естественное затухание света в зависимости от расстояния
            />

            <SceneBackground imagePath={background05} enabled={isFullscreen}/>

            <TslGridCube
              gridSize={gridSize}
              colorX={colorX} colorY={colorY} colorZ={colorZ}
              rotateObject={rotateObject}
            />

            <OrbitControls enableDamping enablePan={false} enableZoom autoRotate autoRotateSpeed={2}/>
          </WebGPUCanvas>

        </div>

      </div>
    </div>
  );
};