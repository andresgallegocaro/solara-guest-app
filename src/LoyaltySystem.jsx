import { useState } from 'react'

const C = {
  dark: '#47523e',
  med: '#919c89',
  bg: '#f7f6f2',
  card: '#ffffff',
  border: 'rgba(0,0,0,0.08)',
  muted: '#888',
  text: '#1a1a1a',
}

const LEVELS = [
  { name: 'Explorer', min: 0, max: 499, color: '#4a7c59', bg: '#edf7f0', icon: '✦', ptsNight: 100, perks: ['Check-in prioritario', 'Recomendaciones personalizadas', 'Concierge IA 24/7'] },
  { name: 'Silver', min: 500, max: 1499, color: '#9ba3a8', bg: '#f0f2f4', icon: '◆', ptsNight: 150, perks: ['Early check-in (sujeto a disponibilidad)', 'Late check-out hasta las 13h', 'Descuento 5% en servicios'] },
  { name: 'Gold', min: 1500, max: 3999, color: '#c9a84c', bg: '#fdf8ec', icon: '★', ptsNight: 200, perks: ['Late check-out 14h garantizado', 'Kit bienvenida premium', 'Descuento 10% en servicios'] },
  { name: 'Platinum', min: 4000, max: Infinity, color: '#7c6fa0', bg: '#f3f0fa', icon: '♛', ptsNight: 300, perks: ['Late check-out 16h garantizado', 'Upgrade automatico', 'Traslado aeropuerto gratuito', 'Linea directa SOLARA 24/7'] },
]

const REWARDS = [
  { id: 1, name: 'Early check-in', desc: 'Entrada desde las 10h garantizada', points: 200, icon: '🌅', level: 'Explorer' },
  { id: 2, name: 'Late check-out', desc: 'Salida hasta las 16h', points: 300, icon: '🌙', level: 'Explorer' },
  { id: 3, name: 'Kit premium', desc: 'Vino, snacks y amenities de bienvenida', points: 500, icon: '🍾', level: 'Silver' },
  { id: 4, name: 'Traslado VIP', desc: 'Transfer aeropuerto en vehiculo premium', points: 800, icon: '🚗', level: 'Gold' },
  { id: 5, name: 'Experiencia local', desc: 'Tour privado o cena con guia local', points: 1200, icon: '🗺️', level: 'Gold' },
  { id: 6, name: 'Noche gratis', desc: '1 noche en cualquier propiedad SOLARA', points: 1500, icon: '🏠', level: 'Silver' },
  { id: 7, name: 'Weekend completo', desc: 'Fin de semana gratis (vie-dom)', points: 3000, icon: '🌟', level: 'Platinum' },
]

const HISTORY = [
  { date: '2025-03-15', desc: 'Estancia SOLARA Manila 1 — 3 noches', points: 450, type: 'earn' },
  { date: '2025-02-01', desc: 'Estancia ALBA Poblado — 2 noches', points: 300, type: 'earn' },
  { date: '2025-01-10', desc: 'Canje: Kit de bienvenida premium', points: -500, type: 'redeem' },
  { date: '2024-12-20', desc: 'Estancia SOLARA Manila 1 — 5 noches', points: 750, type: 'earn' },
  { date: '2024-11-05', desc: 'Bono bienvenida al programa', points: 200, type: 'bonus' },
]

function getLevel(pts) {
  return [...LEVELS].reverse().find(l => pts >= l.min) || LEVELS[0]
}

function getNext(pts) {
  return LEVELS.find(l => l.min > pts) || null
}

export default function LoyaltySystem({ guestName = 'Carlos Mendoza', initialPoints = 820 }) {
  const [tab, setTab] = useState('perfil')
  const [points, setPoints] = useState(initialPoints)
  const [toast, setToast] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [nights, setNights] = useState(5)

  const lv = getLevel(points)
  const nx = getNext(points)
  const toNext = nx ? nx.min - points : 0
  const prog = nx ? Math.round(((points - lv.min) / (nx.min - lv.min)) * 100) : 100
  const simPts = points + nights * lv.ptsNight
  const simLv = getLevel(simPts)

  function doRedeem() {
    setPoints(p => p - confirm.points)
    setToast('Canje exitoso: "' + confirm.name + '" confirmado. Te llegara un email.')
    setConfirm(null)
    setTimeout(() => setToast(null), 5000)
  }

  const TABS = ['perfil', 'recompensas', 'historial', 'niveles', 'simular']
  const LABELS = { perfil: 'Mi perfil', recompensas: 'Recompensas', historial: 'Historial', niveles: 'Niveles', simular: 'Simular' }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.bg, minHeight: '100vh', padding: 16 }}>

      {/* HEADER */}
      <div style={{ background: C.dark, borderRadius: 14, padding: '20px 22px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p style={{ fontSize: 10, color: C.med, margin: '0 0 4px', letterSpacing: 1, textTransform: 'uppercase' }}>SOLARA Loyalty</p>
            <p style={{ fontSize: 19, fontWeight: 500, margin: '0 0 8px', color: '#fff' }}>{guestName}</p>
            <span style={{ background: lv.bg, color: lv.color, borderRadius: 99, fontSize: 12, fontWeight: 500, padding: '3px 10px' }}>{lv.icon} {lv.name}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 32, fontWeight: 500, color: '#fff', margin: '0 0 2px', lineHeight: 1 }}>{points.toLocaleString()}</p>
            <p style={{ fontSize: 11, color: C.med, margin: 0 }}>puntos disponibles</p>
          </div>
        </div>
        {nx && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: C.med }}>{toNext.toLocaleString()} puntos para {nx.name}</span>
              <span style={{ fontSize: 11, color: C.med }}>{prog}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 7, overflow: 'hidden' }}>
              <div style={{ width: prog + '%', height: '100%', background: nx.color, borderRadius: 99 }} />
            </div>
          </div>
        )}
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, background: '#e8e6e0', borderRadius: 10, padding: 4, marginBottom: 14, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: '0 0 auto', padding: '7px 14px', borderRadius: 7, border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: tab === t ? 500 : 400, background: tab === t ? '#fff' : 'transparent', color: tab === t ? C.dark : C.muted }}>
            {LABELS[t]}
          </button>
        ))}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ background: '#edf7f0', border: '0.5px solid #4a7c59', color: '#2d5c3a', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>
          {toast}
        </div>
      )}

      {/* CONFIRM */}
      {confirm && (
        <div style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px', color: C.text }}>Confirmar canje</p>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 12px' }}>
            <strong>{confirm.name}</strong> — {confirm.points.toLocaleString()} pts. Quedaran <strong>{(points - confirm.points).toLocaleString()}</strong> puntos.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={doRedeem} style={{ background: C.dark, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Confirmar</button>
            <button onClick={() => setConfirm(null)} style={{ background: 'transparent', color: C.muted, border: '0.5px solid ' + C.border, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* PERFIL */}
      {tab === 'perfil' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginBottom: 12 }}>
            {[['Puntos ganados', '1.820', 'historico'], ['Noches totales', '10', 'en SOLARA'], ['Estancias', '4', 'en 2 props']].map(([l, v, s]) => (
              <div key={l} style={{ background: '#f2f0ea', borderRadius: 8, padding: 12 }}>
                <p style={{ fontSize: 10, color: C.muted, margin: '0 0 3px' }}>{l}</p>
                <p style={{ fontSize: 20, fontWeight: 500, margin: '0 0 2px', color: C.text }}>{v}</p>
                <p style={{ fontSize: 10, color: '#bbb', margin: 0 }}>{s}</p>
              </div>
            ))}
          </div>
          <div style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px', color: C.text }}>Beneficios activos — {lv.name}</p>
            {lv.perks.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ color: C.dark }}>✓</span>
                <span style={{ fontSize: 13, color: '#555' }}>{p}</span>
              </div>
            ))}
          </div>
          {nx && (
            <div style={{ background: nx.bg, border: '0.5px solid ' + nx.color + '40', borderRadius: 12, padding: '13px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: nx.color, margin: '0 0 5px' }}>{nx.icon} Proximo: {nx.name}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: '0 0 8px' }}>Faltan <strong>{toNext.toLocaleString()} puntos</strong> — {Math.ceil(toNext / lv.ptsNight)} noches mas</p>
              <div style={{ background: '#ddd', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                <div style={{ width: prog + '%', height: '100%', background: nx.color, borderRadius: 99 }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECOMPENSAS */}
      {tab === 'recompensas' && (
        <div>
          {REWARDS.map(r => {
            const can = points >= r.points
            const rlv = LEVELS.find(l => l.name === r.level)
            return (
              <div key={r.id} style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, padding: '13px 16px', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 13, opacity: can ? 1 : 0.55 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: C.text }}>{r.name}</p>
                    <span style={{ background: rlv.bg, color: rlv.color, borderRadius: 99, fontSize: 10, fontWeight: 500, padding: '1px 7px' }}>{rlv.icon} {r.level}</span>
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{r.desc}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.dark, margin: '0 0 5px' }}>{r.points.toLocaleString()} pts</p>
                  {can
                    ? <button onClick={() => setConfirm(r)} style={{ background: C.dark, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Canjear</button>
                    : <button style={{ background: 'transparent', color: C.muted, border: '0.5px solid ' + C.border, borderRadius: 6, padding: '6px 12px', fontSize: 12 }}>Sin puntos</button>
                  }
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* HISTORIAL */}
      {tab === 'historial' && (
        <div style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, overflow: 'hidden' }}>
          {HISTORY.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < HISTORY.length - 1 ? '0.5px solid rgba(0,0,0,0.07)' : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: h.type === 'earn' ? '#edf7f0' : h.type === 'redeem' ? '#fdf0f0' : '#fdf8ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                {h.type === 'earn' ? '↑' : h.type === 'redeem' ? '↓' : '★'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, margin: '0 0 2px', color: C.text }}>{h.desc}</p>
                <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>{h.date}</p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: h.points > 0 ? '#2d5c3a' : '#9b2828', flexShrink: 0 }}>
                {h.points > 0 ? '+' : ''}{h.points.toLocaleString()} pts
              </p>
            </div>
          ))}
        </div>
      )}

      {/* NIVELES */}
      {tab === 'niveles' && (
        <div>
          {LEVELS.map(lvl => {
            const cur = lvl.name === lv.name
            return (
              <div key={lvl.name} style={{ background: cur ? lvl.bg : C.card, border: cur ? '1.5px solid ' + lvl.color : '0.5px solid ' + C.border, borderRadius: 12, padding: '13px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: lvl.color }}>{lvl.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: lvl.color, margin: 0 }}>{lvl.name}</p>
                      {cur && <span style={{ fontSize: 10, background: lvl.color, color: '#fff', borderRadius: 99, padding: '1px 8px' }}>Tu nivel</span>}
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>
                      {lvl.max === Infinity ? lvl.min.toLocaleString() + '+ pts' : lvl.min.toLocaleString() + '–' + lvl.max.toLocaleString() + ' pts'} · {lvl.ptsNight} pts/noche
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {lvl.perks.map(p => (
                    <span key={p} style={{ fontSize: 11, background: 'rgba(0,0,0,0.05)', color: '#555', borderRadius: 4, padding: '2px 8px' }}>{p}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* SIMULAR */}
      {tab === 'simular' && (
        <div>
          <div style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
            <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 14px', color: C.text }}>Cuantas noches planeas reservar?</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <input type="range" min="1" max="30" step="1" value={nights} onChange={e => setNights(Number(e.target.value))} style={{ flex: 1, accentColor: C.dark }} />
              <span style={{ fontSize: 20, fontWeight: 500, minWidth: 28, color: C.text }}>{nights}</span>
              <span style={{ fontSize: 13, color: C.muted }}>noches</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ background: '#f2f0ea', borderRadius: 8, padding: 12 }}>
                <p style={{ fontSize: 10, color: C.muted, margin: '0 0 3px' }}>Puntos a ganar</p>
                <p style={{ fontSize: 22, fontWeight: 500, color: '#2d5c3a', margin: 0 }}>+{(nights * lv.ptsNight).toLocaleString()}</p>
              </div>
              <div style={{ background: '#f2f0ea', borderRadius: 8, padding: 12 }}>
                <p style={{ fontSize: 10, color: C.muted, margin: '0 0 3px' }}>Total acumulado</p>
                <p style={{ fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>{simPts.toLocaleString()}</p>
              </div>
            </div>
            <div style={{ background: simLv.bg, border: '0.5px solid ' + simLv.color + '40', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, color: simLv.color }}>{simLv.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: simLv.color, margin: '0 0 2px' }}>
                  {simLv.name !== lv.name ? 'Subirias a ' + simLv.name + '!' : 'Seguirias en ' + simLv.name}
                </p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                  {simLv.name !== lv.name
                    ? 'Con ' + nights + ' noches alcanzas el siguiente nivel'
                    : getNext(simPts) ? 'Faltan ' + (getNext(simPts).min - simPts).toLocaleString() + ' pts para ' + getNext(simPts).name : 'Nivel maximo!'}
                </p>
              </div>
            </div>
          </div>
          <div style={{ background: '#f2f0ea', borderRadius: 8, padding: '12px 16px' }}>
            <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6 }}>
              Los puntos se acreditan al finalizar tu estancia. Nivel {lv.name}: <strong>{lv.ptsNight} puntos por noche</strong>.
            </p>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 20 }}>
        SOLARA Loyalty · hola@solarahomes.com.co
      </p>
    </div>
  )
}
