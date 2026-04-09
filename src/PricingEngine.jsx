import { useState } from 'react'

const C = { dark:'#47523e', med:'#919c89', gold:'#c9a84c', bg:'#f7f6f2', card:'#fff', border:'rgba(0,0,0,0.08)', muted:'#888', text:'#1a1a1a', red:'#c0392b', green:'#27ae60' }

const PROPERTY = {
  name: 'SOLARA Manila 1',
  zone: 'Manila, El Poblado',
  bedrooms: 3,
  sqm: 150,
  basePrice: 280000,
  optimalPrice: 320000,
}

const EVENTS_2026 = [
  { name: 'Colombiatex', start: '2026-01-20', end: '2026-01-23', impact: 1.25, type: 'feria', color: '#3498db' },
  { name: 'CORE Medellín', start: '2026-02-20', end: '2026-02-21', impact: 1.20, type: 'festival', color: '#9b59b6' },
  { name: 'Semana Santa', start: '2026-03-29', end: '2026-04-05', impact: 1.35, type: 'festivo', color: '#e67e22' },
  { name: 'Festival Tango', start: '2026-06-03', end: '2026-06-08', impact: 1.20, type: 'festival', color: '#9b59b6' },
  { name: 'Festival Trova', start: '2026-06-03', end: '2026-06-08', impact: 1.15, type: 'festival', color: '#9b59b6' },
  { name: 'Altavoz Ciudad', start: '2026-07-10', end: '2026-07-12', impact: 1.20, type: 'festival', color: '#9b59b6' },
  { name: 'Urbana Fest', start: '2026-07-17', end: '2026-07-18', impact: 1.20, type: 'festival', color: '#9b59b6' },
  { name: 'Feria de las Flores', start: '2026-07-31', end: '2026-08-09', impact: 1.55, type: 'feria', color: '#e74c3c' },
  { name: 'Fiesta del Libro', start: '2026-09-11', end: '2026-09-20', impact: 1.15, type: 'cultural', color: '#1abc9c' },
  { name: 'Feria de Diseño', start: '2026-09-10', end: '2026-09-12', impact: 1.18, type: 'feria', color: '#3498db' },
  { name: 'Festival Altavoz', start: '2026-10-10', end: '2026-10-12', impact: 1.25, type: 'festival', color: '#9b59b6' },
  { name: 'Festiafro', start: '2026-10-10', end: '2026-10-10', impact: 1.15, type: 'festival', color: '#9b59b6' },
  { name: 'Fiesta Diversidad', start: '2026-10-24', end: '2026-10-25', impact: 1.20, type: 'festival', color: '#9b59b6' },
  { name: 'Miradas Medellín', start: '2026-11-03', end: '2026-11-08', impact: 1.15, type: 'cultural', color: '#1abc9c' },
  { name: 'Danzamed', start: '2026-11-18', end: '2026-11-22', impact: 1.18, type: 'cultural', color: '#1abc9c' },
  { name: 'White Festival', start: '2026-12-06', end: '2026-12-06', impact: 1.20, type: 'festival', color: '#9b59b6' },
  { name: 'Navidad / Año Nuevo', start: '2026-12-20', end: '2026-12-31', impact: 1.45, type: 'festivo', color: '#e67e22' },
]

const SEASONALITY = {
  0: 0.90, 1: 0.88, 2: 0.92, 3: 1.10, 4: 1.05, 5: 1.00,
  6: 1.15, 7: 1.45, 8: 1.20, 9: 1.10, 10: 1.08, 11: 1.35,
}

const DAY_FACTOR = { 0: 1.05, 1: 0.95, 2: 0.95, 3: 0.95, 4: 1.00, 5: 1.20, 6: 1.15 }

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MONTHS_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function toDate(str) { return new Date(str + 'T00:00:00') }

function getEventForDate(dateStr) {
  const d = toDate(dateStr)
  return EVENTS_2026.find(e => d >= toDate(e.start) && d <= toDate(e.end)) || null
}

function calcPrice(dateStr, occupancy = 70) {
  const d = toDate(dateStr)
  const month = d.getMonth()
  const dow = d.getDay()
  const event = getEventForDate(dateStr)
  const daysAhead = Math.round((d - new Date()) / 86400000)

  let price = PROPERTY.optimalPrice
  price *= SEASONALITY[month]
  price *= DAY_FACTOR[dow]
  if (event) price *= event.impact
  if (occupancy >= 80) price *= 1.15
  else if (occupancy >= 90) price *= 1.25
  else if (occupancy < 50) price *= 0.90
  if (daysAhead <= 3 && occupancy < 60) price *= 0.88
  if (daysAhead >= 60) price *= 1.05

  const rounded = Math.round(price / 5000) * 5000
  return Math.max(PROPERTY.basePrice, rounded)
}

function fmt(n) { return n.toLocaleString('es-CO') }

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }

function padDate(n) { return String(n).padStart(2, '0') }

export default function PricingEngine() {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [occupancy, setOccupancy] = useState(70)
  const [selectedDate, setSelectedDate] = useState(null)
  const [tab, setTab] = useState('calendar')

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  const dateStr = (day) => `${viewYear}-${padDate(viewMonth + 1)}-${padDate(day)}`

  const todayPrice = calcPrice(today.toISOString().split('T')[0], occupancy)
  const tomorrowDate = new Date(today); tomorrowDate.setDate(today.getDate() + 1)
  const tomorrowPrice = calcPrice(tomorrowDate.toISOString().split('T')[0], occupancy)

  const monthPrices = Array.from({ length: daysInMonth }, (_, i) => calcPrice(dateStr(i + 1), occupancy))
  const avgMonth = Math.round(monthPrices.reduce((a, b) => a + b, 0) / daysInMonth)
  const maxMonth = Math.max(...monthPrices)
  const minMonth = Math.min(...monthPrices)

  const selPrice = selectedDate ? calcPrice(selectedDate, occupancy) : null
  const selEvent = selectedDate ? getEventForDate(selectedDate) : null

  function getPriceColor(price) {
    const ratio = (price - PROPERTY.basePrice) / (maxMonth - PROPERTY.basePrice + 1)
    if (ratio > 0.7) return '#c0392b'
    if (ratio > 0.4) return '#e67e22'
    if (ratio > 0.2) return '#27ae60'
    return '#2980b9'
  }

  const upcomingEvents = EVENTS_2026.filter(e => toDate(e.end) >= today).slice(0, 6)

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.bg, minHeight: '100vh', padding: 16 }}>

      {/* HEADER */}
      <div style={{ background: C.dark, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
        <p style={{ fontSize: 10, color: C.med, margin: '0 0 3px', letterSpacing: 1, textTransform: 'uppercase' }}>Motor de Pricing</p>
        <p style={{ fontSize: 19, fontWeight: 500, color: '#fff', margin: '0 0 12px' }}>{PROPERTY.name}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
          {[
            ['Hoy', fmt(todayPrice) + ' COP', getEventForDate(today.toISOString().split('T')[0]) ? '⚡ Evento' : 'precio sugerido'],
            ['Mañana', fmt(tomorrowPrice) + ' COP', tomorrowPrice > todayPrice ? '↑ sube' : tomorrowPrice < todayPrice ? '↓ baja' : '= igual'],
            ['Media mensual', fmt(avgMonth) + ' COP', MONTHS_FULL[viewMonth]],
          ].map(([l, v, s]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, color: C.med, margin: '0 0 3px' }}>{l}</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#fff', margin: '0 0 2px' }}>{v}</p>
              <p style={{ fontSize: 10, color: C.med, margin: 0 }}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* OCUPACION */}
      <div style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, padding: '13px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: 0, flex: 1 }}>Ocupación actual estimada</p>
          <span style={{ fontSize: 16, fontWeight: 500, color: occupancy >= 80 ? C.red : occupancy >= 60 ? '#e67e22' : C.green }}>{occupancy}%</span>
        </div>
        <input type="range" min="20" max="100" step="5" value={occupancy} onChange={e => setOccupancy(Number(e.target.value))} style={{ width: '100%', accentColor: C.dark }} />
        <p style={{ fontSize: 11, color: C.muted, margin: '5px 0 0' }}>
          {occupancy >= 80 ? 'Alta ocupación → precio premium aplicado (+15%)' : occupancy < 50 ? 'Baja ocupación → descuento aplicado (-10%)' : 'Ocupación normal → precio estándar'}
        </p>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, background: '#e8e6e0', borderRadius: 10, padding: 4, marginBottom: 12 }}>
        {[['calendar','Calendario'],['events','Eventos'],['rules','Reglas']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: tab===id?500:400, background: tab===id?'#fff':'transparent', color: tab===id?C.dark:C.muted }}>{label}</button>
        ))}
      </div>

      {/* TAB CALENDAR */}
      {tab === 'calendar' && (
        <div>
          <div style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, padding: '13px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button onClick={prevMonth} style={{ background: 'transparent', border: '0.5px solid ' + C.border, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 14, color: C.text }}>‹</button>
              <p style={{ fontSize: 15, fontWeight: 500, color: C.text, margin: 0 }}>{MONTHS_FULL[viewMonth]} {viewYear}</p>
              <button onClick={nextMonth} style={{ background: 'transparent', border: '0.5px solid ' + C.border, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 14, color: C.text }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
              {['D','L','M','X','J','V','S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: C.muted, padding: '2px 0' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {Array.from({ length: firstDay }, (_, i) => <div key={'e'+i} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const ds = dateStr(day)
                const price = calcPrice(ds, occupancy)
                const event = getEventForDate(ds)
                const isToday = ds === today.toISOString().split('T')[0]
                const isSelected = ds === selectedDate
                const color = getPriceColor(price)
                return (
                  <div key={day} onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                    style={{ borderRadius: 6, padding: '4px 2px', cursor: 'pointer', textAlign: 'center', background: isSelected ? C.dark : event ? color + '18' : 'transparent', border: isToday ? '1.5px solid ' + C.dark : isSelected ? 'none' : '0.5px solid transparent' }}>
                    <p style={{ fontSize: 11, color: isSelected ? '#fff' : C.text, margin: '0 0 1px', fontWeight: isToday ? 500 : 400 }}>{day}</p>
                    <p style={{ fontSize: 9, color: isSelected ? 'rgba(255,255,255,0.85)' : color, margin: 0, fontWeight: 500 }}>{(price/1000).toFixed(0)}k</p>
                    {event && <div style={{ width: 3, height: 3, borderRadius: '50%', background: isSelected ? '#fff' : event.color, margin: '1px auto 0' }} />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Leyenda colores */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {[['#2980b9','Precio base'],['#27ae60','Normal'],['#e67e22','Demanda media'],['#c0392b','Alta demanda']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 10, color: C.muted }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Detalle día seleccionado */}
          {selectedDate && selPrice && (
            <div style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 12, color: C.muted, margin: '0 0 3px' }}>{selectedDate}</p>
                  <p style={{ fontSize: 22, fontWeight: 500, color: getPriceColor(selPrice), margin: 0 }}>{fmt(selPrice)} COP</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>precio sugerido / noche</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: C.muted, margin: '0 0 3px' }}>vs precio base</p>
                  <p style={{ fontSize: 16, fontWeight: 500, color: selPrice > PROPERTY.basePrice ? C.green : C.muted, margin: 0 }}>
                    +{fmt(selPrice - PROPERTY.basePrice)} COP
                  </p>
                  <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>+{Math.round((selPrice/PROPERTY.basePrice - 1) * 100)}% sobre mínimo</p>
                </div>
              </div>
              {selEvent && (
                <div style={{ background: selEvent.color + '15', border: '0.5px solid ' + selEvent.color + '40', borderRadius: 8, padding: '8px 12px' }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: selEvent.color, margin: '0 0 2px' }}>⚡ {selEvent.name}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Multiplicador de evento: x{selEvent.impact} sobre precio base</p>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                <div style={{ background: '#f2f0ea', borderRadius: 8, padding: 10 }}>
                  <p style={{ fontSize: 10, color: C.muted, margin: '0 0 3px' }}>Ingreso estimado noche</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: C.text, margin: 0 }}>{fmt(selPrice)} COP</p>
                </div>
                <div style={{ background: '#f2f0ea', borderRadius: 8, padding: 10 }}>
                  <p style={{ fontSize: 10, color: C.muted, margin: '0 0 3px' }}>Fee SOLARA (15% neto)</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: C.dark, margin: 0 }}>~{fmt(Math.round(selPrice * 0.15 * 0.6))} COP</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: C.text, margin: '0 0 8px' }}>Resumen {MONTHS_FULL[viewMonth]}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['Mínimo',fmt(minMonth)],[`Media`,fmt(avgMonth)],['Máximo',fmt(maxMonth)]].map(([l,v]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: C.muted, margin: '0 0 2px' }}>{l}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB EVENTS */}
      {tab === 'events' && (
        <div>
          <div style={{ background: '#fff8ec', border: '0.5px solid #e67e2240', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: '#e67e22', fontWeight: 500, margin: '0 0 3px' }}>Fuentes consultadas</p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Alcaldía de Medellín · Plaza Mayor · Comfenalco · Colombia Turismo · Diario Editorial</p>
          </div>
          {upcomingEvents.map((e, i) => {
            const projPrice = Math.round(calcPrice(e.start, occupancy))
            return (
              <div key={i} style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 12, padding: '13px 16px', marginBottom: 8, borderLeft: '3px solid ' + e.color }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0 }}>{e.name}</p>
                      <span style={{ fontSize: 10, background: e.color + '20', color: e.color, borderRadius: 99, padding: '1px 7px', fontWeight: 500 }}>{e.type}</span>
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{e.start} → {e.end}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: e.color, margin: '0 0 2px' }}>{fmt(projPrice)} COP</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>x{e.impact} multiplicador</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB RULES */}
      {tab === 'rules' && (
        <div>
          {[
            { title: 'Precio base mínimo', desc: 'Nunca bajar de 280.000 COP/noche para Manila 1 (3BR, 150m²)', color: '#2980b9' },
            { title: 'Precio óptimo de salida', desc: '320.000 COP en días normales de temporada media', color: '#27ae60' },
            { title: 'Factor día de semana', desc: 'Viernes +20% · Sábado +15% · Domingo +5% · Lunes-Miércoles -5%', color: '#8e44ad' },
            { title: 'Factor estacionalidad', desc: 'Agosto (Feria) +45% · Diciembre +35% · Julio +15% · Feb -12%', color: '#e67e22' },
            { title: 'Factor eventos', desc: 'Feria de Flores x1.55 · Semana Santa x1.35 · Navidad x1.45 · Ferias x1.25', color: '#c0392b' },
            { title: 'Factor ocupación', desc: '>80% → +15% · >90% → +25% · <50% → -10%', color: '#16a085' },
            { title: 'Last minute (<3 días)', desc: 'Si ocupación < 60% → descuento del 12% para no perder la noche', color: '#7f8c8d' },
            { title: 'Anticipación (>60 días)', desc: 'Precio +5% para incentivar reservas anticipadas', color: '#2c3e50' },
          ].map((rule, i) => (
            <div key={i} style={{ background: C.card, border: '0.5px solid ' + C.border, borderRadius: 10, padding: '12px 15px', marginBottom: 8, borderLeft: '3px solid ' + rule.color }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: '0 0 4px' }}>{rule.title}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>{rule.desc}</p>
            </div>
          ))}
          <div style={{ background: '#edf7f0', border: '0.5px solid #27ae6040', borderRadius: 10, padding: '12px 15px', marginTop: 4 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#27ae60', margin: '0 0 3px' }}>Zona Manila — benchmark de mercado</p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6 }}>
              Competencia directa 3BR: 280.000–380.000 COP · Mínimo mercado El Poblado: 180.000 COP · Premium penthouse: hasta 520.000 COP
            </p>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 18 }}>
        SOLARA Pricing Engine · Datos: Airbnb, Alcaldía Medellín, Plaza Mayor · Actualizado abril 2026
      </p>
    </div>
  )
}
