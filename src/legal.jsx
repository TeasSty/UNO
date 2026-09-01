import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LegalDocument from './components/LegalDocument.jsx'

const variant = document.documentElement.dataset.legal

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LegalDocument variant={variant} />
  </StrictMode>,
)
