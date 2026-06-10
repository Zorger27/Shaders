import { createSlice } from '@reduxjs/toolkit';

const initialState = [
  {
    id: 1,
    title: 'React',
    version: '19.2.7',
    url: 'https://react.dev',
  },
  {
    id: 2,
    title: "Three.js",
    version: "184.0",
    url: "https://github.com/mrdoob/three.js/releases"
  },
  {
    id: 3,
    title: "Three.js Shading Language (TSL)",
    version: "",
    url: "https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language"
  },
  {
    id: 4,
    title: "React Three Fiber",
    version: "9.6.1",
    url: "https://r3f.docs.pmnd.rs/getting-started/introduction"
  },
  {
    id: 5,
    title: "React Three Drei",
    version: "10.7.7",
    url: "https://drei.docs.pmnd.rs/getting-started/introduction"
  },
  {
    id: 6,
    title: 'React Router',
    version: '7.17.0',
    url: 'https://reactrouter.com',
  },
  {
    id: 7,
    title: 'Redux Toolkit',
    version: '2.12.0',
    url: 'https://redux-toolkit.js.org',
  },
  {
    id: 8,
    title: 'Vite',
    version: '8.0.16',
    url: 'https://vitejs.dev',
  },
  {
    id: 9,
    title: 'React i18next',
    version: '17.0.8',
    url: 'https://react.i18next.com',
  },
  {
    id: 10,
    title: "jsPDF",
    version: "4.2.1",
    url: "https://www.npmjs.com/package/jspdf"
  },
  {
    id: 11,
    title: "HTML5",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Learn/HTML/Introduction_to_HTML"
  },
  {
    id: 12,
    title: "CSS3",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Learn/CSS/First_steps"
  },
  {
    id: 13,
    title: "SASS",
    version: "1.100.0",
    url: "https://sass-lang.com"
  },
  {
    id: 14,
    title: "FlexBox CSS",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Learn/CSS/CSS_layout/Flexbox"
  },
  {
    id: 15,
    title: "Grid CSS",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Web/CSS/CSS_grid_layout"
  },
  {
    id: 16,
    title: "JavaScript",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Learn/JavaScript"
  },
  {
    id: 17,
    title: "Markdown",
    version: "",
    url: "https://www.markdownguide.org"
  },
  {
    id: 18,
    title: "Font Awesome",
    version: "7.1.0",
    url: "https://fontawesome.com"
  },
  {
    id: 19,
    title: "Google Search Console",
    version: "",
    url: "https://search.google.com/search-console"
  },
  {
    id: 20,
    title: "Google Analytics",
    version: "4.0",
    url: "https://analytics.google.com"
  },
  {
    id: 21,
    title: "Open Graph protocol",
    version: "",
    url: "https://ogp.me"
  },
  {
    id: 22,
    title: "Favicon",
    version: "",
    url: "https://developer.mozilla.org/en-US/docs/Glossary/Favicon"
  },
  {
    id: 23,
    title: "Sitemap",
    version: "",
    url: "https://www.sitemaps.org"
  },
  {
    id: 24,
    title: "Robots.txt",
    version: "",
    url: "https://developers.google.com/search/docs/crawling-indexing/robots/intro"
  },
];

const infoSlice = createSlice({
  name: 'info',
  initialState,
  reducers: {},
});

export default infoSlice.reducer;
