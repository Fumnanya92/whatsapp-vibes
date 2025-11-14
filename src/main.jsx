import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA (vite-plugin-pwa will generate sw.js).
// Use Vite base so the service worker is registered under the mounted path
// (e.g. /chat/sw.js when base is /chat/ in production).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swPath, { scope: import.meta.env.BASE_URL });
  });
}
