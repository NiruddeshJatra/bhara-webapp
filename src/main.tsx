import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global window type declaration for access token
declare global {
  interface Window {
    __accessToken__: string | null;
  }
}

// Initialize global variable
window.__accessToken__ = null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
