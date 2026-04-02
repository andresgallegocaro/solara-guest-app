import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { C, DEMO_RESERVATIONS, STATUS_META } from '../config'
import { logCheckinToNotion, logServicesToNotion, askConcierge } from '../api'

const CHECKIN_STEPS = [
  { icon: '👤', title: 'Datos personales', desc: 'Nombre, DNI / pasaporte' },
  { icon: '📋', title: 'Aceptación de términos', desc: 'Políticas y normas del loft' },
  { icon: '🔑', title: 'Llave digital', desc: 'Código de acceso al inmueble' },
  { icon: '🗺️', title: 'Instrucciones de llegada', desc: 'Guía paso a paso' },
]

const UPSELLS = [
  { id: 1, icon: '🧘', title: 'Sesión de Yoga', desc: 'Mañana privada en terraza', price: '80.000 COP', tag: 'Popular' },
  { id: 2, icon: '🍾', title: 'Pack Bienvenida', desc: 'Vino + flores + snacks artesanales', price: '120.000 COP', tag: 'Romántico' },
  { id: 3, icon: '🚗', title: 'Traslado Aeropuerto', desc: 'Vehículo privado, conductor bilingüe', price: '95.000 COP', tag: null },
  { id: 4, icon: '📸', title: 'Sesión Fotográfica', desc: '1h con fotógrafo profesional', price: '180.000 COP', tag: 'Exclusivo' },
  { id: 5, icon: '🍽️', title: 'Cena Privada', desc: 'Chef a domicilio, menú degustación', price: '350.000 COP', tag: 'Lujo' },
  { id: 6, icon: '🧖', title: 'Masaje en Habitación', desc: '60 min, aceites premium', price: '150.000 COP', tag: null },
]

const EXPLORE = [
  { emoji: '🍽️', name: 'Celele', cat: 'Restaurante', dist: '4 min', tip: 'Cocina caribeña de autor. Reserva con anticipación.' },
  { emoji: '☕', name: 'Pergamino Café', cat: 'Café Specialty', dist: '6 min', tip: 'El mejor café de Medellín. Prueba el V60 de Huila.' },
  { emoji: '🌿', name: 'Parque El Poblado', cat: 'Naturaleza', dist: '3 min', tip: 'Perfecto para mañanas tranquilas.' },
  { emoji: '🛍️', name: 'Provenza', cat: 'Compras & Gastronomía', dist: '1 min', tip: 'El corazón del barrio. Diseñadores locales.' },
  { emoji: '🍸', name: 'El Social', cat: 'Cocktail Bar', dist: '8 min', tip: 'Cócteles creativos, terraza con vista.' },
  { emoji: '🎨', name: 'MAMM', cat: 'Cultura', dist: '12 min taxi', tip: 'Entrada gratuita domingos.' },
]

const NAV = [
  { id: 'home', icon: '🏠', label: 'Inicio' },
  { id: 'checkin', icon: '✅', label: 'Check-in' },
  { id: 'info', icon: 'ℹ️', label: 'Mi Estadía' },
  { id: 'services', icon: '✨', label: 'Servicios' },
  { id: 'explore', icon: '🗺️', label: 'Explorar' },
  { id: 'chat', icon: '💬', label: 'Concierge' },
]

function Badge({ status }) {
  const m = STATUS_META[status] || STATUS_META['Confirmada']
  return (
    <span style={{ background: m.bg, color: m.color, borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot }} />
      {status}
    </span>
  )
}

export default function GuestApp() {
  const [searchParams] = useSearchParams()
  const resId = searchParams.get('id') || 'RES-001'

  // Find the reservation — in production this would fetch from Notion
  const res = DEMO_RESERVATIONS.find(r => r.id === resId) || DEMO_RESERVATIONS[0]

  const [section, setSection] = useState('home')
  const [checkinStep, setCheckinStep] = useState(res.checkinDone ? 4 : 0)
  const [wifiVisible, setWifiVisible] = useState(false)
  const [keyVisible, setKeyVisible] = useState(res.checkinDone)
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState('')
  const [chatMsgs, setChatMsgs] = useState([{
    role: 'assistant',
    content: `¡Bienvenido, ${res.guestName}! 🌟 Soy tu concierge personal para ${res.property}.\n\nEstás hospedado del **${res.checkin}** al **${res.checkout}** (${res.nights} noches). ¿En qué puedo ayudarte?\n\n*SOLARA Concierge ✦*`
  }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const addToCart = (item) => {
    if (!cart.find(c => c.id === item.id)) {
      setCart(prev => [...prev, item])
      showToast(`✦ ${item.title} añadido`)
    } else {
      setCart(prev => prev.filter(c => c.id !== item.id))
    }
  }

  const submitServices = async () => {
    if (!cart.length) return
    showToast('📋 Guardando en Notion...')
    try {
      await logServicesToNotion(res.notionPageId, res.id, cart)
      showToast('✦ Solicitud registrada. Te contactamos pronto.')
    } catch {
      showToast('✦ Solicitud recibida. Te contactamos en breve.')
    }
    setCart([])
  }

  const completeCheckinStep = async (i) => {
    const next = checkinStep + 1
    setCheckinStep(next)
    if (i === 2) setKeyVisible(true)
    showToast('✦ Paso completado')
    if (next === CHECKIN_STEPS.length) {
      try { await logCheckinToNotion(res.notionPageId, res.id) } catch {}
    }
  }

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = { role: 'user', content: chatInput }
    const updated = [...chatMsgs, userMsg]
    setChatMsgs(updated)
    setChatInput('')
    setChatLoading(true)
    try {
      const reply = await askConcierge(updated, res)
      setChatMsgs([...updated, { role: 'assistant', content: reply }])
    } catch {
      setChatMsgs([...updated, { role: 'assistant', content: 'Contáctanos al +57 304 616 0294 🙏' }])
    }
    setChatLoading(false)
  }

  const progressPct = (checkinStep / CHECKIN_STEPS.length) * 100

  const daysUntilCheckin = () => {
    const diff = Math.ceil((new Date(res.checkin) - new Date()) / 86400000)
    if (diff > 0) return `Faltan ${diff} días`
    if (diff === 0) return '¡Hoy es tu llegada!'
    return `Día ${Math.abs(diff) + 1} de ${res.nights}`
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: C.cream, minHeight: '100vh', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {toast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: C.dark, color: C.cream, padding: '10px 20px', borderRadius: 30, fontSize: 12, zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: C.dark, padding: '16px 18px 12px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: C.gold, fontSize: 17, letterSpacing: 3, fontWeight: 700 }}>SOLARA</span>
              <span style={{ color: C.mid, fontSize: 9, letterSpacing: 2 }}>✦ HOMES</span>
            </div>
            <div style={{ color: C.light, fontSize: 11, marginTop: 2 }}>{res.property} · {res.zone}</div>
          </div>
          <Badge status={res.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
          <span style={{ color: C.mid, fontSize: 9, letterSpacing: 1 }}>NOTION SYNC · {res.id}</span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: C.dark, display: 'flex', borderBottom: `2px solid ${C.gold}`, overflowX: 'auto' }}>
        {NAV.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            flex: '0 0 auto', background: section === s.id ? C.gold : 'transparent',
            color: section === s.id ? C.dark : C.light,
            border: 'none', cursor: 'pointer', padding: '9px 12px',
            fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            fontFamily: 'Georgia, serif', minWidth: 60,
          }}>
            <span style={{ fontSize: 15 }}>{s.icon}</span>
            <span style={{ fontWeight: section === s.id ? 700 : 400 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>

        {section === 'home' && (
          <div>
            <div style={{ background: `linear-gradient(155deg, ${C.dark} 0%, #2c3827 55%, #1a2218 100%)`, padding: '22px 20px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: `radial-gradient(circle, ${C.gold}1a, transparent 70%)`, borderRadius: '50%' }} />
              <div style={{ color: C.light, fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>BIENVENIDO</div>
              <div style={{ color: C.cream, fontSize: 22 }}>{res.guestName.split(' ')[0]} ✦</div>
              <div style={{ color: C.gold, fontSize: 13, marginBottom: 4 }}>{res.property}</div>
              <div style={{ color: C.mid, fontSize: 11, marginBottom: 16 }}>{daysUntilCheckin()}</div>
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', border: `1px solid rgba(201,168,76,0.25)` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'CHECK-IN', val: res.checkin.slice(5).replace('-', '/') },
                    { label: 'NOCHES', val: res.nights },
                    { label: 'HUÉSPEDES', val: res.guests },
                    { label: 'CHECKOUT', val: res.checkout.slice(5).replace('-', '/') },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ color: C.gold, fontSize: 17, fontWeight: 600 }}>{item.val}</div>
                      <div style={{ color: C.mid, fontSize: 8, letterSpacing: 0.5 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {res.notes && (
              <div style={{ margin: '12px 18px 0', background: C.white, borderRadius: 10, padding: '12px 14px', border: `1px solid ${C.light}`, borderLeft: `3px solid ${C.gold}` }}>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>NOTAS OPERATIVAS</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5, fontStyle: 'italic' }}>{res.notes}</div>
              </div>
            )}

            <div style={{ padding: '14px 18px 4px' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, marginBottom: 10 }}>ACCIONES RÁPIDAS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { icon: '✅', label: 'Check-in Online', sub: checkinStep >= 4 ? 'Completado ✓' : `Paso ${checkinStep}/4`, action: () => setSection('checkin') },
                  { icon: '📶', label: 'WiFi', sub: 'Ver contraseña', action: () => { setWifiVisible(true); setSection('info') } },
                  { icon: '✨', label: 'Pedir Servicio', sub: 'Catálogo premium', action: () => setSection('services') },
                  { icon: '💬', label: 'Concierge IA', sub: 'Responde al instante', action: () => setSection('chat') },
                ].map((q, i) => (
                  <button key={i} onClick={q.action} style={{ background: C.white, border: `1px solid ${C.light}`, borderRadius: 12, padding: '14px 12px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 8px rgba(71,82,62,0.07)' }}>
                    <div style={{ fontSize: 24, marginBottom: 5 }}>{q.icon}</div>
                    <div style={{ fontSize: 12, color: C.dark, fontWeight: 600 }}>{q.label}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{q.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ margin: '12px 18px 0', background: C.white, borderRadius: 12, padding: '14px 16px', border: `1px solid ${C.light}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>Check-in Online</span>
                <span style={{ fontSize: 11, color: C.gold }}>{checkinStep}/4 pasos</span>
              </div>
              <div style={{ background: C.light, borderRadius: 10, height: 5, marginBottom: 10 }}>
                <div style={{ background: checkinStep >= 4 ? C.green : C.dark, height: 5, borderRadius: 10, width: `${progressPct}%`, transition: 'width 0.5s ease' }} />
              </div>
              <button onClick={() => setSection('checkin')} style={{ background: checkinStep >= 4 ? C.greenBg : C.dark, color: checkinStep >= 4 ? C.green : C.cream, border: checkinStep >= 4 ? `1px solid ${C.green}` : 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 12, width: '100%', fontWeight: 600 }}>
                {checkinStep >= 4 ? '✓ Check-in completado' : 'Continuar →'}
              </button>
            </div>
          </div>
        )}

        {section === 'checkin' && (
          <div style={{ padding: '18px' }}>
            <div style={{ fontSize: 20, color: C.dark, marginBottom: 4 }}>Check-in Online</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>Se registra automáticamente en Notion</div>
            <div style={{ background: C.light, borderRadius: 10, height: 7, marginBottom: 20 }}>
              <div style={{ background: checkinStep >= 4 ? C.green : C.dark, height: 7, borderRadius: 10, width: `${progressPct}%`, transition: 'width 0.5s' }} />
            </div>
            {CHECKIN_STEPS.map((step, i) => {
              const done = i < checkinStep
              const active = i === checkinStep
              return (
                <div key={i} style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 8, border: `1px solid ${done ? C.dark : active ? C.gold : C.light}`, opacity: i > checkinStep ? 0.45 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: done ? C.dark : active ? C.gold : C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: done ? 16 : 18, color: done ? C.cream : C.dark, flexShrink: 0, fontWeight: 700 }}>
                      {done ? '✓' : step.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{step.title}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{step.desc}</div>
                    </div>
                    {active && (
                      <button onClick={() => completeCheckinStep(i)} style={{ background: C.dark, color: C.cream, border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                        Completar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {keyVisible && (
              <div style={{ background: C.dark, borderRadius: 14, padding: 22, marginTop: 10, textAlign: 'center' }}>
                <div style={{ color: C.gold, fontSize: 38, marginBottom: 8 }}>🔑</div>
                <div style={{ color: C.light, fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>CÓDIGO DE ACCESO</div>
                <div style={{ color: C.gold, fontSize: 46, fontWeight: 700, letterSpacing: 12, margin: '6px 0 12px', fontFamily: 'monospace' }}>{res.accessCode}</div>
                <div style={{ color: C.mid, fontSize: 11 }}>Válido: {res.checkin} → {res.checkout}</div>
              </div>
            )}
          </div>
        )}

        {section === 'info' && (
          <div style={{ padding: '18px' }}>
            <div style={{ fontSize: 20, color: C.dark, marginBottom: 14 }}>Tu Estadía</div>
            <div style={{ background: C.white, borderRadius: 12, padding: 16, marginBottom: 10, border: `1px solid ${C.light}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>📶 WiFi</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{res.wifiName}</div>
                  <div style={{ fontSize: 15, color: C.dark, fontWeight: 700, marginTop: 5, letterSpacing: 1.5, fontFamily: 'monospace' }}>
                    {wifiVisible ? res.wifiPass : '••••••••••••'}
                  </div>
                </div>
                <button onClick={() => setWifiVisible(!wifiVisible)} style={{ background: C.dark, color: C.cream, border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 11 }}>
                  {wifiVisible ? 'Ocultar' : 'Ver clave'}
                </button>
              </div>
            </div>
            {[
              { icon: '🏠', label: 'Propiedad', val: res.property },
              { icon: '📍', label: 'Ubicación', val: res.zone },
              { icon: '🛏️', label: 'Habitaciones', val: `${res.rooms} hab · ${res.guests} huéspedes` },
              { icon: '📅', label: 'Check-in', val: `${res.checkin} · desde 15:00h` },
              { icon: '📅', label: 'Check-out', val: `${res.checkout} · hasta 11:00h` },
              { icon: '💰', label: 'Total', val: `COP ${res.total?.toLocaleString('es-CO')}` },
              { icon: '📞', label: 'SOLARA 24/7', val: '+57 304 616 0294' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 10, padding: '11px 14px', marginBottom: 6, border: `1px solid ${C.light}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 9, color: C.muted }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: C.dark, fontWeight: 600 }}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'services' && (
          <div style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 20, color: C.dark }}>Servicios</div>
              {cart.length > 0 && <div style={{ background: C.gold, color: C.dark, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>{cart.length} selec.</div>}
            </div>
            {UPSELLS.map(item => {
              const inCart = !!cart.find(c => c.id === item.id)
              return (
                <div key={item.id} style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 8, border: `1px solid ${inCart ? C.dark : C.light}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{item.title}</span>
                        {item.tag && <span style={{ background: C.light, color: C.dark, fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>{item.tag}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, margin: '3px 0' }}>{item.desc}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{item.price}</div>
                    </div>
                    <button onClick={() => addToCart(item)} style={{ background: inCart ? C.dark : C.cream, color: inCart ? C.cream : C.dark, border: `1px solid ${C.dark}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 18 }}>
                      {inCart ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              )
            })}
            {cart.length > 0 && (
              <button onClick={submitServices} style={{ background: C.dark, color: C.cream, border: 'none', borderRadius: 12, padding: 16, cursor: 'pointer', width: '100%', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                ✦ Solicitar {cart.length} servicio{cart.length > 1 ? 's' : ''} — Guardar en Notion
              </button>
            )}
          </div>
        )}

        {section === 'explore' && (
          <div style={{ padding: '18px' }}>
            <div style={{ fontSize: 20, color: C.dark, marginBottom: 4 }}>Explorar</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>Alrededor de {res.zone} · Selección SOLARA</div>
            {EXPLORE.map((place, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 8, border: `1px solid ${C.light}` }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 26 }}>{place.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{place.name}</span>
                      <span style={{ fontSize: 10, color: C.muted }}>{place.dist}</span>
                    </div>
                    <div style={{ fontSize: 9, color: C.gold, letterSpacing: 1, marginBottom: 6 }}>{place.cat.toUpperCase()}</div>
                    <div style={{ background: C.cream, borderRadius: 8, padding: '7px 10px', fontSize: 11, color: C.muted, fontStyle: 'italic', borderLeft: `3px solid ${C.gold}` }}>
                      💡 {place.tip}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 132px)' }}>
            <div style={{ padding: '12px 18px 8px', borderBottom: `1px solid ${C.light}` }}>
              <div style={{ fontSize: 18, color: C.dark }}>Concierge SOLARA</div>
              <div style={{ fontSize: 10, color: C.muted }}>IA con contexto de tu reserva · {res.id} · 24/7</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chatMsgs.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 28, height: 28, background: C.dark, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: C.gold, marginRight: 8, flexShrink: 0, marginTop: 2 }}>✦</div>
                  )}
                  <div style={{ background: msg.role === 'user' ? C.dark : C.white, color: msg.role === 'user' ? C.cream : C.text, borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', maxWidth: '78%', fontSize: 13, lineHeight: 1.55, border: msg.role === 'assistant' ? `1px solid ${C.light}` : 'none', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 28, height: 28, background: C.dark, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>✦</div>
                  <div style={{ background: C.white, borderRadius: '14px 14px 14px 4px', padding: '10px 14px', fontSize: 13, color: C.muted, border: `1px solid ${C.light}` }}>Escribiendo...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '6px 14px', overflowX: 'auto', display: 'flex', gap: 7, borderTop: `1px solid ${C.light}` }}>
              {['¿Cuál es el código de acceso?', '¿A qué hora es el check-out?', 'Recomiéndame un restaurante'].map((q, i) => (
                <button key={i} onClick={() => setChatInput(q)} style={{ background: C.white, border: `1px solid ${C.mid}`, borderRadius: 20, padding: '5px 11px', cursor: 'pointer', fontSize: 10, color: C.dark, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {q}
                </button>
              ))}
            </div>
            <div style={{ padding: '10px 16px 14px', background: C.cream, display: 'flex', gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Escribe tu pregunta..." style={{ flex: 1, padding: '11px 14px', border: `1px solid ${C.mid}`, borderRadius: 24, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia, serif', color: C.text }} />
              <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} style={{ background: chatInput.trim() && !chatLoading ? C.dark : C.light, color: C.cream, border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✦</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.light}; border-radius: 10px; }
        button:active { transform: scale(0.97); }
      `}</style>
    </div>
  )
}
