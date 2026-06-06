export default function handler(req, res) {
  try {
    const siteUrl = process.env.VITE_SITE_URL;
    const [pathOnly, queryString] = (req.url || "/").split("?");
    const params = new URLSearchParams(queryString);
    let lang = params.get("lang");

    const acceptLang = req.headers["accept-language"] || "";

    // Если параметра нет — пробуем Accept-Language
    if (!lang) {
      if (acceptLang.startsWith("uk")) lang = "uk";
      else if (acceptLang.startsWith("es")) lang = "es";
      else lang = "en";
    }

    // Дефолт на английский
    if (!["en", "uk", "es"].includes(lang)) lang = "en";

    // Мэппинг языков для og:locale
    const localeMap = {
      en: "en_US",
      uk: "uk_UA",
      es: "es_ES"
    };

    // Автор проекта
    // const author = {
    //   name: "Anatolii Zorin",
    //   url: "https://zorin.expert",
    //   social: {
    //     github: "https://github.com/zorger27",
    //     linkedin: "https://www.linkedin.com/in/anatolii-zorin"
    //   }
    // };

    const translations = {
      home: {
        en: { title: "Shaders", desc: "Shaders — an interactive environment for learning, experimenting with, and visualizing Vertex and Fragment Shaders (created by Anatolii Zorin)" },
        uk: { title: "Shaders", desc: "Shaders — інтерактивне середовище для вивчення, експериментів і візуалізації Vertex та Fragment Shader’ів (створено Анатолієм Зоріним)" },
        es: { title: "Shaders", desc: "Shaders es un entorno interactivo para aprender, experimentar y visualizar Vertex y Fragment Shaders (creado por Anatolii Zorin)" }
      },
      project1: {
        en: { title: "Vertex Playground", desc: "An interactive environment for working with geometry, allowing real-time vertex deformation and object structure design (created by Anatolii Zorin)" },
        uk: { title: "Vertex Playground", desc: "Інтерактивне середовище для роботи з геометрією, де можна деформувати вершини та формувати структуру об’єктів у реальному часі (створено Анатолієм Зоріним)" },
        es: { title: "Vertex Playground", desc: "Un entorno interactivo para trabajar con geometría, que permite deformar vértices y diseñar estructuras de objetos en tiempo real (creado por Anatolii Zorin)" }
      },
      project2: {
        en: { title: "Fragment Lab", desc: "An experimental environment for working with pixels, colors, noise, textures, and post-processing effects (created by Anatolii Zorin)" },
        uk: { title: "Fragment Lab", desc: "Експериментальне середовище для роботи з пікселями, кольорами, шумами, текстурами та пост-ефектами (створено Анатолієм Зоріним)" },
        es: { title: "Fragment Lab", desc: "Un entorno experimental para trabajar con píxeles, colores, ruido, texturas y efectos de postprocesado (creado por Anatolii Zorin)" }
      },
      project3: {
        en: { title: "Uniform Control", desc: "A real-time shader parameter control panel with interactive sliders and dynamic values (created by Anatolii Zorin)" },
        uk: { title: "Uniform Control", desc: "Панель керування параметрами шейдера в реальному часі з інтерактивними слайдерами та динамічними значеннями (створено Анатолієм Зоріним)" },
        es: { title: "Uniform Control", desc: "Un panel de control de parámetros de shaders en tiempo real con deslizadores interactivos y valores dinámicos (creado por Anatolii Zorin)" }
      },
      project4: {
        en: { title: "Noise Field", desc: "A generative environment for exploring procedural noise and motion patterns based on Perlin and Simplex algorithms (created by Anatolii Zorin)" },
        uk: { title: "Noise Field", desc: "Генеративне середовище для дослідження процедурних шумів і патернів руху на основі алгоритмів Perlin і Simplex (створено Анатолієм Зоріним)" },
        es: { title: "Noise Field", desc: "Un entorno generativo para explorar ruido procedimental y patrones de movimiento basados en algoritmos Perlin y Simplex (creado por Anatolii Zorin)" }
      },
      project5: {
        en: { title: "Shader Viewer", desc: "A final rendering mode with a clean output view, free of UI elements, designed to showcase the result (created by Anatolii Zorin)" },
        uk: { title: "Shader Viewer", desc: "Режим фінальної візуалізації шейдера в чистому рендері без інтерфейсних елементів для демонстрації результату (створено Анатолієм Зоріним)" },
        es: { title: "Shader Viewer", desc: "Un modo de renderizado final con una vista limpia sin elementos de interfaz, diseñado para mostrar el resultado (creado por Anatolii Zorin)" }
      },
      about: {
        en: { title: "About", desc: "Detailed information about Shaders (created by Anatolii Zorin)" },
        uk: { title: "Про проект", desc: "Детальна інформація про Shaders (створено Анатолієм Зоріним)" },
        es: { title: "Sobre", desc: "Información detallada sobre Shaders (creado por Anatolii Zorin)" }
      },
      page404: {
        en: { title: "Page Not Found", desc: "Page 404 - page not found (created by Anatolii Zorin)" },
        uk: { title: "Сторінку не знайдено", desc: "Сторінка 404 - сторінку не знайдено (створено Анатолієм Зоріним)" },
        es: { title: "Página no encontrada", desc: "Página 404 - página no encontrada (creado por Anatolii Zorin)" }
      }
    };

    let key;
    let image;
    let pageUrl;

    const cleanPath = pathOnly.trim().replace(/\/+$/, "");

    if (cleanPath === "" || cleanPath === "/") {
      key = "home";
      image = `${siteUrl}/ogimage/home.jpg`;
      pageUrl = siteUrl;
    } else if (cleanPath === "/project1") {
      key = "project1";
      image = `${siteUrl}/ogimage/project1.jpg`;
      pageUrl = `${siteUrl}/project1`;
    } else if (cleanPath === "/project2") {
      key = "project2";
      image = `${siteUrl}/ogimage/project2.jpg`;
      pageUrl = `${siteUrl}/project2`;
    } else if (cleanPath === "/project3") {
      key = "project3";
      image = `${siteUrl}/ogimage/project3.jpg`;
      pageUrl = `${siteUrl}/project3`;
    } else if (cleanPath === "/project4") {
      key = "project4";
      image = `${siteUrl}/ogimage/project4.jpg`;
      pageUrl = `${siteUrl}/project4`;
    } else if (cleanPath === "/project5") {
      key = "project5";
      image = `${siteUrl}/ogimage/project5.jpg`;
      pageUrl = `${siteUrl}/project5`;
    } else if (cleanPath === "/about") {
      key = "about";
      image = `${siteUrl}/ogimage/about.jpg`;
      pageUrl = `${siteUrl}/about`;
    } else if (cleanPath === "/404") {
      key = "page404";
      image = `${siteUrl}/ogimage/404.jpg`;
      pageUrl = `${siteUrl}/404`;
    } else {
      // Всё остальное — 404
      key = "page404";
      image = `${siteUrl}/ogimage/404.jpg`;
      pageUrl = `${siteUrl}/404`;
    }

    const { title, desc } = translations[key][lang] || translations[key]["en"];
    const locale = localeMap[lang];

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${pageUrl}?lang=${lang}" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="${locale}" />
<meta property="og:site_name" content="${siteUrl}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${image}" />
<meta name="twitter:creator" content="@Regroz" />
<meta name="twitter:site" content="@Regroz" />
<meta name="author" content="Anatolii Zorin" />
<meta name="robots" content="index,follow" />
</head>
<body>
<h1>${title}</h1>
<p>${desc}</p>
</body>
</html>`;

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.end(html);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
}