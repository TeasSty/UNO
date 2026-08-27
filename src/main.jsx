import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyEarlyPageScrollReset } from './scrollReset.js'

applyEarlyPageScrollReset()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

applyEarlyPageScrollReset()
