import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const C = {
  dark: '#47523e',
  med: '#919c89',
  gold: '#c9a84c',
  bg: '#f7f6f2',
  card: '#ffffff',
  border: 'rgba(0,0,0,0.08)',
  muted: '#888',
  text: '#1a1a1a',
  error: '#c0392b',
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      const data = await signIn(email, password)
      const role = data.user?.user_metadata?.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'owner') navigate('/owner')
      else navigate('/guest')
    } catch (err) {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: C.dark, letterSpacing: 4, margin: '0 0 4px' }}>SOLARA</p>
          <p style={{ fontSize: 11, color: C.med, letterSpacing: 2, margin: 0, textTransform: 'uppercase' }}>Luxury Hospitality</p>
        </div>

        {/* Card */}
        <div style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 16, padding: '28px 24px' }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: C.text, margin: '0 0 6px' }}>Acceso al portal</p>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 24px' }}>Introduce tus credenciales para continuar</p>

          {/* Error */}
          {error && (
            <div style={{ background: '#fdf0f0', border: '0.5px solid ' + C.error + '40', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.error, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid ' + C.border, borderRadius: 8, fontSize: 14, outline: 'none', background: C.bg, color: C.text, boxSizing: 'border-box' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid ' + C.border, borderRadius: 8, fontSize: 14, outline: 'none', background: C.bg, color: C.text, boxSizing: 'border-box' }}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{ width: '100%', padding: '12px', background: loading ? C.med : C.dark, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: loading ? 'default' : 'pointer' }}
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 20 }}>
          SOLARA Homes · hola@solarahomes.com.co
        </p>
      </div>
    </div>
  )
}
