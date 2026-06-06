import { useEffect, useMemo } from "react";

export default function MetaTags({ mainTitle, metaTags = [] }) {
  // Мемоизируем metaTags для стабильности ссылок
  const memoizedMetaTags = useMemo(() => metaTags, [JSON.stringify(metaTags)]);

  useEffect(() => {
    // --- Title ---
    let pageTitle = document.querySelector("title");
    if (pageTitle) {
      pageTitle.innerText = mainTitle;
    } else {
      const newTitleTag = document.createElement("title");
      newTitleTag.innerText = mainTitle;
      document.head.appendChild(newTitleTag);
    }

    // --- Meta ---
    const createdTags = [];

    memoizedMetaTags.forEach((metaTag) => {
      // Удаляем старые мета-теги с тем же property или name
      const selectorParts = [];
      if (metaTag.property) selectorParts.push(`[property="${metaTag.property}"]`);
      if (metaTag.name) selectorParts.push(`[name="${metaTag.name}"]`);

      if (selectorParts.length > 0) {
        const existing = document.querySelectorAll(selectorParts.join(","));
        existing.forEach((tag) => tag.remove());
      }

      // Создаём новый тег
      const meta = document.createElement("meta");
      if (metaTag.property) meta.setAttribute("property", metaTag.property);
      if (metaTag.name) meta.setAttribute("name", metaTag.name);
      meta.setAttribute("content", metaTag.content);

      document.head.appendChild(meta);
      createdTags.push(meta);
    });

    // --- Очистка при размонтировании ---
    return () => {
      createdTags.forEach((tag) => tag.remove());
    };
  }, [mainTitle, memoizedMetaTags]);

  return null;
}