import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.scss';
import '@/assets/style/fontawesome-free-7.1.0/css/all.min.css';
import '@/i18n';

import { Provider } from 'react-redux';
import store from '@/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);