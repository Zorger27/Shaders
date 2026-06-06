import React from "react";
import { useTranslation } from 'react-i18next';
import '@/components/panel/CanvasBackgroundPanel.scss';

import small2Cube10 from "@/assets/app/VortexCube/cube3/cube3-10.webp";
import small2Cube15 from "@/assets/app/VortexCube/cube3/cube3-15.webp";
import small2Cube20 from "@/assets/app/VortexCube/cube3/cube3-20.webp";
import small2Cube24 from "@/assets/app/VortexCube/cube3/cube3-24.webp";

/**
 * Панель выбора фона Canvas в fullscreen режиме
 *
 * @param {Object} props
 * @param {string} props.currentBackground - Текущий фон ('scene01' | 'scene02' | 'scene03' | 'scene04')
 * @param {Function} props.onBackgroundChange - Callback для изменения фона
 * @param {Function} props.onActivate - Callback для открытия fullscreen с выбранным фоном
 * @param {boolean} props.isOpen - Состояние открытия меню
 * @param {Function} props.onToggle - Callback для открытия/закрытия меню
 * @param {React.RefObject} props.canvasRef - Ref на canvas контейнер для fullscreen
 */

const CanvasBackgroundPanel = ({
                                 currentBackground = 'scene01',
                                 onBackgroundChange,
                                 onActivate,
                                 isOpen = false,
                                 onToggle,
                                 canvasRef
                               }) => {
  const { t } = useTranslation();

  const handleBackgroundClick = (backgroundName) => {
    // Устанавливаем выбранный фон
    if (onBackgroundChange) {
      onBackgroundChange(backgroundName);
    }

    // Открываем fullscreen с этим фоном
    if (onActivate) {
      onActivate(backgroundName);
    }

    // Запускаем fullscreen
    openFullscreen();
  };

  const openFullscreen = () => {
    const canvasContainerElement = canvasRef?.current;

    if (!canvasContainerElement) {
      console.error('❌ Canvas container not found!');
      return;
    }

    if (canvasContainerElement?.requestFullscreen) {
      canvasContainerElement.requestFullscreen().catch((error) => {
        console.error('Enter fullscreen error:', error.message);
      });
    } else if (canvasContainerElement?.['mozRequestFullScreen']) {
      canvasContainerElement['mozRequestFullScreen']();
    } else if (canvasContainerElement?.['webkitRequestFullscreen']) {
      canvasContainerElement['webkitRequestFullscreen']();
    } else if (canvasContainerElement?.['msRequestFullscreen']) {
      canvasContainerElement['msRequestFullscreen']();
    }
  };

  return (
    <div className="canvas-background-buttons">
      {/* Главная кнопка */}
      <button
        className={`main-canvas-background-button ${isOpen ? 'open' : ''}`}
        onClick={() => {
          if (onToggle) onToggle(!isOpen);
        }}
        title={isOpen ? t('canvas-background.menu-close') : t('canvas-background.menu-open')}
      >
        <i className={`main-canvas-background-icon fas ${isOpen ? 'fa-times' : 'fa-images'}`}></i>
        <span className="main-canvas-background-text">{t('canvas-background.title')}</span>
      </button>

      {/* Подменю с кнопками */}
      <div className={`canvas-background-submenu ${isOpen ? 'open' : ''}`}>

        <img
          src={String(small2Cube10)}
          alt="scene01"
          className={currentBackground === 'scene01' ? 'active' : ''}
          onClick={() => handleBackgroundClick('scene01')}
          title={t('canvas-background.scene01')}
        />

        <img
          src={String(small2Cube15)}
          alt="scene02"
          className={currentBackground === 'scene02' ? 'active' : ''}
          onClick={() => handleBackgroundClick('scene02')}
          title={t('canvas-background.scene02')}
        />

        <img
          src={String(small2Cube20)}
          alt="scene03"
          className={currentBackground === 'scene03' ? 'active' : ''}
          onClick={() => handleBackgroundClick('scene03')}
          title={t('canvas-background.scene03')}
        />

        <img
          src={String(small2Cube24)}
          alt="scene04"
          onClick={() => handleBackgroundClick('scene04')}
          className={currentBackground === 'scene04' ? 'active' : ''}
          title={t('canvas-background.scene04')}
        />

      </div>
    </div>
  );
};

export default CanvasBackgroundPanel;