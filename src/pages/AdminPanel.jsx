import { useState } from 'react'
import { C, DEMO_RESERVATIONS, PROPERTIES, PLATFORMS, STATUSES, STATUS_META } from '../config'
import { createReservationInNotion } from '../api'

function Badge({ status }) {
  const m = STATUS_META[status] || STATUS_META['Confirmada']
  return (
    <span style={{ background: m.bg, color: m.color, borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot }} />
      {status}
    </span>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.light}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia, serif', color: C.text, boxSizing: 'border-box' }} />
    </div>
  )
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.light}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia, serif', color: C.text, cursor: 'pointer', boxSizing: 'border-box' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function NewReservationForm({ onSave, onCancel, nextId }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    guestName: '', guestEmail: '', guestPhone: '',
    property: PROPERTIES[0], zone: 'Provenza, El Poblado',
    checkin: today, checkout: '', nights: 1, guests: 1,
    accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
    wifiName: 'SOLARA_CasaArtist', wifiPass: 'Arte&Lujo2026',
    platform: PLATFORMS[0], adr: 550000, notes: '', status: 'Confirmada',
  })
  const [saving, setSaving] = useState(false)

  const f = key => val => {
    const u = { ...form, [key]: val }
    if ((key === 'checkin' || key === 'checkout') && u.checkin && u.checkout) {
      const n = Math.ceil((new Date(u.checkout) - new Date(u.checkin)) / 86400000)
      u.nights = n > 0 ? n : 1
    }
    if (key === 'property') u.wifiName = 'SOLARA_' + val.replace(/[\s']/g, '').substring(0, 10).toUpperCase()
    setForm(u)
  }

  const handleSave = async () => {
    if (!form.guestName || !form.checkin || !form.checkout) return
    setSaving(true)
    await onSave({ ...form, id: nextId, total: form.adr * form.nights })
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ background: C.cream, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto', padding: '20px 18px 32px' }}>
        <div style={{ width: 40, height: 4, background: C.light, borderRadius: 10, margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, color: C.dark }}>Nueva Reserva</div>
            <div style={{ fontSize: 11, color: C.muted }}>{nextId} · Se creará en Notion</div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: C.muted }}>×</button>
        </div>

        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>HUÉSPED</div>
        <Field label="Nombre completo *" value={form.guestName} onChange={f('guestName')} placeholder="Ej. Carlos Méndez" />
        <Field label="Email" value={form.guestEmail} onChange={f('guestEmail')} type="email" placeholder="correo@ejemplo.com" />
        <Field label="Teléfono" value={form.guestPhone} onChange={f('guestPhone')} placeholder="+57 300 000 0000" />

        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, margin: '16px 0 10px' }}>ESTADÍA</div>
        <Sel label="Propiedad" value={form.property} onChange={f('property')} options={PROPERTIES} />
        <Field label="Zona" value={form.zone} onChange={f('zone')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Check-in *" value={form.checkin} onChange={f('checkin')} type="date" />
          <Field label="Check-out *" value={form.checkout} onChange={f('checkout')} type="date" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>NOCHES</label>
            <div style={{ padding: '9px 12px', background: C.light, borderRadius: 8, fontSize: 14, fontWeight: 700, color: C.dark, textAlign: 'center' }}>{form.nights}</div>
          </div>
          <Field label="Huéspedes" value={form.guests} onChange={v => f('guests')(parseInt(v) || 1)} type="number" />
          <Sel label="Estado" value={form.status} onChange={f('status')} options={STATUSES} />
        </div>

        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, margin: '16px 0 10px' }}>FINANCIERO</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="ADR (COP/noche)" value={form.adr} onChange={v => f('adr')(parseInt(v) || 0)} type="number" />
          <Sel label="Plataforma" value={form.platform} onChange={f('platform')} options={PLATFORMS} />
        </div>
        <div style={{ background: C.dark, borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: C.light, fontSize: 12 }}>Total reserva</span>
          <span style={{ color: C.gold, fontSize: 16, fontWeight: 700 }}>COP {(form.adr * form.nights).toLocaleString('es-CO')}</span>
        </div>

        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, margin: '16px 0 10px' }}>ACCESO Y WIFI</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Código de acceso" value={form.accessCode} onChange={f('accessCode')} />
          <Field label="WiFi red" value={form.wifiName} onChange={f('wifiName')} />
        </div>
        <Field label="WiFi contraseña" value={form.wifiPass} onChange={f('wifiPass')} />

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>NOTAS OPERATIVAS</label>
          <textarea value={form.notes} onChange={e => f('notes')(e.target.value)} placeholder="Ej. Llega tarde, necesita early check-in..."
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.light}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia, serif', color: C.text, minHeight: 70, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        <button onClick={handleSave} disabled={saving || !form.guestName || !form.checkin || !form.checkout}
          style={{ width: '100%', background: saving ? C.mid : C.dark, color: C.cream, border: 'none', borderRadius: 12, padding: 16, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {saving
            ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Creando en Notion...</>
            : `✦ Crear ${nextId} en Notion`}
        </button>
      </div>
    </div>
  )
}

function ReservationDetail({ res, onClose, onStatusChange }) {
  const [status, setStatus] = useState(res.status)
  const guestLink = `${window.location.origin}/guest?id=${res.id}`

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.cream, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, maxHeight: '88vh', overflow: 'auto', padding: '20px 18px 32px' }}>
        <div style={{ width: 40, height: 4, background: C.light, borderRadius: 10, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 700 }}>{res.id}</div>
            <div style={{ fontSize: 18, color: C.dark }}>{res.guestName}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{res.property}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: C.muted }}>×</button>
        </div>

        <Badge status={status} />

        <div style={{ background: C.dark, borderRadius: 12, padding: 16, margin: '14px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { l: 'Check-in', v: res.checkin },
              { l: 'Check-out', v: res.checkout },
              { l: 'Noches', v: res.nights },
              { l: 'Huéspedes', v: res.guests },
              { l: 'ADR', v: `COP ${res.adr?.toLocaleString()}` },
              { l: 'Total', v: `COP ${res.total?.toLocaleString()}` },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ color: C.mid, fontSize: 9, letterSpacing: 1 }}>{item.l.toUpperCase()}</div>
                <div style={{ color: item.l === 'Total' ? C.gold : C.cream, fontSize: 13, fontWeight: 600 }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.white, borderRadius: 12, padding: 14, border: `1px solid ${C.light}`, marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>ACCESO Y WIFI</div>
          {[
            { l: 'Código de acceso', v: res.accessCode, mono: true, big: true },
            { l: 'WiFi', v: res.wifiName },
            { l: 'Contraseña WiFi', v: res.wifiPass, mono: true },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.muted }}>{item.l}</span>
              <span style={{ fontSize: item.big ? 18 : 12, fontWeight: 700, color: C.dark, letterSpacing: item.big ? 4 : 0, fontFamily: item.mono ? 'monospace' : 'Georgia,serif' }}>{item.v}</span>
            </div>
          ))}
        </div>

        {[
          { l: 'Email', v: res.guestEmail },
          { l: 'Teléfono', v: res.guestPhone },
          { l: 'Plataforma', v: res.platform },
        ].map((item, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 8, padding: '9px 14px', border: `1px solid ${C.light}`, marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.muted }}>{item.l}</span>
            <span style={{ color: C.dark, fontWeight: 600 }}>{item.v}</span>
          </div>
        ))}

        {res.notes && (
          <div style={{ background: C.white, borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.light}`, borderLeft: `3px solid ${C.gold}`, margin: '8px 0' }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>NOTAS</div>
            <div style={{ fontSize: 12, color: C.text, fontStyle: 'italic' }}>{res.notes}</div>
          </div>
        )}

        {/* Change status */}
        <div style={{ margin: '12px 0' }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>CAMBIAR ESTADO</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setStatus(s); onStatusChange(res.id, s) }}
                style={{ background: status === s ? C.dark : C.white, color: status === s ? C.cream : C.dark, border: `1px solid ${status === s ? C.dark : C.light}`, borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: status === s ? 700 : 400 }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notion link */}
        <a href={`https://notion.so/${res.notionPageId?.replace(/-/g, '')}`} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: C.white, border: `1px solid ${C.light}`, borderRadius: 10, padding: 12, textDecoration: 'none', color: C.dark, fontSize: 12, marginBottom: 8 }}>
          📋 Ver en Notion <span style={{ color: C.gold }}>↗</span>
        </a>

        {/* Guest App link */}
        <div style={{ background: C.dark, borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ color: C.mid, fontSize: 10, marginBottom: 6 }}>ENLACE PARA EL HUÉSPED</div>
          <div style={{ color: C.gold, fontSize: 11, fontFamily: 'monospace', marginBottom: 10, wordBreak: 'break-all' }}>{guestLink}</div>
          <button onClick={() => { navigator.clipboard?.writeText(guestLink); }} style={{ background: C.gold, color: C.dark, border: 'none', borderRadius: 8, padding: '7px 20px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
            📋 Copiar enlace
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [reservations, setReservations] = useState(DEMO_RESERVATIONS)
  const [view, setView] = useState('dashboard')
  const [filter, setFilter] = useState('Todas')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500) }
  const nextId = `RES-${String(reservations.length + 1).padStart(3, '0')}`

  const handleCreate = async formData => {
    setSyncing(true)
    try {
      const { notionPageId, notionUrl } = await createReservationInNotion(formData)
      setReservations(prev => [...prev, { ...formData, notionPageId, notionUrl, services: [] }])
      showToast(`✦ ${formData.id} creada en Notion`)
    } catch {
      setReservations(prev => [...prev, { ...formData, notionPageId: `local-${Date.now()}`, services: [] }])
      showToast(`✦ ${formData.id} guardada localmente`)
    }
    setSyncing(false)
    setShowForm(false)
  }

  const handleStatusChange = (id, newStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    showToast(`✦ Estado → ${newStatus}`)
  }

  const filtered = reservations.filter(r => {
    const matchStatus = filter === 'Todas' || r.status === filter
    const matchSearch = !search || r.guestName.toLowerCase().includes(search.toLowerCase()) || r.property.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const kpis = {
    total: reservations.length,
    activas: reservations.filter(r => r.status === 'En curso').length,
    confirmadas: reservations.filter(r => r.status === 'Confirmada').length,
    revenue: reservations.filter(r => r.status !== 'Cancelada').reduce((s, r) => s + (r.total || 0), 0),
    checkinPending: reservations.filter(r => !r.checkinDone && !['Completada', 'Cancelada'].includes(r.status)).length,
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f0ece4', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>

      {toast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: C.dark, color: C.cream, padding: '10px 20px', borderRadius: 30, fontSize: 12, zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {showForm && <NewReservationForm onSave={handleCreate} onCancel={() => setShowForm(false)} nextId={nextId} />}
      {selected && <ReservationDetail res={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />}

      {/* Header */}
      <div style={{ background: C.dark, padding: '18px 18px 14px', borderBottom: `2px solid ${C.gold}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: C.gold, fontSize: 18, letterSpacing: 3, fontWeight: 700 }}>SOLARA</div>
            <div style={{ color: C.mid, fontSize: 10, letterSpacing: 2, marginTop: 1 }}>PANEL DE ADMINISTRACIÓN</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: syncing ? C.gold : C.green, animation: syncing ? 'pulse 0.8s infinite' : 'none' }} />
              <span style={{ color: C.mid, fontSize: 9 }}>{syncing ? 'SYNC...' : 'NOTION'}</span>
            </div>
            <button onClick={() => setShowForm(true)} style={{ background: C.gold, color: C.dark, border: 'none', borderRadius: 20, padding: '7px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              + Nueva
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
          {[['dashboard', '📊 Dashboard'], ['list', '📋 Reservas']].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? 'rgba(201,168,76,0.2)' : 'transparent', color: view === v ? C.gold : C.mid, border: `1px solid ${view === v ? C.gold : 'transparent'}`, borderRadius: 20, padding: '5px 14px', cursor: 'pointer', fontSize: 11, fontWeight: view === v ? 700 : 400 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 24px' }}>

        {view === 'dashboard' && (
          <>
            <div style={{ background: C.white, borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.dark }}>📋 Sincronizado con Notion</div>
              <a href="https://www.notion.so/325f5763e9c381948aaafffd760bd5b4" target="_blank" rel="noreferrer" style={{ color: C.gold, fontSize: 10, textDecoration: 'none', border: `1px solid ${C.gold}`, borderRadius: 6, padding: '3px 8px' }}>Abrir ↗</a>
            </div>

            <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>RESUMEN</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { icon: '📅', label: 'Total reservas', val: kpis.total, color: C.dark },
                { icon: '🏃', label: 'En curso', val: kpis.activas, color: C.green },
                { icon: '✅', label: 'Confirmadas', val: kpis.confirmadas, color: C.blue },
                { icon: '⏳', label: 'Check-in pendiente', val: kpis.checkinPending, color: C.orange },
              ].map((k, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 12, padding: '14px 16px', border: `1px solid ${C.light}` }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.val}</div>
                  <div style={{ fontSize: 11, color: C.dark }}>{k.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.dark, borderRadius: 14, padding: '18px', marginBottom: 14 }}>
              <div style={{ color: C.mid, fontSize: 10, letterSpacing: 2 }}>REVENUE TOTAL GESTIONADO</div>
              <div style={{ color: C.gold, fontSize: 30, fontWeight: 700, margin: '6px 0 2px' }}>
                COP {kpis.revenue.toLocaleString('es-CO')}
              </div>
              <div style={{ color: C.mid, fontSize: 11 }}>{reservations.filter(r => r.status !== 'Cancelada').length} reservas activas</div>
            </div>

            <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>ÚLTIMAS RESERVAS</div>
            {reservations.slice(-4).reverse().map(r => (
              <div key={r.id} onClick={() => setSelected(r)} style={{ background: C.white, borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: `1px solid ${C.light}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: C.dark, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: C.gold, fontWeight: 700, flexShrink: 0 }}>
                  {r.guestName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.guestName}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{r.property} · {r.checkin}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Badge status={r.status} />
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, marginTop: 4 }}>{r.id}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {view === 'list' && (
          <>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar huésped, propiedad, ID..."
              style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.light}`, borderRadius: 10, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia, serif', color: C.text, marginBottom: 10, boxSizing: 'border-box' }} />

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
              {['Todas', ...STATUSES].map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{ flexShrink: 0, background: filter === s ? C.dark : C.white, color: filter === s ? C.cream : C.dark, border: `1px solid ${filter === s ? C.dark : C.light}`, borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: filter === s ? 700 : 400 }}>
                  {s} {s !== 'Todas' && <span style={{ opacity: 0.6 }}>({reservations.filter(r => r.status === s).length})</span>}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>{filtered.length} reserva{filtered.length !== 1 ? 's' : ''}</div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                No hay reservas con este filtro.
              </div>
            ) : filtered.map(r => (
              <div key={r.id} onClick={() => setSelected(r)} style={{ background: C.white, borderRadius: 14, padding: '14px 16px', marginBottom: 10, border: `1px solid ${C.light}`, cursor: 'pointer', boxShadow: '0 2px 8px rgba(71,82,62,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>{r.id}</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: C.dark, marginTop: 2 }}>{r.guestName}</div>
                  </div>
                  <Badge status={r.status} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11, color: C.muted, marginBottom: 10 }}>
                  <span>🏠 {r.property}</span>
                  <span>📱 {r.platform}</span>
                  <span>📅 {r.checkin} → {r.checkout}</span>
                  <span>👥 {r.guests} huéspedes</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${C.light}` }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>COP {r.total?.toLocaleString('es-CO')}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {r.checkinDone
                      ? <span style={{ fontSize: 10, color: C.green }}>✓ Check-in</span>
                      : <span style={{ fontSize: 10, color: C.orange }}>⏳ Pendiente</span>}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.light}; border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        button:active { transform: scale(0.97); }
        input:focus, select:focus, textarea:focus { border-color: ${C.dark} !important; }
      `}</style>
    </div>
  )
}
