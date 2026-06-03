import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BookingsApp from './BookingsApp'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BookingsApp />
  </StrictMode>,
)
