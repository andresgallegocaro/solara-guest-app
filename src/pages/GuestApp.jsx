import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { C, DEMO_RESERVATIONS, STATUS_META } from '../config'
import { logCheckinToNotion, logServicesToNotion, askConcierge } from '../api'

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

const TYC_TEXT = `TÉRMINOS Y CONDICIONES — SOLARA HOMES S.A.S.

1. ACEPTACIÓN
Al completar el check-in, el huésped acepta íntegramente estos Términos y Condiciones. Esta aceptación tiene carácter vinculante bajo la legislación colombiana.

2. USO DEL INMUEBLE
El inmueble se arrienda exclusivamente para uso residencial temporal vacacional o turístico. Queda expresamente prohibido:
• Fiestas o eventos con personas distintas a los huéspedes registrados
• Actividades comerciales de cualquier naturaleza
• Turismo sexual o cualquier actividad ilícita
• Reuniones que excedan la capacidad máxima del inmueble

3. CAPACIDAD MÁXIMA
Solo pueden pernoctar las personas registradas en la reserva. No se admiten visitantes nocturnos (22:00h – 08:00h) sin autorización previa.

4. HORARIOS
• Check-in: desde las 15:00h
• Check-out: hasta las 11:00h
• Silencio: 22:00h – 08:00h

5. MASCOTAS Y TABACO
No se permite fumar en el interior (incluido balcón). Las mascotas requieren autorización previa y depósito adicional de COP 200.000.

6. CUIDADO DEL INMUEBLE
El huésped se compromete a entregar el inmueble en el mismo estado en que lo recibió. Cualquier daño será cobrado a valor de reposición + 20% de penalización.

7. CANCELACIONES
• Más de 7 días: reembolso del 80%
• 3–7 días: reembolso del 50%
• Menos de 72h: sin reembolso
• No-show: sin reembolso

8. PRIVACIDAD
Los datos del huésped se tratan conforme a la Ley 1581 de 2012 (Habeas Data Colombia) y se usan exclusivamente para la gestión de la reserva.

TABLA DE MULTAS Y PENALIZACIONES:
• Fiesta o evento no autorizado: USD 1.000
• Superar capacidad máxima: COP 500.000/persona adicional
• Fumar en el interior: COP 300.000 + limpieza especializada
• Consumo de sustancias ilegales: USD 1.000 + denuncia
• Daños a muebles o equipamiento: valor de reposición + 20%
• Incumplimiento horario de silencio (reincidencia): COP 200.000/noche
• Check-out tardío sin autorización: COP 100.000/hora
• Mascota no autorizada: COP 300.000
• Pérdida de código de acceso: COP 100.000

Al aceptar, declaro haber leído y comprendido íntegramente estos Términos y Condiciones.`

function Badge({ status }) {
  const m = STATUS_META[status] || STATUS_META['Confirmada']
  return (
    <span style={{ background: m.bg, color: m.color, borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot }} />
      {status}
    </span>
  )
}

// ── PASO 1: Formulario de datos personales ────────────────────────────────
function StepDatos({ onComplete }) {
  const [form, setForm] = useState({
    nombre: '', apellido: '', tipoDoc: 'Cédula', numDoc: '',
    nacionalidad: '', fechaNac: '', email: '', telefono: '',
  })
  const f = k => v => setForm(p => ({ ...p, [k]: v }))
  const valid = form.nombre && form.apellido && form.numDoc && form.email

  return (
    <div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
        Esta información es requerida por ley colombiana para alojamientos turísticos (Decreto 2590/2009).
      </div>

      {[
        { label: 'Nombre *', key: 'nombre', placeholder: 'Ej. Carlos' },
        { label: 'Apellido(s) *', key: 'apellido', placeholder: 'Ej. Méndez García' },
      ].map(({ label, key, placeholder }) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>{label}</label>
          <input value={form[key]} onChange={e => f(key)(e.target.value)} placeholder={placeholder}
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.light}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia,serif', color: C.text, boxSizing: 'border-box' }} />
        </div>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>TIPO DOCUMENTO *</label>
          <select value={form.tipoDoc} onChange={e => f('tipoDoc')(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.light}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia,serif', color: C.text, boxSizing: 'border-box' }}>
            {['Cédula', 'Pasaporte', 'Cédula Extranjería', 'DNI', 'Otro'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>NÚMERO *</label>
          <input value={form.numDoc} onChange={e => f('numDoc')(e.target.value)} placeholder="123456789"
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.light}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia,serif', color: C.text, boxSizing: 'border-box' }} />
        </div>
      </div>

      {[
        { label: 'Nacionalidad', key: 'nacionalidad', placeholder: 'Ej. Colombiana' },
        { label: 'Fecha de nacimiento', key: 'fechaNac', placeholder: 'DD/MM/AAAA', type: 'text' },
        { label: 'Email *', key: 'email', placeholder: 'correo@ejemplo.com', type: 'email' },
        { label: 'Teléfono / WhatsApp', key: 'telefono', placeholder: '+57 300 000 0000' },
      ].map(({ label, key, placeholder, type = 'text' }) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>{label.toUpperCase()}</label>
          <input type={type} value={form[key]} onChange={e => f(key)(e.target.value)} placeholder={placeholder}
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.light}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia,serif', color: C.text, boxSizing: 'border-box' }} />
        </div>
      ))}

      <button onClick={() => valid && onComplete(form)} disabled={!valid}
        style={{ width: '100%', background: valid ? C.dark : C.light, color: C.cream, border: 'none', borderRadius: 10, padding: '14px', cursor: valid ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
        Continuar →
      </button>
      {!valid && <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 8 }}>Completa los campos obligatorios (*)</div>}
    </div>
  )
}

// ── PASO 2: Términos y condiciones legibles ───────────────────────────────
function StepTyC({ onComplete }) {
  const [read, setRead] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const scrollRef = useRef(null)

  const handleScroll = (e) => {
    const el = e.target
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) setRead(true)
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
        Lee los términos completos antes de aceptar. Desplázate hasta el final para activar la aceptación.
      </div>

      <div ref={scrollRef} onScroll={handleScroll}
        style={{ background: C.white, border: `1px solid ${C.light}`, borderRadius: 10, padding: '14px 16px', maxHeight: 280, overflowY: 'auto', fontSize: 12, lineHeight: 1.7, color: C.text, whiteSpace: 'pre-line', marginBottom: 14 }}>
        {TYC_TEXT}
        <div style={{ height: 20 }} />
        <div style={{ textAlign: 'center', color: C.muted, fontSize: 11 }}>— Fin de los Términos y Condiciones —</div>
      </div>

      {!read && (
        <div style={{ background: '#fff3cd', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#856404', marginBottom: 12, textAlign: 'center' }}>
          ↓ Desplázate hasta el final para poder aceptar
        </div>
      )}

      {read && (
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: C.dark }} />
          <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>
            He leído y acepto íntegramente los Términos y Condiciones de SOLARA Homes S.A.S., incluyendo la tabla de multas y penalizaciones.
          </span>
        </label>
      )}

      <button onClick={() => accepted && onComplete()} disabled={!accepted}
        style={{ width: '100%', background: accepted ? C.dark : C.light, color: C.cream, border: 'none', borderRadius: 10, padding: '14px', cursor: accepted ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600 }}>
        Acepto los Términos y Condiciones →
      </button>
    </div>
  )
}

// ── PASO 4: Instrucciones de llegada ─────────────────────────────────────
function StepInstrucciones({ res, onComplete }) {
  const [read, setRead] = useState(false)

  const handleScroll = (e) => {
    const el = e.target
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) setRead(true)
  }

  const instrucciones = `📍 DIRECCIÓN
${res.property} — ${res.zone}
Cra. 43F #11-45, Segundo Piso, Manila, El Poblado, Medellín

🚗 CÓMO LLEGAR

Desde el aeropuerto José María Córdova (Rionegro):
• Toma el bus Aircoach hacia el centro (~45 min, COP 14.000)
• O pide un Uber / InDriver desde el aeropuerto (~COP 80.000–100.000, 45 min)
• Indica la dirección exacta: Cra. 43F #11-45, Manila, El Poblado

Desde el aeropuerto Olaya Herrera (Medellín):
• Uber / InDriver ~15 min (COP 15.000–25.000)

Desde el Metro (si llegas en transporte público):
• Estación Aguacatala (Línea A) → Uber/taxi 5 min
• O camina 10 min subiendo por la Av. El Poblado hacia Manila

🏢 ENTRADA AL EDIFICIO

1. Llega a la Cra. 43F #11-45
2. El apartamento está en el SEGUNDO PISO
3. Introduce el código ${res.accessCode} en el panel de la puerta principal
4. Sube las escaleras al segundo piso
5. El apartamento es la puerta de la izquierda al llegar al rellano

🔑 TU CÓDIGO DE ACCESO
${res.accessCode}
(Válido durante toda tu estancia: ${res.checkin} → ${res.checkout})

⏰ HORARIOS IMPORTANTES
• Check-in: desde las 15:00h
• Check-out: hasta las 11:00h
• Si llegas antes de las 15:00h, podemos guardar tu equipaje si el apartamento está disponible (consulta al concierge)
• Si necesitas late check-out, consulta disponibilidad con al menos 24h de antelación

📶 WIFI
Red: ${res.wifiName}
Contraseña: ${res.wifiPass}

🆘 EMERGENCIAS 24/7
SOLARA Concierge: +57 304 616 0294
WhatsApp: +57 304 616 0294

💡 TIPS PARA TU LLEGADA
• El barrio Manila es completamente seguro a cualquier hora
• Uber e InDriver funcionan perfectamente en toda la zona
• Hay supermercado Carulla a 5 min caminando para abastecerte al llegar
• El apartamento tiene cafetera lista para usar — el café está incluido en tu bienvenida`

  return (
    <div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
        Lee las instrucciones completas para llegar sin problemas.
      </div>

      <div onScroll={handleScroll}
        style={{ background: C.white, border: `1px solid ${C.light}`, borderRadius: 10, padding: '14px 16px', maxHeight: 320, overflowY: 'auto', fontSize: 12, lineHeight: 1.8, color: C.text, whiteSpace: 'pre-line', marginBottom: 14 }}>
        {instrucciones}
        <div style={{ height: 20 }} />
        <div style={{ textAlign: 'center', color: C.muted, fontSize: 11 }}>— Fin de las instrucciones —</div>
      </div>

      {!read && (
        <div style={{ background: '#fff3cd', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#856404', marginBottom: 12, textAlign: 'center' }}>
          ↓ Desplázate hasta el final para confirmar que las has leído
        </div>
      )}

      <button onClick={() => read && onComplete()} disabled={!read}
        style={{ width: '100%', background: read ? C.dark : C.light, color: C.cream, border: 'none', borderRadius: 10, padding: '14px', cursor: read ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600 }}>
        ✓ He leído las instrucciones de llegada →
      </button>
    </div>
  )
}

export default function GuestApp() {
  const [searchParams] = useSearchParams()
  const resId = searchParams.get('id') || 'RES-001'
  const res = DEMO_RESERVATIONS.find(r => r.id === resId) || DEMO_RESERVATIONS[0]

  const [section, setSection] = useState('home')
  const [checkinStep, setCheckinStep] = useState(res.checkinDone ? 4 : 0)
  const [activeSubStep, setActiveSubStep] = useState(null) // 'datos' | 'tyc' | 'instrucciones'
  const [guestData, setGuestData] = useState(null)
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

  const completeCheckinStep = async (stepIndex) => {
    const next = checkinStep + 1
    setCheckinStep(next)
    setActiveSubStep(null)
    if (stepIndex === 2) setKeyVisible(true)
    showToast('✦ Paso completado')
    if (next === 4) {
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

  const progressPct = (checkinStep / 4) * 100
  const daysUntilCheckin = () => {
    const diff = Math.ceil((new Date(res.checkin) - new Date()) / 86400000)
    if (diff > 0) return `Faltan ${diff} días`
    if (diff === 0) return '¡Hoy es tu llegada!'
    return `Día ${Math.abs(diff) + 1} de ${res.nights}`
  }

  // Steps definition
  const STEPS = [
    { icon: '👤', title: 'Datos personales', desc: 'Nombre, documento, contacto' },
    { icon: '📋', title: 'Términos y condiciones', desc: 'Leer y aceptar políticas' },
    { icon: '🔑', title: 'Llave digital', desc: 'Tu código de acceso' },
    { icon: '🗺️', title: 'Instrucciones de llegada', desc: 'Cómo llegar al apartamento' },
  ]

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
          <button key={s.id} onClick={() => { setSection(s.id); setActiveSubStep(null) }} style={{
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

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>

        {/* ── HOME ── */}
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
<div onClick={() => window.location.href = '/guest/loyalty'} style={{ cursor: 'pointer', background: '#47523e', color: '#fff', borderRadius: 12, padding: '16px 18px', marginTop: 12 }}>
          <p style={{ fontSize: 10, color: '#919c89', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>SOLARA Loyalty</p>
          <p style={{ fontSize: 17, fontWeight: 500, margin: '0 0 2px' }}>◆ Silver · 820 puntos</p>
          <p style={{ fontSize: 12, color: '#919c89', margin: 0 }}>Ver recompensas y mi progreso →</p>
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

        {/* ── CHECK-IN ── */}
        {section === 'checkin' && (
          <div style={{ padding: '18px' }}>

            {/* Si hay un sub-paso activo, mostrarlo en pantalla completa */}
            {activeSubStep === 'datos' && (
              <div>
                <button onClick={() => setActiveSubStep(null)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ← Volver
                </button>
                <div style={{ fontSize: 18, color: C.dark, marginBottom: 4 }}>👤 Datos Personales</div>
                <StepDatos onComplete={(data) => { setGuestData(data); completeCheckinStep(0) }} />
              </div>
            )}

            {activeSubStep === 'tyc' && (
              <div>
                <button onClick={() => setActiveSubStep(null)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ← Volver
                </button>
                <div style={{ fontSize: 18, color: C.dark, marginBottom: 4 }}>📋 Términos y Condiciones</div>
                <StepTyC onComplete={() => completeCheckinStep(1)} />
              </div>
            )}

            {activeSubStep === 'instrucciones' && (
              <div>
                <button onClick={() => setActiveSubStep(null)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ← Volver
                </button>
                <div style={{ fontSize: 18, color: C.dark, marginBottom: 4 }}>🗺️ Instrucciones de Llegada</div>
                <StepInstrucciones res={res} onComplete={() => completeCheckinStep(3)} />
              </div>
            )}

            {/* Vista principal del check-in */}
            {!activeSubStep && (
              <>
                <div style={{ fontSize: 20, color: C.dark, marginBottom: 4 }}>Check-in Online</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>Completa todos los pasos antes de tu llegada</div>

                <div style={{ background: C.light, borderRadius: 10, height: 7, marginBottom: 20 }}>
                  <div style={{ background: checkinStep >= 4 ? C.green : C.dark, height: 7, borderRadius: 10, width: `${progressPct}%`, transition: 'width 0.5s' }} />
                </div>

                {STEPS.map((step, i) => {
                  const done = i < checkinStep
                  const active = i === checkinStep
                  const subStepKey = i === 0 ? 'datos' : i === 1 ? 'tyc' : i === 3 ? 'instrucciones' : null

                  return (
                    <div key={i} style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 8, border: `1px solid ${done ? C.dark : active ? C.gold : C.light}`, opacity: i > checkinStep ? 0.45 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: done ? C.dark : active ? C.gold : C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: done ? 16 : 18, color: done ? C.cream : C.dark, flexShrink: 0, fontWeight: 700 }}>
                          {done ? '✓' : step.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{step.title}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{step.desc}</div>
                          {done && i === 0 && guestData && (
                            <div style={{ fontSize: 10, color: C.green, marginTop: 2 }}>✓ {guestData.nombre} {guestData.apellido} · {guestData.tipoDoc} {guestData.numDoc}</div>
                          )}
                        </div>
                        {active && (
                          <button
                            onClick={() => {
                              if (subStepKey) {
                                setActiveSubStep(subStepKey)
                              } else {
                                // Paso 3 (llave digital) — se completa directamente
                                setKeyVisible(true)
                                completeCheckinStep(i)
                              }
                            }}
                            style={{ background: C.dark, color: C.cream, border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {subStepKey ? 'Abrir →' : 'Ver código'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Código de acceso */}
                {keyVisible && (
                  <div style={{ background: C.dark, borderRadius: 14, padding: 22, marginTop: 10, textAlign: 'center' }}>
                    <div style={{ color: C.gold, fontSize: 38, marginBottom: 8 }}>🔑</div>
                    <div style={{ color: C.light, fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>CÓDIGO DE ACCESO</div>
                    <div style={{ color: C.gold, fontSize: 46, fontWeight: 700, letterSpacing: 12, margin: '6px 0 12px', fontFamily: 'monospace' }}>{res.accessCode}</div>
                    <div style={{ color: C.mid, fontSize: 11 }}>Puerta principal · Segundo piso</div>
                    <div style={{ color: C.mid, fontSize: 11, marginTop: 4 }}>Válido: {res.checkin} → {res.checkout}</div>
                  </div>
                )}

                {checkinStep >= 4 && (
                  <div style={{ background: '#4caf5015', border: '1px solid #4caf50', borderRadius: 12, padding: 16, marginTop: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>✅</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#2e7d32' }}>Check-in completado</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Registrado en Notion · {new Date().toLocaleDateString('es-CO')}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── INFO ── */}
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
            <div style={{ background: C.dark, borderRadius: 12, padding: 14, marginTop: 6 }}>
              <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>✦ Normas del Activo</div>
              {['No fumar en interiores (incluido balcón)', 'Mascotas previa autorización', 'Silencio desde las 22h', `Capacidad máxima: ${res.rooms + 3} personas`, 'No fiestas ni eventos privados'].map((r, i) => (
                <div key={i} style={{ color: C.light, fontSize: 11, marginBottom: 5, display: 'flex', gap: 8 }}>
                  <span style={{ color: C.mid }}>—</span>{r}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SERVICES ── */}
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
                ✦ Solicitar {cart.length} servicio{cart.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* ── EXPLORE ── */}
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

        {/* ── CHAT ── */}
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
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Escribe tu pregunta..."
                style={{ flex: 1, padding: '11px 14px', border: `1px solid ${C.mid}`, borderRadius: 24, fontSize: 13, outline: 'none', background: C.white, fontFamily: 'Georgia, serif', color: C.text }} />
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
        input:focus, select:focus { border-color: ${C.dark} !important; }
      `}</style>
    </div>
  )
}
