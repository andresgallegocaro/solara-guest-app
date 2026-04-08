import { useState } from 'react'

const C = {
  darkGreen: '#47523e', medGreen: '#919c89', gold: '#c9a84c', silver: '#9ba3a8',
  platinum: '#7c6fa0', explorer: '#4a7c59', white: '#ffffff', bg: '#f7f6f2',
  card: '#ffffff', border: 'rgba(0,0,0,0.08)', muted: '#888', text: '#1a1a1a',
}
const LEVELS = [
  { name: 'Explorer', min: 0, max: 499, color: C.explorer, bg: '#edf7f0', icon: '✦', perks: ['Check-in prioritario', 'Recomendaciones personalizadas', 'Concierge IA 24/7'], ptsNight: 100 },
  { name: 'Silver', min: 500, max: 1499, color: C.silver, bg: '#f0f2f4', icon: '◆', perks: ['Early check-in (sujeto a disponibilidad)', 'Late check-out hasta las 13h', 'Descuento 5% en servicios'], ptsNight: 150 },
  { name: 'Gold', min: 1500, max: 3999, color: C.gold, bg: '#fdf8ec', icon: '★', perks: ['Late check-out 14h garantizado', 'Kit bienvenida premium', 'Descuento 10% en servicios'], ptsNight: 200 },
  { name: 'Platinum', min: 4000, max: Infinity, color: C.platinum, bg: '#f3f0fa', icon: '♛', perks: ['Late check-out 16h garantizado', 'Upgrade automático', 'Traslado aeropuerto gratuito', 'Línea directa SOLARA 24/7'], ptsNight: 300 },
]
const REWARDS = [
  { id: 1, name: 'Early check-in', desc: 'Entrada desde las 10h garantizada', points: 200, icon: '🌅', level: 'Explorer' },
  { id: 2, name: 'Late check-out', desc: 'Salida hasta las 16h', points: 300, icon: '🌙', level: 'Explorer' },
  { id: 3, name: 'Kit premium', desc: 'Vino, snacks y amenities de bienvenida', points: 500, icon: '🍾', level: 'Silver' },
  { id: 4, name: 'Traslado VIP', desc: 'Transfer aeropuerto en vehículo premium', points: 800, icon: '🚗', level: 'Gold' },
  { id: 5, name: 'Experiencia local', desc: 'Tour privado o cena con guía local', points: 1200, icon: '🗺️', level: 'Gold' },
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
function getLevel(pts) { return LEVELS.slice().reverse().find(l => pts >= l.min) || LEVELS[0] }
function getNextLevel(pts) { return LEVELS.find(l => l.min > pts) || null }
export default function LoyaltySystem({ guestName = 'Carlos Mendoza', initialPoints = 820 }) {
  const [tab, setTab] = useState('perfil')
  const [points, setPoints] = useState(initialPoints)
  const [toast, setToast] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [nights, setNights] = useState(5)
  const level = getLevel(points)
  const nextLevel = getNextLevel(points)
  const toNext = nextLevel ? nextLevel.min - points : 0
  const progress = nextLevel ? Math.round(((points - level.min) / (nextLevel.min - level.min)) * 100) : 100
  const simPts = points + nights * level.ptsNight
  const simLevel = getLevel(simPts)
  function doRedeem() {
    setPoints(p => p - confirm.points)
    setToast('Canje exitoso: "' + confirm.name + '" confirmado.')
    setConfirm(null)
    setTimeout(() => setToast(null), 5000)
  }
  const s = {
    wrap: { fontFamily: 'system-ui, sans-serif', background: C.bg, minHeight: '100vh', padding: 16 },
    header: { background: C.darkGreen, borderRadius: 14, padding: '20px 22px', marginBottom: 14, color: '#fff' },
    tabs: { display: 'flex', gap: 4, background: '#e8e6e0', borderRadius: 10, padding: 4, marginBottom: 14, overflowX: 'auto' },
    card: { background: C.card, border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 },
    stat: { background: '#f2f0ea', borderRadius: 8, padding: 12, flex: 1 },
    pill: (color, bg) => ({ background: bg, color: color, borderRadius: 99, fontSize: 11, fontWeight: 500, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 4 }),
    btnP: { background: C.darkGreen, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' },
    btnG: { background: 'transparent', color: C.muted, border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'default' },
  }
  const tabLabels = { perfil: 'Mi perfil', recompensas: 'Recompensas', historial: 'Historial', niveles: 'Niveles', simular: 'Simular' }
  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p style={{ fontSize: 10, color: C.medGreen, margin: '0 0 4px', letterSpacing: 1, textTransform: 'uppercase' }}>SOLARA Loyalty</p>
            <p style={{ fontSize: 19, fontWeight: 500, margin: '0 0 8px', color: '#fff' }}>{guestName}</p>
            <span style={s.pill(level.color, level.bg)}>{level.icon} {level.name}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 32, fontWeight: 500, color: '#fff', margin: '0 0 2px', lineHeight: 1 }}>{points.toLocaleString()}</p>
            <p style={{ fontSize: 11, color: C.medGreen, margin: 0 }}>puntos disponibles</p>
          </div>
        </div>
        {nextLevel && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: C.medGreen }}>{toNext.toLocaleString()} puntos para {nextLevel.name}</span>
              <span style={{ fontSize: 11, color: C.medGreen }}>{progress}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 7, overflow: 'hidden' }}>
              <div style={{ width: progress + '%', height: '100%', background: nextLevel.color, borderRadius: 99 }} />
            </div>
          </div>
        )}
      </div>
      <div style={s.tabs}>
        {['perfil','recompensas','historial','niveles','simular'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.tabs, flex: '0 0 auto', padding: '7px 14px', borderRadius: 7, border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: tab===t?500:400, background: tab===t?'#fff':'transparent', color: tab===t?C.darkGreen:C.muted }}>{tabLabels[t]}</button>
        ))}
      </div>
      {toast && <div style={{ background: '#edf7f0', border: '0.5px solid #4a7c59', color: '#2d5c3a', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>{toast}</div>}
      {confirm && (
        <div style={{ ...s.card, marginBottom: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>Confirmar canje</p>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 12px' }}><strong>{confirm.name}</strong> — {confirm.points.toLocaleString()} pts. Quedarán <strong>{(points-confirm.points).toLocaleString()}</strong> puntos.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={s.btnP} onClick={doRedeem}>Confirmar</button>
            <button style={{ ...s.btnG, cursor: 'pointer' }} onClick={() => setConfirm(null)}>Cancelar</button>
          </div>
        </div>
      )}
      {tab === 'perfil' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8, marginBottom: 12 }}>
            {[['Puntos ganados','1.820','histórico'],['Noches totales','10','en SOLARA'],['Estancias','4','en 2 props']].map(([l,v,s2]) => (
              <div key={l} style={s.stat}><p style={{ fontSize: 10, color: C.muted, margin: '0 0 3px' }}>{l}</p><p style={{ fontSize: 20, fontWeight: 500, margin: '0 0 2px', color: C.text }}>{v}</p><p style={{ fontSize: 10, color: '#bbb', margin: 0 }}>{s2}</p></div>
            ))}
          </div>
          <div style={s.card}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px' }}>Beneficios activos — {level.name}</p>
            {level.perks.map(p => <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}><span style={{ color: C.darkGreen }}>✓</span><span style={{ fontSize: 13, color: '#555' }}>{p}</span></div>)}
          </div>
          {nextLevel && (
            <div style={{ background: nextLevel.bg, border: '0.5px solid ' + nextLevel.color + '40', borderRadius: 12, padding: '13px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: nextLevel.color, margin: '0 0 5px' }}>{nextLevel.icon} Próximo: {nextLevel.name}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: '0 0 8px' }}>Faltan <strong>{toNext.toLocaleString()} puntos</strong> — {Math.ceil(toNext/level.ptsNight)} noches más</p>
              <div style={{ background: '#ddd', borderRadius: 99, height: 6, overflow: 'hidden' }}><div style={{ width: progress+'%', height: '100%', background: nextLevel.color, borderRadius: 99 }} /></div>
            </div>
          )}
        </div>
      )}
      {tab === 'recompensas' && (
        <div>
          {REWARDS.map(r => {
            const can = points >= r.points
            const lvl = LEVELS.find(l => l.name === r.level)
            return (
              <div key={r.id} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 13, opacity: can?1:0.55 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: C.text }}>{r.name}</p>
                    <span style={s.pill(lvl.color, lvl.bg)}>{lvl.icon} {r.level}</span>
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{r.desc}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.darkGreen, margin: '0 0 5px' }}>{r.points.toLocaleString()} pts</p>
                  {can ? <button style={s.btnP} onClick={() => setConfirm(r)}>Canjear</button> : <button style={s.btnG}>Sin puntos</button>}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {tab === 'historial' && (
        <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
          {HISTORY.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < HISTORY.length-1 ? '0.5px solid rgba(0,0,0,0.07)' : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: h.type==='earn'?'#edf7f0':h.type==='redeem'?'#fdf0f0':'#fdf8ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                {h.type==='earn'?'↑':h.type==='redeem'?'↓':'★'}
              </div>
              <div style={{ flex: 1 }}><p style={{ fontSize: 13, margin: '0 0 2px', color: C.text }}>{h.desc}</p><p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>{h.date}</p></div>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: h.points > 0 ? '#2d5c3a' : '#9b2828', flexShrink: 0 }}>{h.points > 0 ? '+' : ''}{h.points.toLocaleString()} pts</p>
            </div>
          ))}
        </div>
      )}
      {tab === 'niveles' && (
        <div>
          {LEVELS.map(lvl => {
            const cur = lvl.name === level.name
            return (
              <div key={lvl.name} style={{ background: cur?lvl.bg:C.card, border: cur?'1.5px solid '+lvl.color:'0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '13px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: lvl.color }}>{lvl.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: lvl.color, margin: 0 }}>{lvl.name}</p>
                      {cur && <span style={{ fontSize: 10, background: lvl.color, color: '#fff', borderRadius: 99, padding: '1px 8px' }}>Tu nivel</span>}
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>{lvl.max===Infinity?lvl.min.toLocaleString()+'+':lvl.min.toLocaleString()+'–'+lvl.max.toLocaleString()} pts · {lvl.ptsNight} pts/noche</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {lvl.perks.map(p => <span key={p} style={{ fontSize: 11, background: 'rgba(0,0,0,0.05)', color: '#555', borderRadius: 4, padding: '2px 8px' }}>{p}</span>)}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {tab === 'simular' && (
        <div>
          <div style={s.card}>
            <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 14px', color: C.text }}>¿Cuántas noches planeas reservar?</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <input type="range" min="1" max="30" step="1" value={nights} onChange={e => setNights(Number(e.target.value))} style={{ flex: 1, accentColor: C.darkGreen }} />
              <span style={{ fontSize: 20, fontWeight: 500, minWidth: 28 }}>{nights}</span>
              <span style={{ fontSize: 13, color: C.muted }}>noches</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={s.stat}><p style={{ fontSize: 10, color: C.muted, margin: '0 0 3px' }}>Puntos a ganar</p><p style={{ fontSize: 22, fontWeight: 500, color: '#2d5c3a', margin: 0 }}>+{(nights*level.ptsNight).toLocaleString()}</p></div>
              <div style={s.stat}><p style={{ fontSize: 10, color: C.muted, margin: '0 0 3px' }}>Total acumulado</p><p style={{ fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>{simPts.toLocaleString()}</p></div>
            </div>
            <div style={{ background: simLevel.bg, border: '0.5px solid '+simLevel.color+'40', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, color: simLevel.color }}>{simLevel.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: simLevel.color, margin: '0 0 2px' }}>{simLevel.name!==level.name?'¡Subirías a '+simLevel.name+'!':'Seguirías en '+simLevel.name}</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{simLevel.name!==level.name?'Con '+nights+' noches alcanzas el siguiente nivel':getNextLevel(simPts)?'Faltan '+(getNextLevel(simPts).min-simPts).toLocaleString()+' pts para '+getNextLevel(simPts).name:'¡Nivel máximo!'}</p>
              </div>
            </div>
          </div>
          <div style={{ background: '#f2f0ea', borderRadius: 8, padding: '12px 16px' }}>
            <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6 }}>Los puntos se acreditan al finalizar tu estancia. Nivel {level.name}: <strong>{level.ptsNight} puntos por noche</strong>.</p>
          </div>
        </div>
      )}
      <p style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 20 }}>SOLARA Loyalty · hola@solarahomes.com.co</p>
    </div>
  )
}
// REMOVE_BELOW

const COLORS = {
  darkGreen: "#47523e",
  medGreen: "#919c89",
  lightGreen: "#f0f4ee",
  gold: "#c9a84c",
  silver: "#9ba3a8",
  platinum: "#7c6fa0",
  explorer: "#4a7c59",
};

const LEVELS = [
  {
    name: "Explorer",
    minPoints: 0,
    maxPoints: 499,
    color: COLORS.explorer,
    bg: "#edf7f0",
    icon: "✦",
    perks: ["Check-in prioritario", "Recomendaciones personalizadas", "Acceso al concierge IA 24/7"],
    pointsPerNight: 100,
  },
  {
    name: "Silver",
    minPoints: 500,
    maxPoints: 1499,
    color: COLORS.silver,
    bg: "#f0f2f4",
    icon: "◆",
    perks: ["Todo lo de Explorer", "Early check-in (sujeto a disponibilidad)", "Late check-out hasta las 13h", "Descuento 5% en servicios adicionales"],
    pointsPerNight: 150,
  },
  {
    name: "Gold",
    minPoints: 1500,
    maxPoints: 3999,
    color: COLORS.gold,
    bg: "#fdf8ec",
    icon: "★",
    perks: ["Todo lo de Silver", "Late check-out garantizado 14h", "Upgrade de habitación (si disponible)", "Kit de bienvenida premium", "Descuento 10% en servicios"],
    pointsPerNight: 200,
  },
  {
    name: "Platinum",
    minPoints: 4000,
    maxPoints: Infinity,
    color: COLORS.platinum,
    bg: "#f3f0fa",
    icon: "♛",
    perks: ["Todo lo de Gold", "Late check-out 16h garantizado", "Upgrade automático siempre que posible", "Traslado aeropuerto gratuito (1x/año)", "Acceso anticipado a nuevas propiedades", "Línea directa SOLARA 24/7"],
    pointsPerNight: 300,
  },
];

const REWARDS = [
  { id: 1, name: "Early check-in", desc: "Entrada desde las 10h garantizada", points: 200, icon: "🌅", level: "Explorer" },
  { id: 2, name: "Late check-out", desc: "Salida hasta las 16h", points: 300, icon: "🌙", level: "Explorer" },
  { id: 3, name: "Noche gratis", desc: "1 noche en cualquier propiedad SOLARA", points: 1500, icon: "🏠", level: "Silver" },
  { id: 4, name: "Kit premium", desc: "Bienvenida con vino, snacks y amenities", points: 500, icon: "🍾", level: "Silver" },
  { id: 5, name: "Traslado VIP", desc: "Transfer aeropuerto en vehículo premium", points: 800, icon: "🚗", level: "Gold" },
  { id: 6, name: "Experiencia local", desc: "Tour privado o cena con guía local", points: 1200, icon: "🗺️", level: "Gold" },
  { id: 7, name: "Weekend completo", desc: "Fin de semana gratis (vie-dom)", points: 3000, icon: "🌟", level: "Platinum" },
  { id: 8, name: "Semana entera", desc: "7 noches en propiedad SOLARA a elegir", points: 8000, icon: "♛", level: "Platinum" },
];

const HISTORY = [
  { date: "2025-03-15", desc: "Estancia SOLARA Manila 1 — 3 noches", points: +450, type: "earn" },
  { date: "2025-02-01", desc: "Estancia ALBA Poblado — 2 noches", points: +300, type: "earn" },
  { date: "2025-01-10", desc: "Canje: Kit de bienvenida premium", points: -500, type: "redeem" },
  { date: "2024-12-20", desc: "Estancia SOLARA Manila 1 — 5 noches", points: +750, type: "earn" },
  { date: "2024-11-05", desc: "Bono bienvenida al programa", points: +200, type: "bonus" },
];

function getLevelForPoints(pts) {
  return LEVELS.slice().reverse().find((l) => pts >= l.minPoints) || LEVELS[0];
}

function getNextLevel(pts) {
  return LEVELS.find((l) => l.minPoints > pts) || null;
}

function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: "#e8ede6", borderRadius: 99, height: 8, overflow: "hidden", width: "100%" }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRadius: 99,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

function LevelBadge({ level, small }) {
  const sz = small ? { fontSize: 11, padding: "2px 8px" } : { fontSize: 13, padding: "4px 12px" };
  return (
    <span
      style={{
        background: level.bg,
        color: level.color,
        borderRadius: 99,
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        ...sz,
      }}
    >
      <span style={{ fontSize: small ? 10 : 12 }}>{level.icon}</span>
      {level.name}
    </span>
  );
}

export default function LoyaltySystem({ guestName = "Carlos Mendoza", initialPoints = 820 }) {
  const [tab, setTab] = useState("perfil");
  const [points, setPoints] = useState(initialPoints);
  const [redeemMsg, setRedeemMsg] = useState(null);
  const [simulateNights, setSimulateNights] = useState(3);
  const [showConfirm, setShowConfirm] = useState(null);

  const level = getLevelForPoints(points);
  const nextLevel = getNextLevel(points);
  const pointsToNext = nextLevel ? nextLevel.minPoints - points : 0;
  const progressPct = nextLevel
    ? ((points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100
    : 100;

  const handleRedeem = (reward) => {
    if (points < reward.points) return;
    setShowConfirm(reward);
  };

  const confirmRedeem = () => {
    setPoints((p) => p - showConfirm.points);
    setRedeemMsg(`¡Canje exitoso! "${showConfirm.name}" confirmado. Recibirás un email con los detalles.`);
    setShowConfirm(null);
    setTimeout(() => setRedeemMsg(null), 5000);
  };

  const simulatedPoints = points + simulateNights * level.pointsPerNight;
  const simulatedLevel = getLevelForPoints(simulatedPoints);

  const tabs = [
    { id: "perfil", label: "Mi perfil" },
    { id: "recompensas", label: "Recompensas" },
    { id: "historial", label: "Historial" },
    { id: "niveles", label: "Niveles" },
    { id: "simular", label: "Simular" },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 680, margin: "0 auto", padding: "1rem 0" }}>
      <h2 className="sr-only">Programa de fidelización SOLARA Loyalty</h2>

      {/* Header */}
      <div
        style={{
          background: COLORS.darkGreen,
          borderRadius: "var(--border-radius-lg)",
          padding: "1.25rem 1.5rem",
          marginBottom: 16,
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: COLORS.medGreen, margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>
              SOLARA Loyalty
            </p>
            <p style={{ fontSize: 20, fontWeight: 500, margin: "0 0 6px", color: "#fff" }}>{guestName}</p>
            <LevelBadge level={level} />
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 32, fontWeight: 500, margin: "0 0 2px", color: "#fff", lineHeight: 1 }}>
              {points.toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: COLORS.medGreen, margin: 0 }}>puntos disponibles</p>
          </div>
        </div>

        {nextLevel && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: COLORS.medGreen }}>
                {pointsToNext.toLocaleString()} puntos para {nextLevel.name}
              </span>
              <span style={{ fontSize: 12, color: COLORS.medGreen }}>{Math.round(progressPct)}%</span>
            </div>
            <ProgressBar value={points - level.minPoints} max={nextLevel.minPoints - level.minPoints} color={nextLevel.color} />
          </div>
        )}
        {!nextLevel && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 12, color: COLORS.medGreen, margin: 0 }}>
              ♛ Nivel máximo alcanzado — ¡Eres parte de la élite SOLARA!
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 16,
          background: "var(--color-background-secondary)",
          borderRadius: "var(--border-radius-md)",
          padding: 4,
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: "0 0 auto",
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              fontSize: 13,
              fontWeight: tab === t.id ? 500 : 400,
              cursor: "pointer",
              background: tab === t.id ? "var(--color-background-primary)" : "transparent",
              color: tab === t.id ? COLORS.darkGreen : "var(--color-text-secondary)",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {redeemMsg && (
        <div
          style={{
            background: "#edf7f0",
            border: "0.5px solid #4a7c59",
            color: "#2d5c3a",
            borderRadius: "var(--border-radius-md)",
            padding: "10px 14px",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {redeemMsg}
        </div>
      )}

      {/* Modal confirmación */}
      {showConfirm && (
        <div
          style={{
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "1.25rem",
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 8px" }}>
            ¿Confirmar canje?
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 14px" }}>
            <strong>{showConfirm.name}</strong> — {showConfirm.points.toLocaleString()} puntos. Te quedarán{" "}
            <strong>{(points - showConfirm.points).toLocaleString()}</strong> puntos.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={confirmRedeem}
              style={{
                background: COLORS.darkGreen,
                color: "#fff",
                border: "none",
                borderRadius: "var(--border-radius-md)",
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Confirmar
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              style={{
                background: "transparent",
                color: "var(--color-text-secondary)",
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: "var(--border-radius-md)",
                padding: "8px 16px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* TAB: Perfil */}
      {tab === "perfil" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            {[
              { label: "Puntos totales ganados", value: "1.820", sub: "desde tu primera estancia" },
              { label: "Noches totales", value: "10", sub: "en propiedades SOLARA" },
              { label: "Estancias realizadas", value: "4", sub: "en 2 propiedades" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  padding: "12px",
                }}
              >
                <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{stat.label}</p>
                <p style={{ fontSize: 22, fontWeight: 500, margin: "0 0 2px", color: "var(--color-text-primary)" }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0 }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              padding: "1rem 1.25rem",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Beneficios activos — Nivel {level.name}</p>
            {level.perks.map((perk) => (
              <div key={perk} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ color: COLORS.darkGreen, fontSize: 14, lineHeight: 1 }}>✓</span>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{perk}</span>
              </div>
            ))}
          </div>

          {nextLevel && (
            <div
              style={{
                background: nextLevel.bg,
                borderRadius: "var(--border-radius-lg)",
                padding: "1rem 1.25rem",
                border: `0.5px solid ${nextLevel.color}30`,
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 6px", color: nextLevel.color }}>
                {nextLevel.icon} Próximo nivel: {nextLevel.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
                Te faltan <strong>{pointsToNext.toLocaleString()} puntos</strong> — equivale a{" "}
                {Math.ceil(pointsToNext / level.pointsPerNight)} noches más
              </p>
              <ProgressBar
                value={points - level.minPoints}
                max={nextLevel.minPoints - level.minPoints}
                color={nextLevel.color}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB: Recompensas */}
      {tab === "recompensas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {REWARDS.map((reward) => {
            const canRedeem = points >= reward.points;
            const reqLevel = LEVELS.find((l) => l.name === reward.level);
            return (
              <div
                key={reward.id}
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: canRedeem ? 1 : 0.55,
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{reward.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{reward.name}</p>
                    <LevelBadge level={reqLevel} small />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>{reward.desc}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px", color: COLORS.darkGreen }}>
                    {reward.points.toLocaleString()} pts
                  </p>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem}
                    style={{
                      background: canRedeem ? COLORS.darkGreen : "transparent",
                      color: canRedeem ? "#fff" : "var(--color-text-tertiary)",
                      border: canRedeem ? "none" : "0.5px solid var(--color-border-tertiary)",
                      borderRadius: 6,
                      padding: "5px 12px",
                      fontSize: 12,
                      cursor: canRedeem ? "pointer" : "default",
                      fontWeight: 500,
                    }}
                  >
                    {canRedeem ? "Canjear" : "Sin puntos"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: Historial */}
      {tab === "historial" && (
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            overflow: "hidden",
          }}
        >
          {HISTORY.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom: i < HISTORY.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background:
                    item.type === "earn"
                      ? "#edf7f0"
                      : item.type === "redeem"
                      ? "#fdf0f0"
                      : "#fdf8ec",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                {item.type === "earn" ? "↑" : item.type === "redeem" ? "↓" : "★"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, margin: "0 0 2px" }}>{item.desc}</p>
                <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0 }}>{item.date}</p>
              </div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  margin: 0,
                  color: item.points > 0 ? "#2d5c3a" : "#9b2828",
                  flexShrink: 0,
                }}
              >
                {item.points > 0 ? "+" : ""}{item.points.toLocaleString()} pts
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Niveles */}
      {tab === "niveles" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {LEVELS.map((lvl) => {
            const isCurrentLevel = lvl.name === level.name;
            return (
              <div
                key={lvl.name}
                style={{
                  background: isCurrentLevel ? lvl.bg : "var(--color-background-primary)",
                  border: isCurrentLevel
                    ? `1.5px solid ${lvl.color}`
                    : "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20, color: lvl.color }}>{lvl.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: lvl.color }}>{lvl.name}</p>
                      {isCurrentLevel && (
                        <span
                          style={{
                            fontSize: 10,
                            background: lvl.color,
                            color: "#fff",
                            borderRadius: 99,
                            padding: "1px 8px",
                            fontWeight: 500,
                          }}
                        >
                          Tu nivel actual
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                      {lvl.maxPoints === Infinity
                        ? `${lvl.minPoints.toLocaleString()}+ puntos`
                        : `${lvl.minPoints.toLocaleString()} – ${lvl.maxPoints.toLocaleString()} puntos`}
                      {" · "}{lvl.pointsPerNight} pts/noche
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {lvl.perks.slice(0, 4).map((perk) => (
                    <span
                      key={perk}
                      style={{
                        fontSize: 11,
                        background: "var(--color-background-secondary)",
                        color: "var(--color-text-secondary)",
                        borderRadius: 4,
                        padding: "2px 8px",
                      }}
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: Simular */}
      {tab === "simular" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              padding: "1.25rem",
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 16px" }}>
              ¿Cuántas noches planeas reservar?
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={simulateNights}
                onChange={(e) => setSimulateNights(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 20, fontWeight: 500, minWidth: 40, textAlign: "right" }}>
                {simulateNights}
              </span>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>noches</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: 12 }}>
                <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>Puntos a ganar</p>
                <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "#2d5c3a" }}>
                  +{(simulateNights * level.pointsPerNight).toLocaleString()}
                </p>
              </div>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: 12 }}>
                <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>Total acumulado</p>
                <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>
                  {simulatedPoints.toLocaleString()}
                </p>
              </div>
            </div>

            <div
              style={{
                background: simulatedLevel.bg,
                border: `0.5px solid ${simulatedLevel.color}40`,
                borderRadius: "var(--border-radius-md)",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20, color: simulatedLevel.color }}>{simulatedLevel.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 2px", color: simulatedLevel.color }}>
                  {simulatedLevel.name !== level.name
                    ? `¡Subirías a ${simulatedLevel.name}!`
                    : `Seguirías en nivel ${simulatedLevel.name}`}
                </p>
                <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>
                  {simulatedLevel.name !== level.name
                    ? `Con ${simulateNights} noches alcanzas el siguiente nivel`
                    : (() => {
                        const nl = getNextLevel(simulatedPoints);
                        return nl
                          ? `Te faltan ${(nl.minPoints - simulatedPoints).toLocaleString()} puntos para ${nl.name}`
                          : "¡Nivel máximo!";
                      })()}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: "var(--border-radius-md)",
              padding: "12px 16px",
            }}
          >
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Los puntos se acreditan automáticamente al finalizar tu estancia. Tu nivel actual ({level.name}) acumula{" "}
              <strong>{level.pointsPerNight} puntos por noche</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", textAlign: "center", marginTop: 20 }}>
        SOLARA Loyalty · hola@solarahomes.com.co · Los puntos caducan a los 24 meses sin actividad
      </p>
    </div>
  );
}
