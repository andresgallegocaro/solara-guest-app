import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GuestApp from './pages/GuestApp'
import AdminPanel from './pages/AdminPanel'
import OwnerPortal from './pages/OwnerPortal'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guest" element={<GuestApp />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/owner" element={<OwnerPortal />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
