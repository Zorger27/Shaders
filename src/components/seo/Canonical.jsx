import { useEffect } from "react";

export default function Canonical({ url }) {
  useEffect(() => {
    // Удаляем старый canonical, если есть
    const existing = document.querySelector('link[rel="canonical"]');
    if (existing) existing.remove();

    // Создаём новый
    const link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", url);
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [url]);

  return null;
}
