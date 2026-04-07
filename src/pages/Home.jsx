import { useNavigate } from 'react-router-dom'
import { C } from '../config'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{
      fontFamily: 'Georgia, serif',
      background: `linear-gradient(160deg, ${C.dark} 0%, #2c3827 55%, #1a2218 100%)`,
      minHeight: '100vh', maxWidth: 430, margin: '0 auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: `radial-gradient(circle, ${C.gold}18, transparent 70%)`, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, background: `radial-gradient(circle, ${C.mid}12, transparent 70%)`, borderRadius: '50%' }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ color: C.gold, fontSize: 32, letterSpacing: 8, fontWeight: 700, marginBottom: 6 }}>SOLARA</div>
        <div style={{ color: C.mid, fontSize: 10, letterSpacing: 3 }}>✦ LUXURY HOSPITALITY ASSET MANAGEMENT</div>
        <div style={{ width: 40, height: 1, background: C.gold, margin: '16px auto 0', opacity: 0.5 }} />
      </div>

      {/* Bienvenida */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ color: C.cream, fontSize: 20, marginBottom: 8 }}>Bienvenido</div>
        <div style={{ color: C.mid, fontSize: 12, lineHeight: 1.6 }}>Selecciona cómo deseas acceder</div>
      </div>

      {/* Opciones */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>

        {/* Huésped */}
        <button onClick={() => navigate('/guest?id=RES-TEST')} style={{
          background: C.gold, border: 'none', borderRadius: 14, padding: '18px 20px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: `0 4px 24px ${C.gold}44`,
        }}>
          <span style={{ fontSize: 28 }}>🏠</span>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, fontFamily: 'Georgia,serif' }}>Soy huésped</div>
            <div style={{ fontSize: 11, color: '#47523e99', marginTop: 2 }}>Check-in online · Concierge IA · Servicios</div>
          </div>
          <span style={{ color: C.dark, fontSize: 18 }}>→</span>
        </button>

        {/* Propietario */}
        <button onClick={() => navigate('/owner')} style={{
          background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.mid}44`,
          borderRadius: 14, padding: '18px 20px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <span style={{ fontSize: 28 }}>📊</span>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, fontFamily: 'Georgia,serif' }}>Soy propietario</div>
            <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>Ingresos · Ocupación · Informes mensuales</div>
          </div>
          <span style={{ color: C.mid, fontSize: 18 }}>→</span>
        </button>

        {/* Administración */}
        <button onClick={() => navigate('/admin')} style={{
          background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: 14, padding: '18px 20px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <span style={{ fontSize: 28 }}>⚙️</span>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.light, fontFamily: 'Georgia,serif' }}>Administración SOLARA</div>
            <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>Gestión de reservas · Panel de control</div>
          </div>
          <span style={{ color: C.mid, fontSize: 18 }}>→</span>
        </button>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: C.mid, fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>SOLARA HOMES S.A.S.</div>
        <div style={{ color: C.mid, fontSize: 10 }}>hola@solarahomes.com.co · +57 304 616 0294</div>
      </div>

      <style>{`button:active { transform: scale(0.98); }`}</style>
    </div>
  )
}
