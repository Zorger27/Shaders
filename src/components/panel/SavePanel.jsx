import React, { useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import jsPDF from "jspdf";
import '@/components/panel/SavePanel.scss';

/**
 * Универсальная панель сохранения 3D-сцены
 *
 * @param {Object} props
 * @param {React.RefObject} props.canvasRef - ref на Canvas контейнер
 * @param {string} props.projectTitle - Заголовок проекта (например, "Cube Forge")
 * @param {boolean} props.isRecording - Флаг записи видео (опционально)
 * @param {Function} props.onRecordingChange - Callback для изменения состояния записи (опционально)
 */
const SavePanel = ({
                     canvasRef,
                     projectTitle,
                     footerText,
                     siteUrl,
                     isRecording = false,
                     onRecordingChange = null,
                     isOpen = false,
                     onToggle = null
                   }) => {
  const { t } = useTranslation();

  const isSaveMenuOpen = isOpen;
  const [internalIsRecording, setInternalIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Используем внешнее или внутреннее состояние записи
  const recordingState = onRecordingChange !== null ? isRecording : internalIsRecording;
  const setRecordingState = onRecordingChange !== null ? onRecordingChange : setInternalIsRecording;

  // === Получение метаданных для сохранения ===
  const getSaveMetadata = () => {
    const title = projectTitle || t('home.name');
    const dateTime = new Date().toLocaleString();
    const footer = footerText || t('footer.socialSharing.tweetText');
    const site = siteUrl || "https://Zorin.Expert";
    return { title, dateTime, footer, site };
  };

  // === Функция загрузки шрифта для PDF ===
  const loadFont = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Не удалось загрузить шрифт: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  };

  // === Сохранение как JPG (белый фон) ===
  const saveAsJPG = () => {
    if (!canvasRef.current) {
      console.error("Ошибка: Canvas контейнер не инициализирован");
      return;
    }

    // Получаем canvas element из react-three-fiber
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) {
      console.error("Ошибка: Canvas element не найден");
      return;
    }

    // Ждём следующий кадр, чтобы canvas точно отрендерился
    requestAnimationFrame(() => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      // Определение мобильного режима
      const isMobile = window.innerWidth < 768;

      // Коэффициент масштабирования
      const scaleFactor = isMobile ? 1.2 : 1.0;
      let baseFontSize = Math.floor(canvas.width * 0.045 * scaleFactor);
      const smallFontSize = Math.floor(baseFontSize * 0.7);
      let footerFontSize = Math.floor(baseFontSize * 0.6);
      const padding = Math.floor(baseFontSize * 1.1);

      // Система отступов
      const topMargin = padding * (isMobile ? 2.0 : 1.2);
      const titleDateSpacing = padding * (isMobile ? 1.0 : 0.9);
      const footerSiteSpacing = padding * (isMobile ? 0.8 : 0.7);
      const bottomMargin = padding * (isMobile ? 1.0 : 0.5);

      const canvasWidth = canvas.width + padding * 2;
      const canvasHeight = canvas.height + topMargin + titleDateSpacing + footerSiteSpacing + bottomMargin;

      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;

      tempCtx.fillStyle = "white";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, padding, topMargin + titleDateSpacing);

      const { title, dateTime, footer, site } = getSaveMetadata();

      // Функция для динамического подбора размера шрифта
      const adjustFontSize = (text, maxWidth, initialFontSize) => {
        let fontSize = initialFontSize;
        do {
          tempCtx.font = `bold ${fontSize}px Arial`;
          if (tempCtx.measureText(text).width <= maxWidth) {
            return fontSize;
          }
          fontSize--;
        } while (fontSize > 10);
        return fontSize;
      };

      // Подбор размера шрифта для каждого текста
      baseFontSize = adjustFontSize(title, tempCanvas.width * 0.9, baseFontSize);
      footerFontSize = adjustFontSize(footer, tempCanvas.width * 0.9, footerFontSize);
      const siteFontSize = adjustFontSize(site, tempCanvas.width * 0.9, footerFontSize);

      // 📌 Заголовок (зелёный)
      tempCtx.font = `bold ${baseFontSize}px Arial`;
      tempCtx.fillStyle = "green";
      tempCtx.textAlign = "center";
      tempCtx.fillText(title, tempCanvas.width / 2, topMargin);

      // 📅 Дата (голубая)
      tempCtx.font = `normal ${smallFontSize}px Arial`;
      tempCtx.fillStyle = "dodgerblue";
      tempCtx.fillText(dateTime, tempCanvas.width / 2, topMargin + titleDateSpacing);

      // 🔽 Footer (розовый)
      const footerY = tempCanvas.height - footerSiteSpacing - bottomMargin;
      tempCtx.font = `normal ${footerFontSize}px Arial`;
      tempCtx.fillStyle = "deeppink";
      tempCtx.fillText(footer, tempCanvas.width / 2, footerY);

      // 📅 Сайт (синий)
      tempCtx.font = `italic ${siteFontSize}px Arial`;
      tempCtx.fillStyle = "blue";
      tempCtx.fillText(site, tempCanvas.width / 2, footerY + footerSiteSpacing);

      const image = tempCanvas.toDataURL("image/jpeg", 0.99);
      const link = document.createElement("a");
      link.href = image;
      link.download = "Scene.jpg";
      link.click();

      if (onToggle) onToggle(false);
    });
  };

  // === Сохранение как PNG (прозрачный фон) ===
  const saveAsPNG = () => {
    if (!canvasRef.current) {
      console.error("Ошибка: Canvas контейнер не инициализирован");
      return;
    }

    // Получаем canvas element из react-three-fiber
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) {
      console.error("Ошибка: Canvas element не найден");
      return;
    }

    // Ждём следующий кадр, чтобы canvas точно отрендерился
    requestAnimationFrame(() => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      // Определение мобильного режима
      const isMobile = window.innerWidth < 768;

      // Коэффициент масштабирования
      const scaleFactor = isMobile ? 1.2 : 1.0;
      let baseFontSize = Math.floor(canvas.width * 0.045 * scaleFactor);
      const smallFontSize = Math.floor(baseFontSize * 0.7);
      let footerFontSize = Math.floor(baseFontSize * 0.6);
      const padding = Math.floor(baseFontSize * 1.1);

      // Система отступов
      const topMargin = padding * (isMobile ? 2.0 : 1.2);
      const titleDateSpacing = padding * (isMobile ? 1.0 : 0.9);
      const footerSiteSpacing = padding * (isMobile ? 0.8 : 0.7);
      const bottomMargin = padding * (isMobile ? 1.0 : 0.5);

      const canvasWidth = canvas.width + padding * 2;
      const canvasHeight = canvas.height + topMargin + titleDateSpacing + footerSiteSpacing + bottomMargin;

      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;

      tempCtx.drawImage(canvas, padding, topMargin + titleDateSpacing);

      const { title, dateTime, footer, site } = getSaveMetadata();

      // Функция для динамического подбора размера шрифта
      const adjustFontSize = (text, maxWidth, initialFontSize) => {
        let fontSize = initialFontSize;
        do {
          tempCtx.font = `bold ${fontSize}px Arial`;
          if (tempCtx.measureText(text).width <= maxWidth) {
            return fontSize;
          }
          fontSize--;
        } while (fontSize > 10);
        return fontSize;
      };

      // Подбор размера шрифта для каждого текста
      baseFontSize = adjustFontSize(title, tempCanvas.width * 0.9, baseFontSize);
      footerFontSize = adjustFontSize(footer, tempCanvas.width * 0.9, footerFontSize);
      const siteFontSize = adjustFontSize(site, tempCanvas.width * 0.9, footerFontSize);

      // 📌 Заголовок (зелёный)
      tempCtx.font = `bold ${baseFontSize}px Arial`;
      tempCtx.fillStyle = "green";
      tempCtx.textAlign = "center";
      tempCtx.fillText(title, tempCanvas.width / 2, topMargin);

      // 📅 Дата (голубая)
      tempCtx.font = `normal ${smallFontSize}px Arial`;
      tempCtx.fillStyle = "dodgerblue";
      tempCtx.fillText(dateTime, tempCanvas.width / 2, topMargin + titleDateSpacing);

      // 🔽 Footer (розовый)
      const footerY = tempCanvas.height - footerSiteSpacing - bottomMargin;
      tempCtx.font = `normal ${footerFontSize}px Arial`;
      tempCtx.fillStyle = "deeppink";
      tempCtx.fillText(footer, tempCanvas.width / 2, footerY);

      // 📅 Сайт (синий)
      tempCtx.font = `italic ${siteFontSize}px Arial`;
      tempCtx.fillStyle = "blue";
      tempCtx.fillText(site, tempCanvas.width / 2, footerY + footerSiteSpacing);

      // 📸 Сохранение в PNG
      const image = tempCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "Scene.png";
      link.click();

      if (onToggle) onToggle(false);
    });
  };

  // === Сохранение как PDF ===
  const saveAsPDF = async () => {
    // === 1. Проверка доступности контейнера ===
    if (!canvasRef.current) {
      console.error("Ошибка: Canvas контейнер не инициализирован");
      return;
    }

    // === 2. Получение canvas элемента из React Three Fiber ===
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) {
      console.error("Ошибка: Canvas element не найден");
      return;
    }

    // === 3. Загрузка всех необходимых шрифтов ===
    let fontRegularBuffer, fontMediumBuffer, fontItalicBuffer;
    try {
      fontRegularBuffer = await loadFont('/fonts/Roboto-Regular.ttf');
      fontMediumBuffer  = await loadFont('/fonts/Roboto-Medium.ttf');
      fontItalicBuffer  = await loadFont('/fonts/Roboto-Italic.ttf');
    } catch (error) {
      console.error("Ошибка загрузки шрифта:", error);
      alert("Не удалось загрузить шрифт для PDF");
      return;
    }

    // === 4. Конвертация шрифтов в Base64 для jsPDF ===
    const fontRegularBase64 = btoa(
      new Uint8Array(fontRegularBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const fontMediumBase64 = btoa(
      new Uint8Array(fontMediumBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const fontItalicBase64 = btoa(
      new Uint8Array(fontItalicBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // === 5. Ожидание рендера canvas перед копированием ===
    requestAnimationFrame(() => {
      // === 6. Создание временного canvas для композиции ===
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
      const { width, height } = canvas;

      // === 7. Расчёт размеров и отступов (как в JPG) ===
      const isMobile = window.innerWidth < 768;
      const scaleFactor = isMobile ? 1.2 : 1.0;

      let baseFontSize = Math.floor(width * 0.045 * scaleFactor);
      const smallFontSize = Math.floor(baseFontSize * 0.7);
      let footerFontSize = Math.floor(baseFontSize * 0.6);
      const padding = Math.floor(baseFontSize * 1.1);

      const topMargin = padding * (isMobile ? 2.0 : 1.2);
      const titleDateSpacing = padding * (isMobile ? 1.0 : 0.9);
      const footerSiteSpacing = padding * (isMobile ? 0.8 : 0.7);
      const bottomMargin = padding * (isMobile ? 1.0 : 0.5);

      const canvasWidth = width + padding * 2;
      const canvasHeight = height + topMargin + titleDateSpacing + footerSiteSpacing + bottomMargin;

      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;

      // === 8. Заливка белым фоном ===
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // === 9. Копирование 3D сцены на временный canvas ===
      ctx.drawImage(canvas, padding, topMargin + titleDateSpacing);

      // === 10. Конвертация в JPEG для вставки в PDF ===
      const image = tempCanvas.toDataURL("image/jpeg", 0.99);

      // === 11. Создание PDF с размерами идентичными JPG ===
      // Переводим пиксели в миллиметры (1px ≈ 0.264583mm при 96 DPI)
      const pxToMm = 0.264583;
      const pdfWidth = canvasWidth * pxToMm;
      const pdfHeight = canvasHeight * pxToMm;

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      // === 12. Регистрация шрифтов в jsPDF ===
      pdf.addFileToVFS('Roboto-Regular.ttf', fontRegularBase64);
      pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

      pdf.addFileToVFS('Roboto-Medium.ttf', fontMediumBase64);
      pdf.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');

      pdf.addFileToVFS('Roboto-Italic.ttf', fontItalicBase64);
      pdf.addFont('Roboto-Italic.ttf', 'Roboto', 'italic');

      pdf.setFont('Roboto', 'normal');

      // === 13. Получение метаданных для текста ===
      const { title, dateTime, footer, site } = getSaveMetadata();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // === 14. Вставка изображения на всю страницу ===
      pdf.addImage(image, "JPEG", 0, 0, pageWidth, pageHeight);

      // === 15. Функция для динамического подбора размера шрифта ===
      const adjustFontSize = (text, maxWidth, initialFontSize) => {
        let fontSize = initialFontSize;
        do {
          pdf.setFontSize(fontSize);
          if (pdf.getTextWidth(text) <= maxWidth) {
            return fontSize;
          }
          fontSize--;
        } while (fontSize > 10);
        return fontSize;
      };

      // === 16. Конвертация размеров шрифтов из пикселей в пункты ===
      // 1px = 0.75pt (стандартное соотношение при 96 DPI)
      const pxToPt = 0.75;

      // === 17. Подбор оптимальных размеров шрифтов ===
      const finalBaseFontSize = adjustFontSize(title, pageWidth * 0.9, baseFontSize * pxToPt);
      const finalSmallFontSize = smallFontSize * pxToPt;
      const finalFooterFontSize = adjustFontSize(footer, pageWidth * 0.9, footerFontSize * pxToPt);
      const finalSiteFontSize = adjustFontSize(site, pageWidth * 0.9, footerFontSize * pxToPt);

      // === 18. Конвертация отступов в миллиметры ===
      const topMarginMm = topMargin * pxToMm;
      const titleDateSpacingMm = titleDateSpacing * pxToMm;
      const footerSiteSpacingMm = footerSiteSpacing * pxToMm;
      const bottomMarginMm = bottomMargin * pxToMm;

      // === 19. Добавление текстовых элементов ===

      // 📌 Заголовок (зелёный, жирный - Roboto Medium)
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(finalBaseFontSize);
      pdf.setTextColor(0, 128, 0);
      pdf.text(title, pageWidth / 2, topMarginMm, { align: "center" });

      // 📅 Дата и время (голубая, обычная)
      pdf.setFont('Roboto', 'normal');
      pdf.setFontSize(finalSmallFontSize);
      pdf.setTextColor(30, 144, 255);
      pdf.text(dateTime, pageWidth / 2, topMarginMm + titleDateSpacingMm, { align: "center" });

      // 🔽 Footer текст (розовый, обычная)
      const footerY = pageHeight - footerSiteSpacingMm - bottomMarginMm;
      pdf.setFont('Roboto', 'normal');
      pdf.setFontSize(finalFooterFontSize);
      pdf.setTextColor(255, 105, 180);
      pdf.text(footer, pageWidth / 2, footerY, { align: "center" });

      // 🌐 Сайт (синий, курсив)
      pdf.setFont("Roboto", "italic");
      pdf.setTextColor(0, 0, 255);
      pdf.setFontSize(finalSiteFontSize);
      pdf.text(site, pageWidth / 2, footerY + footerSiteSpacingMm, { align: "center" });

      // === 20. Сохранение PDF файла ===
      pdf.save("Scene.pdf");

      if (onToggle) onToggle(false);
    });
  };

  // === Начать запись видео ===
  const startRecording = () => {
    // 1. Проверка доступности контейнера
    if (!canvasRef.current) {
      console.error("Ошибка: Canvas контейнер не инициализирован");
      return;
    }

    // 2. Получение canvas элемента из React Three Fiber
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) {
      console.error("Ошибка: Canvas element не найден");
      return;
    }

    // 3. Расчёт размеров с учётом текста и отступов (как в JPG)
    const isMobile = window.innerWidth < 768;
    const scaleFactor = isMobile ? 1.2 : 1.0;

    let baseFontSize = Math.floor(canvas.width * 0.045 * scaleFactor);
    const smallFontSize = Math.floor(baseFontSize * 0.7);
    let footerFontSize = Math.floor(baseFontSize * 0.6);
    const padding = Math.floor(baseFontSize * 1.1);

    const topMargin = padding * (isMobile ? 2.0 : 1.2);
    const titleDateSpacing = padding * (isMobile ? 1.0 : 0.9);
    const footerSiteSpacing = padding * (isMobile ? 0.8 : 0.7);
    const bottomMargin = padding * (isMobile ? 1.0 : 0.5);

    // 4. Создание canvas с правильными размерами (включая текст)
    const streamCanvas = document.createElement("canvas");
    const streamCtx = streamCanvas.getContext("2d");
    streamCanvas.width = canvas.width + padding * 2;
    streamCanvas.height = canvas.height + topMargin + titleDateSpacing + footerSiteSpacing + bottomMargin;

    // 5. Создание видео-потока из canvas (60 FPS)
    const stream = streamCanvas.captureStream(60);

    // 6. Функция отрисовки каждого кадра видео
    const drawFrame = () => {
      // Заливка белым фоном
      streamCtx.fillStyle = "white";
      streamCtx.fillRect(0, 0, streamCanvas.width, streamCanvas.height);

      // Копируем 3D сцену с отступами (как в JPG)
      streamCtx.drawImage(canvas, padding, topMargin + titleDateSpacing);

      const { title, dateTime, footer, site } = getSaveMetadata();

      // Функция для динамического подбора размера шрифта
      const adjustFontSize = (text, maxWidth, initialFontSize) => {
        let fontSize = initialFontSize;
        do {
          streamCtx.font = `bold ${fontSize}px Arial`;
          if (streamCtx.measureText(text).width <= maxWidth) {
            return fontSize;
          }
          fontSize--;
        } while (fontSize > 10);
        return fontSize;
      };

      // Подбор размера шрифта для каждого текста
      baseFontSize = adjustFontSize(title, streamCanvas.width * 0.9, baseFontSize);
      footerFontSize = adjustFontSize(footer, streamCanvas.width * 0.9, footerFontSize);
      const siteFontSize = adjustFontSize(site, streamCanvas.width * 0.9, footerFontSize);

      // 📌 Заголовок (зелёный, жирный)
      streamCtx.font = `bold ${baseFontSize}px Arial`;
      streamCtx.fillStyle = "green";
      streamCtx.textAlign = "center";
      streamCtx.fillText(title, streamCanvas.width / 2, topMargin);

      // 📅 Дата (голубая)
      streamCtx.font = `normal ${smallFontSize}px Arial`;
      streamCtx.fillStyle = "dodgerblue";
      streamCtx.fillText(dateTime, streamCanvas.width / 2, topMargin + titleDateSpacing);

      // 🔽 Footer (розовый)
      const footerY = streamCanvas.height - footerSiteSpacing - bottomMargin;
      streamCtx.font = `normal ${footerFontSize}px Arial`;
      streamCtx.fillStyle = "deeppink";
      streamCtx.fillText(footer, streamCanvas.width / 2, footerY);

      // 🌐 Сайт (синий, курсив)
      streamCtx.font = `italic ${siteFontSize}px Arial`;
      streamCtx.fillStyle = "blue";
      streamCtx.fillText(site, streamCanvas.width / 2, footerY + footerSiteSpacing);

      // Продолжаем запись следующего кадра
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    // 7. Определение поддерживаемого формата видео
    let mimeType;
    let isMP4 = false;

    // Проверка Safari (предпочитаем MP4)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && MediaRecorder.isTypeSupported("video/mp4")) {
      mimeType = "video/mp4";
      isMP4 = true;
      console.log("🎬 Safari обнаружен! Используем MP4.");
    } else if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9")) {
      mimeType = "video/webm; codecs=vp9";
    } else if (MediaRecorder.isTypeSupported("video/webm; codecs=vp8")) {
      mimeType = "video/webm; codecs=vp8";
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      mimeType = "video/mp4";
      isMP4 = true;
    } else {
      console.error("⛔ Ваш браузер не поддерживает запись видео.");
      alert("Запись видео не поддерживается в этом браузере");
      return;
    }

    // 8. Создание MediaRecorder для записи потока
    try {
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
    } catch (error) {
      console.error("Ошибка создания MediaRecorder:", error);
      alert("Не удалось начать запись видео");
      return;
    }

    // 9. Обработчик получения данных
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    // 10. Обработчик завершения записи
    mediaRecorderRef.current.onstop = () => saveVideo(isMP4);

    // 11. Очистка буфера
    recordedChunksRef.current = [];

    // 12. ЖДЁМ один кадр, чтобы canvas гарантированно отрендерился
    requestAnimationFrame(() => {
      // Отрисовываем первый кадр
      drawFrame();

      // Ждём ещё один кадр для надёжности
      requestAnimationFrame(() => {
        // Теперь запускаем запись - первый кадр уже готов!
        mediaRecorderRef.current.start();
        setRecordingState(true);

        console.log(`🎥 Запись видео началась! Формат: ${isMP4 ? 'MP4' : 'WebM'}`);
      });
    });
  };

  // === Остановить запись видео ===
  const stopRecording = () => {
    // 1. Остановка MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // 2. Остановка отрисовки кадров
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 3. Обновление состояния
    setRecordingState(false);
    if (onToggle) onToggle(false);

    console.log("🛑 Запись видео остановлена!");
  };

  // === Сохранить видео ===
  const saveVideo = (isMP4Format) => {
    // 1. Проверка наличия записанных данных
    if (recordedChunksRef.current.length === 0) {
      console.warn("⚠️ Нет записанных данных!");
      return;
    }

    // 2. Определение типа видео и расширения
    const mimeType = isMP4Format ? "video/mp4" : "video/webm";
    const extension = isMP4Format ? "mp4" : "webm";

    // 3. Создание Blob из записанных фрагментов
    const blob = new Blob(recordedChunksRef.current, { type: mimeType });
    const url = URL.createObjectURL(blob);

    // 4. Создание ссылки для скачивания
    const link = document.createElement("a");
    link.href = url;
    link.download = `Scene.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 5. Освобождение памяти
    URL.revokeObjectURL(url);
    recordedChunksRef.current = [];

    console.log(`💾 Видео сохранено как Scene.${extension}!`);
  };

  return (
    <div className="save-buttons">
      {/* Главная кнопка */}
      <button
        className={`main-save-button ${isSaveMenuOpen ? 'open' : ''}`}
        onClick={recordingState ? '' : () => {
          if (onToggle) onToggle(!isSaveMenuOpen);
        }}
        title={isSaveMenuOpen ? t('save.closeSaveData') : t('save.saveData')}
      >
        <i className={`main-save-icon fas ${isSaveMenuOpen ? 'fa-times' : 'fa-save'}`}></i>
        <span className="main-save-text">{t('save.title')}</span>
      </button>

      {/* Подменю с кнопками */}
      <div className={`save-submenu ${isSaveMenuOpen ? 'open' : ''}`}>
        <button onClick={saveAsJPG} title={t('save.saveJPG')}>
          <i className="fas fa-camera"></i>
        </button>
        <button onClick={saveAsPNG} title={t('save.savePNG')}>
          <i className="fas fa-file-image"></i>
        </button>
        <button onClick={saveAsPDF} title={t('save.savePDF')}>
          <i className="fas fa-file-pdf"></i>
        </button>
        <button
          className={`film-start ${recordingState ? 'film-stop recording' : ''}`}
          onClick={recordingState ? stopRecording : startRecording}
          title={recordingState ? t('save.stopVideo') : t('save.startVideo')}
        >
          <i className={`fas ${recordingState ? 'fa-stop-circle' : 'fa-film'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default SavePanel;