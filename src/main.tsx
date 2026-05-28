import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { CreditsProvider } from './context/CreditsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CreditsProvider>
        <App />
      </CreditsProvider>
    </AuthProvider>
  </StrictMode>,
)
