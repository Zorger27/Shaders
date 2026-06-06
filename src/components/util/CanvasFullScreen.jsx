import React, { useEffect, useCallback } from 'react';
import '@/components/util/CanvasFullScreen.scss';
import { useTranslation } from 'react-i18next';

const CanvasFullScreen = ({ canvasContainer, onCanvasChange }) => {
  const { t } = useTranslation();

  const canvasFullscreenChange = useCallback(() => {
    const fullscreenActive = document.fullscreenElement === canvasContainer;

    // Уведомляем родителя об изменении
    if (onCanvasChange) {
      onCanvasChange(fullscreenActive);
    }
  }, [onCanvasChange, canvasContainer]);

  const handleKeyDown = useCallback((event) => {
    if ((event.key === 'Backspace' || event.key === ' ') && document.fullscreenElement) {
      document.exitFullscreen().catch((error) => {
        console.error('Exit fullscreen error:', error.message);
      });
    }
  }, []);

  useEffect(() => {
    // Отслеживаем изменения fullscreen
    document.addEventListener('fullscreenchange', canvasFullscreenChange);
    document.addEventListener('webkitfullscreenchange', canvasFullscreenChange);
    document.addEventListener('mozfullscreenchange', canvasFullscreenChange);
    document.addEventListener('MSFullscreenChange', canvasFullscreenChange);

    // Отслеживаем клавиши
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', canvasFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', canvasFullscreenChange);
      document.removeEventListener('mozfullscreenchange', canvasFullscreenChange);
      document.removeEventListener('MSFullscreenChange', canvasFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, canvasFullscreenChange]);

  const canvasFullScreenView = () => {
    const canvasContainerElement = canvasContainer;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((error) => {
        console.error('Exit fullscreen error:', error.message);
      });
    } else {
      if (canvasContainerElement?.requestFullscreen) {
        canvasContainerElement.requestFullscreen().catch((error) => {
          console.error('Enter fullscreen error:', error.message);
        });
      } else if (canvasContainerElement?.['mozRequestFullScreen']) { // Firefox
        canvasContainerElement['mozRequestFullScreen']();
      } else if (canvasContainerElement?.['webkitRequestFullscreen']) { // Chrome, Safari and Opera
        canvasContainerElement['webkitRequestFullscreen']();
      } else if (canvasContainerElement?.['msRequestFullscreen']) { // IE/Edge
        canvasContainerElement['msRequestFullscreen']();
      }
    }
  };

  return (
    <button
      onClick={canvasFullScreenView}
      className="canvas-full-screen"
      title={t('extra.canvasFullScreen')}
    >
      <i className="fa fa-expand"></i>
    </button>
  );
};

export default CanvasFullScreen;