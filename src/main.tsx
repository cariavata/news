import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  const isViteError = (err: any) => {
    if (!err) return false;
    const str = String(err.message || err.reason || err);
    return (
      str.toLowerCase().includes('websocket') ||
      str.toLowerCase().includes('vite') ||
      str.toLowerCase().includes('hmr')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isViteError(event.reason)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    if (isViteError(event.error) || isViteError(event.message)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

