import { useState } from 'react'
import { C } from '../config'

// ── Glosario de términos ─────────────────────────────────────────────────
const TERMINOS = {
  ADR: { nombre: 'Precio medio por noche', descripcion: 'Cuánto cobras de media por cada noche vendida. Si vendiste 10 noches por un total de 4.000.000 COP, tu precio medio es 400.000 COP/noche.' },
  RevPAR: { nombre: 'Ingreso por noche disponible', descripcion: 'Lo que ganas por noche, contando también las noches vacías. Si tienes ocupación del 70% y precio medio de 400K, tu ingreso por noche disponible es 280.000 COP.' },
  Ocupación: { nombre: '% de noches vendidas', descripcion: 'De todas las noches del mes que tu propiedad estaba disponible, cuántas porcentualmente se ocuparon. 70% significa que 21 de 30 noches estuvieron ocupadas.' },
  'Ingresos brutos': { nombre: 'Lo que entra antes de gastos', descripcion: 'El dinero total que generaron tus huéspedes antes de descontar gastos de operación, comisiones y el fee de SOLARA.' },
  'Ingresos netos': { nombre: 'Lo que te queda a ti', descripcion: 'El dinero que recibes tú después de descontar todos los gastos: limpieza, suministros, comisiones de plataformas y el fee de SOLARA.' },
  'Fee SOLARA': { nombre: 'Comisión de gestión SOLARA', descripcion: 'El 15% que cobra SOLARA sobre el beneficio neto generado. Solo cobramos si tú ganas — si no hay ingresos netos, no hay fee.' },
  RevPAR: { nombre: 'Ingreso por noche disponible', descripcion: 'Ingreso total dividido entre todas las noches del mes (ocupadas + libres). Mide qué tan bien optimizas tu activo en conjunto.' },
  Benchmarking: { nombre: 'Comparativa con el mercado', descripcion: 'Cómo está tu propiedad comparada con apartamentos similares en tu zona. Si estás por encima es señal de buena gestión.' },
}

// ── Demo data ────────────────────────────────────────────────────────────
const OWNER_DATA = {
  'SOLARA Manila 1': {
    propietario: 'Felipe Jaramillo',
    propiedad: 'SOLARA Manila 1',
    ubicacion: 'Manila, El Poblado, Medellín',
    tipo: 'Apartamento STR',
    area: '150 m²',
    habitaciones: 3,
    mesActual: 'Abril 2026',
    kpis: {
      ingresosBrutos: 9240000,
      feeSolara: 1386000,
      ingresosNetos: 7854000,
      ocupacion: 73,
      adr: 420000,
      revpar: 306600,
      noches: 22,
      reservas: 8,
      cancelaciones: 1,
      rating: 4.87,
      totalReseñas: 34,
    },
    gastos: [
      { concepto: 'Limpieza y lavandería', monto: 680000, tipo: 'Operativo' },
      { concepto: 'Suministros huésped', monto: 145000, tipo: 'Operativo' },
      { concepto: 'Mantenimiento preventivo', monto: 80000, tipo: 'Mantenimiento' },
      { concepto: 'Fee SOLARA (15% neto)', monto: 1386000, tipo: 'Gestión' },
      { concepto: 'Comisión OTA (Airbnb 3%)', monto: 277200, tipo: 'Plataforma' },
    ],
    historial: [
      { mes: 'Oct', ingresos: 6800000, ocupacion: 62, adr: 360000 },
      { mes: 'Nov', ingresos: 7200000, ocupacion: 66, adr: 375000 },
      { mes: 'Dic', ingresos: 10800000, ocupacion: 88, adr: 580000 },
      { mes: 'Ene', ingresos: 7600000, ocupacion: 68, adr: 390000 },
      { mes: 'Feb', ingresos: 6900000, ocupacion: 61, adr: 370000 },
      { mes: 'Mar', ingresos: 8400000, ocupacion: 72, adr: 410000 },
      { mes: 'Abr', ingresos: 9240000, ocupacion: 73, adr: 420000 },
    ],
    reservasActuales: [
      { id: 'RES-TEST', huesped: 'Andi Gallego', checkin: '5 Abr', checkout: '8 Abr', noches: 3, total: 1260000, plataforma: 'Directo', estado: 'Confirmada' },
      { id: 'RES-008', huesped: 'Marco Rossi', checkin: '10 Abr', checkout: '14 Abr', noches: 4, total: 1680000, plataforma: 'Airbnb', estado: 'Confirmada' },
      { id: 'RES-009', huesped: 'Ana García', checkin: '17 Abr', checkout: '20 Abr', noches: 3, total: 1260000, plataforma: 'Booking', estado: 'Confirmada' },
    ],
    competencia: { tuADR: 420000, mercadoADR: 385000, tuOcupacion: 73, mercadoOcupacion: 68, tuRevPAR: 306600, mercadoRevPAR: 261800 },
    proyeccion: {
      mes: 'Mayo 2026', ingresosBrutos: 9800000, ocupacionEst: 75, adrEst: 435000,
      eventosDestacados: ['Festival Internacional de Tango (3–8 Jun próximo)', 'Temporada alta mayo — sube precios fines de semana'],
    },
  },
}

const PROPIEDADES = Object.keys(OWNER_DATA)

function fmt(n) {
  if (!n) return '—'
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${n}`
}
function fmtFull(n) { return `COP ${n?.toLocaleString('es-CO')}` }

// Tooltip de término
function TerminoTooltip({ term, children }) {
  const [show, setShow] = useState(false)
  const info = TERMINOS[term]
  if (!info) return children
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span onClick={() => setShow(!show)} style={{ borderBottom: `1px dashed ${C.gold}`, cursor: 'pointer' }}>{children}</span>
      {show && (
        <div onClick={() => setShow(false)} style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
        }}>
          <div style={{ background: C.white, borderRadius: 14, padding: 20, maxWidth: 300, margin: 20 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8 }}>{info.nombre}</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{info.descripcion}</div>
            <button onClick={() => setShow(false)} style={{ background: C.dark, color: C.cream, border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', marginTop: 14, fontSize: 12, width: '100%' }}>Entendido ✓</button>
          </div>
        </div>
      )}
    </span>
  )
}

function KPICard({ icon, label, value, sub, highlight, trend, termino }) {
  return (
    <div style={{ background: highlight ? C.dark : C.white, border: `1px solid ${highlight ? C.gold : C.light}`, borderRadius: 14, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
      {highlight && <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle, ${C.gold}22, transparent 70%)` }} />}
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 10, color: highlight ? C.mid : C.muted, letterSpacing: 1, marginBottom: 4 }}>
        {termino ? <TerminoTooltip term={termino}>{label}</TerminoTooltip> : label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: highlight ? C.gold : C.dark }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: highlight ? C.mid : C.muted, marginTop: 3 }}>{sub}</div>}
      {trend && (
        <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, color: trend > 0 ? '#4caf50' : '#e53935', fontWeight: 700 }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

function BarChart({ data, valueKey, color, maxValue }) {
  const max = maxValue || Math.max(...data.map(d => d[valueKey]))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '0 4px' }}>
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100
        const isLast = i === data.length - 1
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 8, color: isLast ? C.gold : C.muted, fontWeight: isLast ? 700 : 400 }}>
              {valueKey === 'ingresos' ? fmt(d[valueKey]) : `${d[valueKey]}%`}
            </div>
            <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: isLast ? C.gold : `${color}66`, height: `${pct}%`, minHeight: 3 }} />
            <div style={{ fontSize: 8, color: isLast ? C.dark : C.muted, fontWeight: isLast ? 700 : 400 }}>{d.mes}</div>
          </div>
        )
      })}
    </div>
  )
}

function CompBar({ label, tuValor, mercadoValor, isPercent, termino }) {
  const maxVal = Math.max(tuValor, mercadoValor) * 1.2
  const mejor = tuValor > mercadoValor
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.muted }}>
          {termino ? <TerminoTooltip term={termino}>{label}</TerminoTooltip> : label}
        </span>
        <span style={{ fontSize: 11, color: mejor ? '#4caf50' : C.muted, fontWeight: 700 }}>
          {mejor ? '▲' : '▼'} {isPercent ? `${tuValor}%` : fmt(tuValor)}
        </span>
      </div>
      {[
        { label: 'TÚ', val: tuValor, color: C.dark },
        { label: 'MERCADO', val: mercadoValor, color: C.mid },
      ].map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ fontSize: 9, color: b.color, width: 52 }}>{b.label}</div>
          <div style={{ flex: 1, background: C.light, borderRadius: 4, height: 7 }}>
            <div style={{ width: `${(b.val / maxVal) * 100}%`, background: b.color, height: 7, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 9, color: b.color, width: 54, textAlign: 'right' }}>
            {isPercent ? `${b.val}%` : fmt(b.val)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── PDF Print styles ──────────────────────────────────────────────────────
const PDF_STYLES = `
@media print {
  body { background: white !important; }
  .no-print { display: none !important; }
  .print-page { page-break-after: always; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @page { margin: 15mm; size: A4; }
}
`

export default function OwnerPortal() {
  const [propiedad, setPropiedad] = useState(PROPIEDADES[0])
  const [seccion, setSeccion] = useState('resumen')
  const [pdfMode, setPdfMode] = useState(false)
  const data = OWNER_DATA[propiedad]
  const { kpis, gastos, historial, reservasActuales, competencia, proyeccion } = data
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0)

  const handlePDF = () => {
    setPdfMode(true)
    setTimeout(() => {
      window.print()
      setPdfMode(false)
    }, 300)
  }

  const SECCIONES = [
    { id: 'resumen', icon: '📊', label: 'Resumen' },
    { id: 'ingresos', icon: '💰', label: 'Ingresos' },
    { id: 'reservas', icon: '📅', label: 'Reservas' },
    { id: 'gastos', icon: '📋', label: 'Gastos' },
    { id: 'mercado', icon: '📈', label: 'Mercado' },
    { id: 'proyeccion', icon: '🔮', label: 'Proyección' },
  ]

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f6f1', minHeight: '100vh', maxWidth: 430, margin: '0 auto' }}>
      <style>{PDF_STYLES}</style>

      {/* Header */}
      <div style={{ background: C.dark, padding: '16px 18px 0' }} className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: C.gold, fontSize: 16, letterSpacing: 3, fontWeight: 700 }}>SOLARA</span>
              <span style={{ color: C.mid, fontSize: 9, letterSpacing: 2 }}>✦ PROPIETARIOS</span>
            </div>
            <div style={{ color: C.light, fontSize: 11, marginTop: 2 }}>Portal del Propietario</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ color: C.gold, fontSize: 10, fontWeight: 700 }}>{data.mesActual}</div>
            <button onClick={handlePDF} style={{
              background: C.gold, color: C.dark, border: 'none', borderRadius: 8,
              padding: '5px 10px', cursor: 'pointer', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              📄 Descargar PDF
            </button>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '10px 10px 0 0', padding: '8px 14px' }}>
          <div style={{ color: C.cream, fontSize: 13, fontWeight: 600 }}>{data.propiedad}</div>
          <div style={{ color: C.mid, fontSize: 10 }}>{data.ubicacion} · {data.area} · {data.habitaciones} hab</div>
        </div>

        <div style={{ display: 'flex', overflowX: 'auto', borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          {SECCIONES.map(s => (
            <button key={s.id} onClick={() => setSeccion(s.id)} style={{
              flex: '0 0 auto', background: seccion === s.id ? C.gold : 'transparent',
              color: seccion === s.id ? C.dark : C.mid,
              border: 'none', cursor: 'pointer', padding: '8px 10px',
              fontSize: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              fontFamily: 'Georgia,serif', minWidth: 56,
            }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span style={{ fontWeight: seccion === s.id ? 700 : 400 }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PDF Header — solo al imprimir */}
      <div style={{ display: 'none', padding: '20px 24px 10px', background: C.dark }} className="print-only">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: C.gold, fontSize: 22, letterSpacing: 4, fontWeight: 700 }}>SOLARA</div>
            <div style={{ color: C.mid, fontSize: 10, letterSpacing: 2 }}>INFORME MENSUAL DE PROPIETARIO</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: C.cream, fontSize: 14 }}>{data.propiedad}</div>
            <div style={{ color: C.mid, fontSize: 11 }}>{data.mesActual} · {data.ubicacion}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px', paddingBottom: 40 }}>

        {/* Aviso de términos */}
        {seccion === 'resumen' && (
          <div style={{ background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 11, color: '#2e7d32' }}>
            💡 Toca cualquier término subrayado para ver su explicación en lenguaje sencillo
          </div>
        )}

        {/* ── RESUMEN ── */}
        {seccion === 'resumen' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 4 }}>Resumen Ejecutivo</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{data.mesActual} · {data.propiedad}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <KPICard icon="💰" label="INGRESOS TOTALES" value={fmt(kpis.ingresosBrutos)} sub={fmtFull(kpis.ingresosBrutos)} highlight trend={9} termino="Ingresos brutos" />
              <KPICard icon="🏠" label="LO QUE TE QUEDA" value={fmt(kpis.ingresosNetos)} sub="Después de gastos" trend={7} termino="Ingresos netos" />
              <KPICard icon="📅" label="NOCHES VENDIDAS" value={`${kpis.ocupacion}%`} sub={`${kpis.noches} de 30 noches`} trend={5} termino="Ocupación" />
              <KPICard icon="💵" label="PRECIO MEDIO/NOCHE" value={fmt(kpis.adr)} sub="Por huésped" trend={3} termino="ADR" />
              <KPICard icon="📊" label="INGRESO/NOCHE DISP." value={fmt(kpis.revpar)} sub="Incl. noches vacías" trend={8} termino="RevPAR" />
              <KPICard icon="⭐" label="VALORACIÓN MEDIA" value={kpis.rating} sub={`${kpis.totalReseñas} reseñas totales`} />
            </div>

            <div style={{ background: C.dark, borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
                ✦ Liquidación SOLARA — {data.mesActual}
              </div>
              {[
                { label: 'Dinero que generaron tus huéspedes', value: fmtFull(kpis.ingresosBrutos), color: C.cream },
                { label: 'Gastos de operación (limpieza, etc.)', value: `- ${fmtFull(totalGastos - kpis.feeSolara)}`, color: C.mid },
                { label: 'Comisión de gestión SOLARA (15%)', value: `- ${fmtFull(kpis.feeSolara)}`, color: C.gold },
                { label: '✓ Transferencia a tu cuenta', value: fmtFull(kpis.ingresosBrutos - totalGastos), color: '#4caf50', bold: true },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, paddingBottom: 7, borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.08)` : 'none' }}>
                  <span style={{ fontSize: 11, color: C.mid }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: r.color, fontWeight: r.bold ? 700 : 400 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Evolución de ingresos — últimos 7 meses</div>
              <BarChart data={historial} valueKey="ingresos" color={C.dark} />
            </div>
          </div>
        )}

        {/* ── INGRESOS ── */}
        {seccion === 'ingresos' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 16 }}>Análisis de Ingresos</div>
            {[
              { title: 'Ingresos totales por mes', key: 'ingresos', color: C.dark },
              { title: '% de noches vendidas por mes', key: 'ocupacion', color: '#1976d2', max: 100 },
              { title: 'Precio medio por noche — evolución', key: 'adr', color: C.gold },
            ].map((c, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid ${C.light}` }}>
                <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>{c.title}</div>
                <BarChart data={historial} valueKey={c.key} color={c.color} maxValue={c.max} />
              </div>
            ))}

            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>¿De dónde vienen tus reservas?</div>
              {[
                { plataforma: 'Airbnb', pct: 62, ingresos: 5728800, color: '#FF5A5F', nota: 'Cobra 3% de comisión' },
                { plataforma: 'Booking.com', pct: 24, ingresos: 2217600, color: '#003580', nota: 'Cobra 15% de comisión' },
                { plataforma: 'Reserva directa SOLARA', pct: 14, ingresos: 1293600, color: C.dark, nota: 'Sin comisión ← objetivo' },
              ].map((p, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div>
                      <span style={{ fontSize: 11, color: C.dark }}>{p.plataforma}</span>
                      <span style={{ fontSize: 9, color: C.muted, marginLeft: 6 }}>{p.nota}</span>
                    </div>
                    <span style={{ fontSize: 11, color: C.muted }}>{p.pct}%</span>
                  </div>
                  <div style={{ background: C.light, borderRadius: 4, height: 7 }}>
                    <div style={{ width: `${p.pct}%`, background: p.color, height: 7, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{fmtFull(p.ingresos)}</div>
                </div>
              ))}
              <div style={{ background: '#e8f5e9', borderRadius: 8, padding: '8px 10px', marginTop: 4 }}>
                <div style={{ fontSize: 10, color: '#2e7d32' }}>🎯 Objetivo SOLARA: llevar las reservas directas al 30% en 2 años — menos comisiones, más ingresos para ti</div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESERVAS ── */}
        {seccion === 'reservas' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 4 }}>Tus Reservas</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{kpis.reservas} reservas este mes · {kpis.cancelaciones} cancelación</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Reservas', value: kpis.reservas, icon: '📅' },
                { label: 'Noches vendidas', value: kpis.noches, icon: '🌙' },
                { label: 'Cancelaciones', value: kpis.cancelaciones, icon: '❌' },
              ].map((s, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 10, padding: 12, textAlign: 'center', border: `1px solid ${C.light}` }}>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>PRÓXIMAS ESTANCIAS</div>
            {reservasActuales.map((r, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 8, border: `1px solid ${C.light}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{r.huesped}</div>
                    <div style={{ fontSize: 10, color: C.muted, margin: '3px 0' }}>{r.checkin} → {r.checkout} · {r.noches} noches</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 9, background: C.light, color: C.dark, padding: '2px 7px', borderRadius: 8 }}>{r.plataforma}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{fmtFull(r.total)}</div>
                    <div style={{ fontSize: 9, color: '#4caf50' }}>{r.estado}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Calendario */}
            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}`, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 10 }}>Calendario de ocupación — Abril 2026</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {['L','M','X','J','V','S','D'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 8, color: C.muted, paddingBottom: 4 }}>{d}</div>
                ))}
                {Array.from({ length: 30 }, (_, i) => {
                  const dia = i + 1
                  const ocupado = [5,6,7,8,10,11,12,13,14,17,18,19,20,22,23,24,25,26,27,28].includes(dia)
                  const hoy = dia === 7
                  return (
                    <div key={i} style={{ textAlign: 'center', fontSize: 9, padding: '5px 2px', borderRadius: 4, background: hoy ? C.gold : ocupado ? C.dark : C.cream, color: hoy ? C.dark : ocupado ? C.cream : C.muted, fontWeight: hoy ? 700 : 400 }}>
                      {dia}
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                {[{ color: C.dark, label: 'Ocupado' }, { color: C.cream, label: 'Libre', border: true }, { color: C.gold, label: 'Hoy' }].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color, border: l.border ? `1px solid ${C.light}` : 'none' }} />
                    <span style={{ fontSize: 9, color: C.muted }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GASTOS ── */}
        {seccion === 'gastos' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 4 }}>Gastos Operativos</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{data.mesActual} — todos los costes de tu propiedad</div>

            <div style={{ background: C.dark, borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: C.mid, fontSize: 10, letterSpacing: 1 }}>TOTAL GASTOS DEL MES</div>
                  <div style={{ color: C.gold, fontSize: 26, fontWeight: 700 }}>{fmt(totalGastos)}</div>
                  <div style={{ color: C.mid, fontSize: 11 }}>{fmtFull(totalGastos)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: C.mid, fontSize: 10 }}>Del total de ingresos</div>
                  <div style={{ color: C.cream, fontSize: 22, fontWeight: 700 }}>{Math.round((totalGastos / kpis.ingresosBrutos) * 100)}%</div>
                </div>
              </div>
            </div>

            <div style={{ background: C.white, borderRadius: 12, padding: '4px 14px', marginBottom: 12, border: `1px solid ${C.light}` }}>
              {gastos.map((g, i) => {
                const colors = { 'Operativo': '#1976d2', 'Mantenimiento': '#f57200', 'Gestión': C.dark, 'Plataforma': '#9c27b0' }
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < gastos.length - 1 ? `1px solid ${C.light}` : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: C.dark }}>{g.concepto}</div>
                      <span style={{ fontSize: 9, color: colors[g.tipo] || C.muted, background: `${colors[g.tipo]}15`, padding: '1px 6px', borderRadius: 8, marginTop: 2, display: 'inline-block' }}>{g.tipo}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{fmtFull(g.monto)}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Resumen de tu cuenta del mes</div>
              {[
                { label: 'Lo que generaron tus huéspedes', value: kpis.ingresosBrutos, sign: '' },
                { label: 'Limpieza y lavandería', value: -680000, sign: '-' },
                { label: 'Suministros para huéspedes', value: -145000, sign: '-' },
                { label: 'Mantenimiento', value: -80000, sign: '-' },
                { label: 'Comisión de gestión SOLARA', value: -kpis.feeSolara, sign: '-' },
                { label: 'Comisión Airbnb', value: -277200, sign: '-' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.light}` }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? C.dark : '#e53935' }}>
                    {r.sign}{fmtFull(Math.abs(r.value))}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>💸 LO QUE TE TRANSFERIMOS</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#4caf50' }}>{fmtFull(kpis.ingresosBrutos - totalGastos)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── MERCADO ── */}
        {seccion === 'mercado' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 4 }}>¿Cómo estás vs el mercado?</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Tu propiedad comparada con apartamentos similares en Manila / El Poblado</div>

            <div style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 14 }}>Comparativa con apartamentos similares en tu zona</div>
              <CompBar label="Precio medio por noche" tuValor={competencia.tuADR} mercadoValor={competencia.mercadoADR} termino="ADR" />
              <CompBar label="% de noches vendidas" tuValor={competencia.tuOcupacion} mercadoValor={competencia.mercadoOcupacion} isPercent termino="Ocupación" />
              <CompBar label="Ingreso por noche disponible" tuValor={competencia.tuRevPAR} mercadoValor={competencia.mercadoRevPAR} termino="RevPAR" />
            </div>

            <div style={{ background: C.dark, borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>✦ Tu posición en el mercado</div>
              {[
                { kpi: 'Precio medio/noche', diff: Math.round(((competencia.tuADR - competencia.mercadoADR) / competencia.mercadoADR) * 100) },
                { kpi: 'Noches vendidas', diff: competencia.tuOcupacion - competencia.mercadoOcupacion },
                { kpi: 'Ingreso/noche disponible', diff: Math.round(((competencia.tuRevPAR - competencia.mercadoRevPAR) / competencia.mercadoRevPAR) * 100) },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: C.mid }}>{s.kpi}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.diff > 0 ? '#4caf50' : '#e53935' }}>
                    {s.diff > 0 ? '+' : ''}{s.diff}% vs mercado
                  </span>
                </div>
              ))}
              <div style={{ background: 'rgba(76,175,80,0.15)', borderRadius: 8, padding: '8px 10px', marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#4caf50' }}>✓ Tu propiedad supera al mercado en los 3 indicadores clave</div>
              </div>
            </div>

            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Valoraciones de tus huéspedes</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: C.dark }}>{kpis.rating}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>Sobre 5</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5,4,3,2,1].map(s => {
                    const pct = s === 5 ? 72 : s === 4 ? 22 : s === 3 ? 4 : 1
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 9, color: C.muted, width: 8 }}>{s}</span>
                        <span style={{ fontSize: 9 }}>⭐</span>
                        <div style={{ flex: 1, background: C.light, borderRadius: 3, height: 5 }}>
                          <div style={{ width: `${pct}%`, background: C.gold, height: 5, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 9, color: C.muted, width: 24 }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[{ cat: 'Limpieza', val: 4.9 }, { cat: 'Ubicación', val: 4.8 }, { cat: 'Valor percibido', val: 4.7 }, { cat: 'Proceso de llegada', val: 5.0 }].map((r, i) => (
                  <div key={i} style={{ background: C.cream, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>{r.val}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>{r.cat}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROYECCIÓN ── */}
        {seccion === 'proyeccion' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 4 }}>Qué esperar el próximo mes</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{proyeccion.mes} — estimación basada en datos de mercado</div>

            <div style={{ background: C.dark, borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ color: C.gold, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>ESTIMACIÓN {proyeccion.mes.toUpperCase()}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Ingresos estimados', value: fmt(proyeccion.ingresosBrutos), sub: fmtFull(proyeccion.ingresosBrutos) },
                  { label: 'Noches vendidas est.', value: `${proyeccion.ocupacionEst}%`, sub: 'de ocupación' },
                  { label: 'Precio medio est.', value: fmt(proyeccion.adrEst), sub: '/noche' },
                ].map((k, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ color: C.gold, fontSize: 18, fontWeight: 700 }}>{k.value}</div>
                    <div style={{ color: C.mid, fontSize: 8, marginTop: 2 }}>{k.label}</div>
                    <div style={{ color: C.mid, fontSize: 8 }}>{k.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: 12 }}>
                <div style={{ color: C.mid, fontSize: 10, marginBottom: 6 }}>📅 EVENTOS QUE AFECTAN A TUS PRECIOS</div>
                {proyeccion.eventosDestacados.map((e, i) => (
                  <div key={i} style={{ color: C.light, fontSize: 11, marginBottom: 4, display: 'flex', gap: 8 }}>
                    <span style={{ color: C.gold }}>✦</span>{e}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 10 }}>Recomendaciones de SOLARA para mayo</div>
              {[
                { tipo: '💰', titulo: 'Ajuste de precios recomendado', desc: 'Subir precio medio a 435.000 COP/noche para aprovechar temporada alta. Fines de semana: 510.000 COP.' },
                { tipo: '📸', titulo: 'Fotografía profesional — URGENTE', desc: 'Las fotos actuales limitan tu precio. Con fotografía top podemos subir tarifas un 15–20% adicional.' },
                { tipo: '❄️', titulo: 'Instalar aire acondicionado', desc: 'Mayo y junio son meses calurosos. El A/C aumenta reservas y permite cobrar más.' },
                { tipo: '🎯', titulo: 'Activar canal de reservas directas', desc: 'Reducir dependencia de Airbnb. Cada reserva directa te ahorra la comisión del 3%.' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: i < 3 ? `1px solid ${C.light}` : 'none' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{r.tipo}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 3 }}>{r.titulo}</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Previsión para los próximos 3 meses</div>
              {[
                { mes: 'Mayo 2026', ingresos: 9800000, ocupacion: 75, note: 'Temporada alta' },
                { mes: 'Junio 2026', ingresos: 8900000, ocupacion: 70, note: 'Festival Tango' },
                { mes: 'Julio 2026', ingresos: 11200000, ocupacion: 82, note: 'Previa Feria de las Flores' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${C.light}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.dark, fontWeight: 600 }}>{m.mes}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{m.note} · {m.ocupacion}% noches vendidas est.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{fmt(m.ingresos)}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>estimado</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.light}; border-radius: 10px; }
        button:active { transform: scale(0.97); }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  )
}
