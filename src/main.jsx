import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GuestApp from './pages/GuestApp'
import AdminPanel from './pages/AdminPanel'
import Home from './pages/Home'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Página de inicio — elige si eres huésped o admin */}
        <Route path="/" element={<Home />} />

        {/* Guest App — el huésped abre: /guest?id=RES-001 */}
        <Route path="/guest" element={<GuestApp />} />

        {/* Panel de administración — solo para ti */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
