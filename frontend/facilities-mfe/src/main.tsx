import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FacilitiesApp from './FacilitiesApp'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FacilitiesApp />
  </StrictMode>,
)
