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
    title: "React Three Fiber",
    version: "9.6.1",
    url: "https://r3f.docs.pmnd.rs/getting-started/introduction"
  },
  {
    id: 4,
    title: 'React Router',
    version: '7.17.0',
    url: 'https://reactrouter.com',
  },
  {
    id: 5,
    title: 'Redux Toolkit',
    version: '2.12.0',
    url: 'https://redux-toolkit.js.org',
  },
  {
    id: 6,
    title: 'Vite',
    version: '8.0.16',
    url: 'https://vitejs.dev',
  },
  {
    id: 7,
    title: 'React i18next',
    version: '17.0.8',
    url: 'https://react.i18next.com',
  },
  {
    id: 8,
    title: "jsPDF",
    version: "4.2.1",
    url: "https://www.npmjs.com/package/jspdf"
  },
  {
    id: 9,
    title: "HTML5",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Learn/HTML/Introduction_to_HTML"
  },
  {
    id: 10,
    title: "CSS3",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Learn/CSS/First_steps"
  },
  {
    id: 11,
    title: "SASS",
    version: "1.100.0",
    url: "https://sass-lang.com"
  },
  {
    id: 12,
    title: "FlexBox CSS",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Learn/CSS/CSS_layout/Flexbox"
  },
  {
    id: 13,
    title: "Grid CSS",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Web/CSS/CSS_grid_layout"
  },
  {
    id: 14,
    title: "JavaScript",
    version: "",
    url: "https://developer.mozilla.org/ru/docs/Learn/JavaScript"
  },
  {
    id: 15,
    title: "Markdown",
    version: "",
    url: "https://www.markdownguide.org"
  },
  {
    id: 16,
    title: "Font Awesome",
    version: "7.1.0",
    url: "https://fontawesome.com"
  },
  {
    id: 17,
    title: "Google Search Console",
    version: "",
    url: "https://search.google.com/search-console"
  },
  {
    id: 18,
    title: "Google Analytics",
    version: "4.0",
    url: "https://analytics.google.com"
  },
  {
    id: 19,
    title: "Open Graph protocol",
    version: "",
    url: "https://ogp.me"
  },
  {
    id: 20,
    title: "Favicon",
    version: "",
    url: "https://developer.mozilla.org/en-US/docs/Glossary/Favicon"
  },
  {
    id: 21,
    title: "Sitemap",
    version: "",
    url: "https://www.sitemaps.org"
  },
  {
    id: 22,
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
