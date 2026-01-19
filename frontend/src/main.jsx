import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import { usePlayerStore } from './store/usePlayerStore'

// Register service worker for PWA
registerSW({ immediate: true })

// PWA Install Prompt Logic
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  const { setDeferredPrompt } = usePlayerStore.getState();
  setDeferredPrompt(e);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
