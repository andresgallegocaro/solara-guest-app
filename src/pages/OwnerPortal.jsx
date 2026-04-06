import { useState, useEffect } from 'react'
import { C } from '../config'

// ── Demo data por propiedad ───────────────────────────────────────────────
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
    competencia: {
      tuADR: 420000,
      mercadoADR: 385000,
      tuOcupacion: 73,
      mercadoOcupacion: 68,
      tuRevPAR: 306600,
      mercadoRevPAR: 261800,
    },
    proyeccion: {
      mes: 'Mayo 2026',
      ingresosBrutos: 9800000,
      ocupacionEst: 75,
      adrEst: 435000,
      eventosDestacados: ['Festival Internacional de Tango (3–8 Jun próximo)', 'Temporada alta mayo'],
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

function fmtFull(n) {
  return `COP ${n?.toLocaleString('es-CO')}`
}

function KPICard({ icon, label, value, sub, highlight, trend }) {
  return (
    <div style={{
      background: highlight ? C.dark : C.white,
      border: `1px solid ${highlight ? C.gold : C.light}`,
      borderRadius: 14, padding: '14px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {highlight && <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle, ${C.gold}22, transparent 70%)` }} />}
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 10, color: highlight ? C.mid : C.muted, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: highlight ? C.gold : C.dark, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: highlight ? C.mid : C.muted, marginTop: 3 }}>{sub}</div>}
      {trend && (
        <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, color: trend > 0 ? '#4caf50' : '#e53935', fontWeight: 700 }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

function BarChart({ data, valueKey, label, color, maxValue }) {
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
            <div style={{
              width: '100%', borderRadius: '3px 3px 0 0',
              background: isLast ? C.gold : `${color}66`,
              height: `${pct}%`, minHeight: 3,
              transition: 'height 0.5s ease',
            }} />
            <div style={{ fontSize: 8, color: isLast ? C.dark : C.muted, fontWeight: isLast ? 700 : 400 }}>{d.mes}</div>
          </div>
        )
      })}
    </div>
  )
}

function GastoRow({ concepto, monto, tipo }) {
  const colors = {
    'Operativo': '#1976d2', 'Mantenimiento': '#f57200',
    'Gestión': C.dark, 'Plataforma': '#9c27b0',
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.light}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: C.dark }}>{concepto}</div>
        <span style={{ fontSize: 9, color: colors[tipo] || C.muted, background: `${colors[tipo]}15`, padding: '1px 6px', borderRadius: 8, marginTop: 2, display: 'inline-block' }}>{tipo}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{fmtFull(monto)}</div>
    </div>
  )
}

function CompBar({ label, tuValor, mercadoValor, isPercent }) {
  const maxVal = Math.max(tuValor, mercadoValor) * 1.2
  const tuPct = (tuValor / maxVal) * 100
  const mercadoPct = (mercadoValor / maxVal) * 100
  const mejor = tuValor > mercadoValor
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
        <span style={{ fontSize: 11, color: mejor ? '#4caf50' : C.muted, fontWeight: 700 }}>
          {mejor ? '▲' : '▼'} {isPercent ? `${tuValor}%` : fmt(tuValor)}
        </span>
      </div>
      <div style={{ marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 9, color: C.dark, width: 40 }}>TÚ</div>
          <div style={{ flex: 1, background: C.light, borderRadius: 4, height: 8 }}>
            <div style={{ width: `${tuPct}%`, background: C.dark, height: 8, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 9, color: C.dark, width: 50, textAlign: 'right' }}>
            {isPercent ? `${tuValor}%` : fmt(tuValor)}
          </div>
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 9, color: C.muted, width: 40 }}>MKTD</div>
          <div style={{ flex: 1, background: C.light, borderRadius: 4, height: 8 }}>
            <div style={{ width: `${mercadoPct}%`, background: C.mid, height: 8, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 9, color: C.muted, width: 50, textAlign: 'right' }}>
            {isPercent ? `${mercadoValor}%` : fmt(mercadoValor)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OwnerPortal() {
  const [propiedad, setPropiedad] = useState(PROPIEDADES[0])
  const [seccion, setSeccion] = useState('resumen')
  const [mesIdx, setMesIdx] = useState(6)
  const data = OWNER_DATA[propiedad]
  const { kpis, gastos, historial, reservasActuales, competencia, proyeccion } = data

  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0)
  const ingresosNetos = kpis.ingresosBrutos - totalGastos + kpis.feeSolara // fee ya está en gastos

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

      {/* Header */}
      <div style={{ background: C.dark, padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: C.gold, fontSize: 16, letterSpacing: 3, fontWeight: 700 }}>SOLARA</span>
              <span style={{ color: C.mid, fontSize: 9, letterSpacing: 2 }}>✦ PROPIETARIOS</span>
            </div>
            <div style={{ color: C.light, fontSize: 11, marginTop: 2 }}>Portal del Propietario</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: C.gold, fontSize: 10, fontWeight: 700 }}>{data.mesActual}</div>
            <div style={{ color: C.mid, fontSize: 9 }}>Informe mensual</div>
          </div>
        </div>

        {/* Selector propiedad */}
        {PROPIEDADES.length > 1 && (
          <select value={propiedad} onChange={e => setPropiedad(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: `1px solid ${C.mid}`, color: C.cream, borderRadius: 8, padding: '6px 10px', fontSize: 11, marginBottom: 10, fontFamily: 'Georgia,serif' }}>
            {PROPIEDADES.map(p => <option key={p} style={{ background: C.dark }}>{p}</option>)}
          </select>
        )}

        {/* Propiedad info */}
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '10px 10px 0 0', padding: '10px 14px', marginTop: 4 }}>
          <div style={{ color: C.cream, fontSize: 13, fontWeight: 600 }}>{data.propiedad}</div>
          <div style={{ color: C.mid, fontSize: 10 }}>{data.ubicacion} · {data.area} · {data.habitaciones} hab</div>
        </div>

        {/* Nav */}
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

      <div style={{ padding: '18px', paddingBottom: 40 }}>

        {/* ── RESUMEN ── */}
        {seccion === 'resumen' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 4 }}>Resumen Ejecutivo</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{data.mesActual} · {data.propiedad}</div>

            {/* KPIs principales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <KPICard icon="💰" label="INGRESOS BRUTOS" value={fmt(kpis.ingresosBrutos)} sub={fmtFull(kpis.ingresosBrutos)} highlight trend={9} />
              <KPICard icon="🏠" label="INGRESOS NETOS" value={fmt(kpis.ingresosNetos)} sub="Después de gastos" trend={7} />
              <KPICard icon="📅" label="OCUPACIÓN" value={`${kpis.ocupacion}%`} sub={`${kpis.noches} noches vendidas`} trend={5} />
              <KPICard icon="💵" label="ADR" value={fmt(kpis.adr)} sub="Precio medio/noche" trend={3} />
              <KPICard icon="📊" label="RevPAR" value={fmt(kpis.revpar)} sub="Ingreso por noche disp." trend={8} />
              <KPICard icon="⭐" label="RATING MEDIO" value={kpis.rating} sub={`${kpis.totalReseñas} reseñas totales`} />
            </div>

            {/* Fee SOLARA */}
            <div style={{ background: C.dark, borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>✦ Liquidación SOLARA — {data.mesActual}</div>
              {[
                { label: 'Ingresos brutos generados', value: fmtFull(kpis.ingresosBrutos), color: C.cream },
                { label: 'Gastos operativos', value: `- ${fmtFull(totalGastos - kpis.feeSolara)}`, color: C.mid },
                { label: 'Fee SOLARA (15% neto)', value: `- ${fmtFull(kpis.feeSolara)}`, color: C.gold },
                { label: 'Transferencia al propietario', value: fmtFull(kpis.ingresosBrutos - totalGastos), color: '#4caf50', bold: true },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, paddingBottom: 6, borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.08)` : 'none' }}>
                  <span style={{ fontSize: 11, color: C.mid }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: r.color, fontWeight: r.bold ? 700 : 400 }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Mini chart */}
            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Ingresos últimos 7 meses</div>
              <BarChart data={historial} valueKey="ingresos" color={C.dark} />
            </div>
          </div>
        )}

        {/* ── INGRESOS ── */}
        {seccion === 'ingresos' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 16 }}>Análisis de Ingresos</div>

            <div style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Evolución mensual — Ingresos</div>
              <BarChart data={historial} valueKey="ingresos" color={C.dark} />
            </div>

            <div style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Evolución mensual — Ocupación</div>
              <BarChart data={historial} valueKey="ocupacion" color="#1976d2" maxValue={100} />
            </div>

            <div style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Evolución mensual — ADR</div>
              <BarChart data={historial} valueKey="adr" color={C.gold} />
            </div>

            {/* Desglose por plataforma */}
            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Desglose por plataforma</div>
              {[
                { plataforma: 'Airbnb', pct: 62, ingresos: 5728800, color: '#FF5A5F' },
                { plataforma: 'Booking.com', pct: 24, ingresos: 2217600, color: '#003580' },
                { plataforma: 'Canal directo', pct: 14, ingresos: 1293600, color: C.dark },
              ].map((p, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.dark }}>{p.plataforma}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>{fmtFull(p.ingresos)} · {p.pct}%</span>
                  </div>
                  <div style={{ background: C.light, borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${p.pct}%`, background: p.color, height: 6, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
              <div style={{ background: '#fff3cd', borderRadius: 8, padding: '8px 10px', marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#856404' }}>💡 Objetivo SOLARA: aumentar canal directo al 30% en 24 meses para reducir comisiones OTA</div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESERVAS ── */}
        {seccion === 'reservas' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 4 }}>Reservas del Mes</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{kpis.reservas} reservas · {kpis.cancelaciones} cancelación</div>

            {/* Stats rápidas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Reservas', value: kpis.reservas, icon: '📅' },
                { label: 'Noches', value: kpis.noches, icon: '🌙' },
                { label: 'Cancelac.', value: kpis.cancelaciones, icon: '❌' },
              ].map((s, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 10, padding: 12, textAlign: 'center', border: `1px solid ${C.light}` }}>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Reservas activas */}
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>RESERVAS ACTIVAS / PRÓXIMAS</div>
            {reservasActuales.map((r, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 8, border: `1px solid ${C.light}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{r.huesped}</div>
                    <div style={{ fontSize: 10, color: C.muted, margin: '3px 0' }}>{r.checkin} → {r.checkout} · {r.noches} noches</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 9, background: C.light, color: C.dark, padding: '2px 7px', borderRadius: 8 }}>{r.plataforma}</span>
                      <span style={{ fontSize: 9, background: '#1976d215', color: '#1976d2', padding: '2px 7px', borderRadius: 8 }}>{r.estado}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{fmtFull(r.total)}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>{r.id}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Calendario visual simplificado */}
            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}`, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 10 }}>Ocupación Abril 2026</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 8, color: C.muted, paddingBottom: 4 }}>{d}</div>
                ))}
                {Array.from({ length: 30 }, (_, i) => {
                  const dia = i + 1
                  const ocupado = [5,6,7,8,10,11,12,13,14,17,18,19,20,22,23,24,25,26,27,28].includes(dia)
                  const hoy = dia === 6
                  return (
                    <div key={i} style={{
                      textAlign: 'center', fontSize: 9, padding: '5px 2px', borderRadius: 4,
                      background: hoy ? C.gold : ocupado ? C.dark : C.cream,
                      color: hoy ? C.dark : ocupado ? C.cream : C.muted,
                      fontWeight: hoy ? 700 : 400,
                    }}>{dia}</div>
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
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{data.mesActual}</div>

            {/* Resumen gastos */}
            <div style={{ background: C.dark, borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: C.mid, fontSize: 10, letterSpacing: 1 }}>TOTAL GASTOS MES</div>
                  <div style={{ color: C.gold, fontSize: 26, fontWeight: 700 }}>{fmt(totalGastos)}</div>
                  <div style={{ color: C.mid, fontSize: 11 }}>{fmtFull(totalGastos)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: C.mid, fontSize: 10 }}>% sobre ingresos</div>
                  <div style={{ color: C.cream, fontSize: 22, fontWeight: 700 }}>
                    {Math.round((totalGastos / kpis.ingresosBrutos) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Lista gastos */}
            <div style={{ background: C.white, borderRadius: 12, padding: '4px 14px', marginBottom: 12, border: `1px solid ${C.light}` }}>
              {gastos.map((g, i) => <GastoRow key={i} {...g} />)}
            </div>

            {/* Resumen cuenta */}
            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Cuenta de resultados</div>
              {[
                { label: 'Ingresos brutos', value: kpis.ingresosBrutos, positive: true },
                { label: 'Limpieza y lavandería', value: -680000 },
                { label: 'Suministros', value: -145000 },
                { label: 'Mantenimiento', value: -80000 },
                { label: 'Fee SOLARA', value: -kpis.feeSolara },
                { label: 'Comisión OTA', value: -277200 },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.light}` }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: r.positive ? 700 : 400, color: r.positive ? C.dark : r.value < 0 ? '#e53935' : C.dark }}>
                    {r.value > 0 ? '' : '-'}{fmtFull(Math.abs(r.value))}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>RESULTADO NETO</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#4caf50' }}>
                  {fmtFull(kpis.ingresosBrutos - totalGastos)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── MERCADO ── */}
        {seccion === 'mercado' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 4 }}>Posición en el Mercado</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Tu propiedad vs. competencia Manila / El Poblado</div>

            {/* Comparativa */}
            <div style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 14 }}>Benchmarking competitivo</div>
              <CompBar label="ADR (precio medio/noche)" tuValor={competencia.tuADR} mercadoValor={competencia.mercadoADR} />
              <CompBar label="Ocupación (%)" tuValor={competencia.tuOcupacion} mercadoValor={competencia.mercadoOcupacion} isPercent />
              <CompBar label="RevPAR" tuValor={competencia.tuRevPAR} mercadoValor={competencia.mercadoRevPAR} />
            </div>

            {/* Score card */}
            <div style={{ background: C.dark, borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>✦ SOLARA Performance Score</div>
              {[
                { kpi: 'ADR', diff: Math.round(((competencia.tuADR - competencia.mercadoADR) / competencia.mercadoADR) * 100) },
                { kpi: 'Ocupación', diff: competencia.tuOcupacion - competencia.mercadoOcupacion },
                { kpi: 'RevPAR', diff: Math.round(((competencia.tuRevPAR - competencia.mercadoRevPAR) / competencia.mercadoRevPAR) * 100) },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: C.mid }}>{s.kpi}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.diff > 0 ? '#4caf50' : '#e53935' }}>
                    {s.diff > 0 ? '+' : ''}{s.diff}% vs mercado
                  </span>
                </div>
              ))}
            </div>

            {/* Rating análisis */}
            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Análisis de Reputación</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: C.dark }}>{kpis.rating}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>Rating medio</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map(stars => {
                    const pct = stars === 5 ? 72 : stars === 4 ? 22 : stars === 3 ? 4 : stars === 2 ? 1 : 1
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 9, color: C.muted, width: 8 }}>{stars}</span>
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
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ cat: 'Limpieza', val: 4.9 }, { cat: 'Ubicación', val: 4.8 }, { cat: 'Valor', val: 4.7 }, { cat: 'Check-in', val: 5.0 }].map((r, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', background: C.cream, borderRadius: 8, padding: '8px 4px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{r.val}</div>
                    <div style={{ fontSize: 8, color: C.muted }}>{r.cat}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROYECCIÓN ── */}
        {seccion === 'proyeccion' && (
          <div>
            <div style={{ fontSize: 16, color: C.dark, marginBottom: 4 }}>Proyección</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{proyeccion.mes} — Estimación SOLARA</div>

            <div style={{ background: C.dark, borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ color: C.gold, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>ESTIMACIÓN {proyeccion.mes.toUpperCase()}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Ingresos estimados', value: fmt(proyeccion.ingresosBrutos), sub: fmtFull(proyeccion.ingresosBrutos) },
                  { label: 'Ocupación est.', value: `${proyeccion.ocupacionEst}%`, sub: 'proyectado' },
                  { label: 'ADR estimado', value: fmt(proyeccion.adrEst), sub: '/noche' },
                ].map((k, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ color: C.gold, fontSize: 18, fontWeight: 700 }}>{k.value}</div>
                    <div style={{ color: C.mid, fontSize: 8, marginTop: 2 }}>{k.label}</div>
                    <div style={{ color: C.mid, fontSize: 8 }}>{k.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: 12 }}>
                <div style={{ color: C.mid, fontSize: 10, marginBottom: 6 }}>📅 EVENTOS RELEVANTES</div>
                {proyeccion.eventosDestacados.map((e, i) => (
                  <div key={i} style={{ color: C.light, fontSize: 11, marginBottom: 4, display: 'flex', gap: 8 }}>
                    <span style={{ color: C.gold }}>✦</span>{e}
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendaciones SOLARA */}
            <div style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 10 }}>✦ Recomendaciones SOLARA</div>
              {[
                { tipo: '💰', titulo: 'Ajuste tarifario mayo', desc: 'Subir ADR a COP 435.000 para aprovechar temporada alta. Fines de semana a COP 510.000.' },
                { tipo: '📸', titulo: 'Fotografía profesional URGENTE', desc: 'Las fotos actuales limitan el ADR. Con fotografía top podemos subir precio 15–20%.' },
                { tipo: '❄️', titulo: 'Instalar aire acondicionado', desc: 'Mayo-junio es temporada cálida. El A/C aumenta conversión y permite tarifa premium.' },
                { tipo: '🎯', titulo: 'Activar canal directo', desc: 'Crear cuenta en Booking.com canal directo para reducir comisiones al 0% vs 3% Airbnb.' },
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

            {/* Proyección 3 meses */}
            <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, marginBottom: 12 }}>Proyección 3 meses</div>
              {[
                { mes: 'Mayo 2026', ingresos: 9800000, ocupacion: 75, note: 'Temporada alta' },
                { mes: 'Junio 2026', ingresos: 8900000, ocupacion: 70, note: 'Festival Tango' },
                { mes: 'Julio 2026', ingresos: 11200000, ocupacion: 82, note: 'Pre-Feria Flores' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${C.light}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.dark, fontWeight: 600 }}>{m.mes}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{m.note} · {m.ocupacion}% ocupación est.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{fmt(m.ingresos)}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>brutos est.</div>
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
        select option { background: #2c3027; }
      `}</style>
    </div>
  )
}
