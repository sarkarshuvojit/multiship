import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initWebSocket } from './ws/ws-middleware.ts';
import { store } from './app/store.ts';
import { Provider } from 'react-redux';

initWebSocket('ws://localhost:5000/ws', store);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
