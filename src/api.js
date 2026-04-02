import { CONFIG } from './config'

// ─── Llama a la Vercel Function (servidor) en lugar de Anthropic directamente
async function callClaude({ system, messages, maxTokens = 600 }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages, maxTokens }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.text || ''
}

// ─── Concierge IA ─────────────────────────────────────────────────────────
export async function askConcierge(messages, reservation) {
  return callClaude({
    system: `Eres el concierge virtual de SOLARA Luxury Hospitality.
Datos del huésped (de Notion):
- Nombre: ${reservation.guestName}
- Propiedad: ${reservation.property}, ${reservation.zone}, Medellín
- Check-in: ${reservation.checkin} a las 15:00h
- Check-out: ${reservation.checkout} a las 11:00h
- Noches: ${reservation.nights}
- Huéspedes: ${reservation.guests}
- WiFi red: ${reservation.wifiName}
- WiFi contraseña: ${reservation.wifiPass}
- Código de acceso al inmueble: ${reservation.accessCode}
- Plataforma: ${reservation.platform}
- ADR: COP ${reservation.adr?.toLocaleString('es-CO')}/noche
- Notas: ${reservation.notes}
Responde SIEMPRE en español. Tono cálido y sofisticado. Máximo 3 oraciones.
Si preguntan el código de acceso responde directamente: es ${reservation.accessCode}.
Si preguntan el WiFi da la red y contraseña directamente.
Si preguntan el check-out di que es a las 11:00h del ${reservation.checkout}.
Firma siempre como "SOLARA Concierge ✦".
Para emergencias: +57 304 616 0294.`,
    messages,
    maxTokens: 600,
  })
}

// ─── Crear reserva en Notion ──────────────────────────────────────────────
export async function createReservationInNotion(res) {
  console.log('Reserva creada:', res)
  return {
    notionPageId: `local-${Date.now()}`,
    notionUrl: `https://notion.so/${CONFIG.notionReservasPage.replace(/-/g, '')}`,
  }
}

export async function logCheckinToNotion(notionPageId, resId) {
  console.log('Check-in completado:', resId)
}

export async function logServicesToNotion(notionPageId, resId, services) {
  console.log('Servicios solicitados:', resId, services)
}
