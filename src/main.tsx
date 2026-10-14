import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// In AI Studio preview / cloud iframe sandboxes, HMR WebSocket closures are benign.
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = event.reason?.message || String(event.reason || '');
  if (reasonStr.includes('WebSocket') || reasonStr.includes('closed without opened')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
