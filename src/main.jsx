import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Home from './pages/Home'
import GuestApp from './pages/GuestApp'
import AdminPanel from './pages/AdminPanel'
import OwnerPortal from './pages/OwnerPortal'
import LoyaltySystem from './LoyaltySystem'
import PricingEngine from './PricingEngine'
import Login from './pages/Login'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#47523e' }}>Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/guest" element={<GuestApp />} />
          <Route path="/guest/loyalty" element={<LoyaltySystem />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/owner" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <OwnerPortal />
            </ProtectedRoute>
          } />
          <Route path="/pricing" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PricingEngine />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
