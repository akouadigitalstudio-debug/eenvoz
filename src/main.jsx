import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EenVozApp from './components/EenVozApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EenVozApp />
  </StrictMode>,
)
