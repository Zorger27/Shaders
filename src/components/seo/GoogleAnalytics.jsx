import { useEffect } from "react";

export default function GoogleAnalytics({ id }) {
  useEffect(() => {
    if (!id) return;

    // Проверяем, не подключён ли уже gtag.js
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${id}"]`)) {
      const gaScript = document.createElement("script");
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      gaScript.async = true;
      document.head.appendChild(gaScript);
    }

    // Создаём и инициализируем через window
    const inlineScript = document.createElement("script");
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      
      gtag('config', '${id}');
    `;
    document.head.appendChild(inlineScript);

    return () => {
      inlineScript.remove();
    };
  }, [id]);

  return null;
}