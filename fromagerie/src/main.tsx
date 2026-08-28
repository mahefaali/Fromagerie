import { createRoot } from 'react-dom/client'
import './globals.css'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/authentication/context/AuthProvider'


createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
