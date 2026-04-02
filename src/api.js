import { CONFIG } from './config'

// ─── Proxy para evitar bloqueo CORS del navegador ─────────────────────────
// Las llamadas a Anthropic desde el navegador requieren un proxy intermedio
const PROXY_URL = 'https://corsproxy.io/?' + encodeURIComponent('https://api.anthropic.com/v1/messages')

async function callClaude({ system, messages, maxTokens = 800 }) {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text || ''
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
- Plataforma reserva: ${reservation.platform}
- ADR: COP ${reservation.adr?.toLocaleString('es-CO')}/noche
- Notas operativas: ${reservation.notes}
Responde SIEMPRE en español. Tono cálido y sofisticado. Máximo 3-4 oraciones cortas.
Cuando pregunten el código de acceso, dilo directamente: es ${reservation.accessCode}.
Cuando pregunten el WiFi, da la red y contraseña directamente.
Cuando pregunten el check-out, di que es a las 11:00h del ${reservation.checkout}.
Firma siempre como "SOLARA Concierge ✦".
Para emergencias urgentes: +57 304 616 0294.`,
    messages,
    maxTokens: 600,
  })
}

// ─── Crear reserva en Notion ──────────────────────────────────────────────
export async function createReservationInNotion(res) {
  // Por ahora guarda localmente — integración Notion requiere backend
  console.log('Reserva creada:', res)
  return {
    notionPageId: `local-${Date.now()}`,
    notionUrl: `https://notion.so/${CONFIG.notionReservasPage.replace(/-/g, '')}`,
  }
}

// ─── Log check-in ─────────────────────────────────────────────────────────
export async function logCheckinToNotion(notionPageId, resId) {
  console.log('Check-in completado:', resId)
}

// ─── Log servicios ────────────────────────────────────────────────────────
export async function logServicesToNotion(notionPageId, resId, services) {
  console.log('Servicios solicitados:', resId, services)
}Fix concierge
