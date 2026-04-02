import { useNavigate } from 'react-router-dom'
import { C } from '../config'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{
      background: C.dark,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Georgia, serif',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ color: C.gold, fontSize: 36, letterSpacing: 6, fontWeight: 700, marginBottom: 6 }}>
          SOLARA
        </div>
        <div style={{ color: C.mid, fontSize: 11, letterSpacing: 3 }}>
          LUXURY HOSPITALITY
        </div>
        <div style={{ width: 40, height: 1, background: C.gold, margin: '16px auto 0' }} />
      </div>

      {/* Options */}
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={() => navigate('/guest?id=RES-001')}
          style={{
            background: C.gold,
            color: C.dark,
            border: 'none',
            borderRadius: 14,
            padding: '20px 24px',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'Georgia, serif',
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>🏠</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Soy un huésped</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Acceder a mi estadía</div>
        </button>

        <button
          onClick={() => navigate('/admin')}
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: C.cream,
            border: `1px solid ${C.mid}`,
            borderRadius: 14,
            padding: '20px 24px',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'Georgia, serif',
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>🖥️</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Panel Admin</div>
          <div style={{ fontSize: 12, opacity: 0.5 }}>Solo para el equipo SOLARA</div>
        </button>
      </div>

      <div style={{ color: C.mid, fontSize: 10, marginTop: 48, letterSpacing: 1, textAlign: 'center' }}>
        hola@solarahomes.com.co · +57 304 616 0294
      </div>
    </div>
  )
}
