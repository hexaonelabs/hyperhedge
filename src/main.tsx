import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AppKitProvider } from './providers/AppKitProvider.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { HyperliquidConfigProvider } from './contexts/HyperliquidConfigContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppKitProvider>
        <HyperliquidConfigProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </HyperliquidConfigProvider>
      </AppKitProvider>
    </BrowserRouter>
  </StrictMode>
);
