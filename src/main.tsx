import '@seed-design/css/base.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { initSentry, sentryRootOptions } from './app/sentry';
import './app/styles/index.css';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!, sentryRootOptions).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
