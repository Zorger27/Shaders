import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "@/components/util/DocFullScreen.scss";

export default function DocFullScreen({ className = "", style }) {
  const { t } = useTranslation();
  const [docFullscreen, setDocFullscreen] = useState(false);

  // Проверка состояния при изменении fullscreen
  const docFullScreenChange = useCallback(() => {
    setDocFullscreen(
      !!(
        document.fullscreenElement ||
        document['mozFullScreenElement'] ||
        document['webkitFullscreenElement'] ||
        document['msFullscreenElement']
      )
    );
  }, []);

  // Вход в полноэкранный режим
  const enterDocFullScreen = useCallback(() => {
    const element = document.documentElement;

    if (
      !document.fullscreenElement &&
      !document['mozFullScreenElement'] &&
      !document['webkitFullscreenElement'] &&
      !document['msFullscreenElement']
    ) {
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((error) => {
          console.error('Enter fullscreen error:', error.message);
        });
      } else if (element['mozRequestFullScreen']) {
        element['mozRequestFullScreen']();
      } else if (element['webkitRequestFullscreen']) {
        element['webkitRequestFullscreen']();
      } else if (element['msRequestFullscreen']) {
        element['msRequestFullscreen']();
      }
    }
  }, []);

  // Выход из полноэкранного режима
  const exitDocFullScreen = useCallback(() => {
    if (
      document.fullscreenElement ||
      document['mozFullScreenElement'] ||
      document['webkitFullscreenElement'] ||
      document['msFullscreenElement']
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((error) => {
          console.error('Exit fullscreen error:', error.message);
        });
      } else if (document['mozCancelFullScreen']) {
        document['mozCancelFullScreen']();
      } else if (document['webkitExitFullscreen']) {
        document['webkitExitFullscreen']();
      } else if (document['msExitFullscreen']) {
        document['msExitFullscreen']();
      }
    }
  }, []);

  // Переключатель
  const toggleDocFullScreen = useCallback(() => {
    if (!docFullscreen) {
      enterDocFullScreen();
    } else {
      exitDocFullScreen();
    }
  }, [docFullscreen, enterDocFullScreen, exitDocFullScreen]);

  // Обработка клавиш (пробел и Backspace)
  const onKeyPress = useCallback(
    (event) => {
      if ((event.key === " " || event.key === "Backspace") && docFullscreen) {
        toggleDocFullScreen();
      }
    },
    [docFullscreen, toggleDocFullScreen]
  );

  // Подписка на события
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    document.addEventListener("fullscreenchange", docFullScreenChange);
    document.addEventListener("webkitfullscreenchange", docFullScreenChange);
    document.addEventListener("mozfullscreenchange", docFullScreenChange);
    document.addEventListener("MSFullscreenChange", docFullScreenChange);

    return () => {
      document.removeEventListener("keydown", onKeyPress);
      document.removeEventListener("fullscreenchange", docFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", docFullScreenChange);
      document.removeEventListener("mozfullscreenchange", docFullScreenChange);
      document.removeEventListener("MSFullscreenChange", docFullScreenChange);
    };
  }, [onKeyPress, docFullScreenChange]);

  return (
    <i
      onClick={toggleDocFullScreen}
      className={`doc-fullScreen-btn ${className}`.trim()}
      style={style}
      title={docFullscreen ? t("extra.closeFullScreen") : t("extra.toggleFullScreen")}
    >
      <span className={`fa ${docFullscreen ? "fa-compress-arrows-alt" : "fa-expand-arrows-alt"}`}></span>
    </i>
  );
}