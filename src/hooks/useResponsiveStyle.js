import { useState, useEffect } from "react";

/**
 * Хук для responsive inline-стилей
 * @param {Object} stylesByBreakpoint - объект вида:
 * {
 *   default: {...},
 *   "1020": {...}, // <= 1020px
 *   "768": {...}   // <= 768px
 * }
 */
export function useResponsiveStyle(stylesByBreakpoint) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [fullscreenState, setFullscreenState] = useState({
    isPageFullscreen: false,
    isCanvasFullscreen: false
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document['webkitFullscreenElement'] ||
        document['mozFullScreenElement'] ||
        document['msFullscreenElement'];

      if (!fullscreenElement) {
        // Нет fullscreen
        setFullscreenState({
          isPageFullscreen: false,
          isCanvasFullscreen: false
        });
        // Убираем класс для body
        document.body.classList.remove('page-fullscreen');
      } else if (fullscreenElement === document.documentElement) {
        // Вся страница в fullscreen (ToggleFullScreen)
        setFullscreenState({
          isPageFullscreen: true,
          isCanvasFullscreen: false
        });
        // Добавляем класс для body чтобы сбросить все отступы
        document.body.classList.add('page-fullscreen');
      } else {
        // Отдельный элемент в fullscreen (CanvasFullScreen)
        setFullscreenState({
          isPageFullscreen: false,
          isCanvasFullscreen: true
        });
        // Убираем класс для body
        document.body.classList.remove('page-fullscreen');
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Проверяем начальное состояние
    handleFullscreenChange();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      // Убираем класс при размонтировании компонента
      document.body.classList.remove('page-fullscreen');
    };
  }, []);

  // === Если canvas в fullscreen (CanvasFullScreen) → 100vh ===
  if (fullscreenState.isCanvasFullscreen) {
    return {
      height: "100vh",
      width: "100%",
      marginTop: "0",
      marginLeft: "0",
      marginRight: "0",
      marginBottom: "0"
    };
  }

  // === Если вся страница в fullscreen (ToggleFullScreen) → используем те же calc() что и обычно ===
  if (fullscreenState.isPageFullscreen) {
    // Получаем текущие стили для экрана
    let currentStyle = stylesByBreakpoint.default || {};

    if (windowWidth <= 768 && stylesByBreakpoint["768"]) {
      currentStyle = { ...currentStyle, ...stylesByBreakpoint["768"] };
    } else if (windowWidth <= 1020 && stylesByBreakpoint["1020"]) {
      currentStyle = { ...currentStyle, ...stylesByBreakpoint["1020"] };
    }

    // Возвращаем те же стили, что и в обычном режиме
    return currentStyle;
  }

  // === Обычные брейкпоинты ===
  let currentStyle = stylesByBreakpoint.default || {};

  if (windowWidth <= 768 && stylesByBreakpoint["768"]) {
    currentStyle = { ...currentStyle, ...stylesByBreakpoint["768"] };
  } else if (windowWidth <= 1020 && stylesByBreakpoint["1020"]) {
    currentStyle = { ...currentStyle, ...stylesByBreakpoint["1020"] };
  }

  return currentStyle;
}