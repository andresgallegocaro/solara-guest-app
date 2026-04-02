import { CONFIG } from './config'

// ─── Base Claude API call ─────────────────────────────────────────────────
async function callClaude({ system, userMessage, mcpServers = [], maxTokens = 1000 }) {
  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userMessage }],
  }
  if (mcpServers.length > 0) body.mcp_servers = mcpServers

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'mcp-client-2025-04-04',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// ─── Notion MCP helper ────────────────────────────────────────────────────
const NOTION_MCP = [{ type: 'url', url: 'https://mcp.notion.com/mcp', name: 'notion' }]

// ─── Crear reserva en Notion ──────────────────────────────────────────────
export async function createReservationInNotion(res) {
  const data = await callClaude({
    system: `Eres un asistente que crea páginas en Notion para SOLARA Hospitality.
Usa las herramientas de Notion para crear una página bajo el parent ID: ${CONFIG.notionReservasPage}
Responde SOLO con JSON: {"notionPageId": "...", "notionUrl": "..."}`,
    userMessage: `Crea esta página en Notion:
Título: ${res.id} — ${res.guestName} — ${res.property}
Icono: 🟢
Parent: ${CONFIG.notionReservasPage}

Contenido en markdown:
## Datos de la reserva
| Campo | Valor |
|---|---|
| Huésped | ${res.guestName} |
| Email | ${res.guestEmail} |
| Teléfono | ${res.guestPhone} |
| Propiedad | ${res.property} |
| Check-in | ${res.checkin} |
| Check-out | ${res.checkout} |
| Noches | ${res.nights} |
| Huéspedes | ${res.guests} |
| Código acceso | ${res.accessCode} |
| WiFi | ${res.wifiName} / ${res.wifiPass} |
| Plataforma | ${res.platform} |
| ADR | COP ${res.adr?.toLocaleString()} |
| Total | COP ${res.total?.toLocaleString()} |
| Estado | ${res.status} |
| Notas | ${res.notes || '—'} |

## Timeline
- [ ] Mensaje bienvenida (48h antes)
- [ ] Check-in online
- [ ] Mensaje mid-stay
- [ ] Rating post-checkout
- [ ] Cierre financiero

## Servicios solicitados
*(Desde la Guest App)*

## Comunicaciones
*(Mensajes con el huésped)*`,
    mcpServers: NOTION_MCP,
  })

  // Extract page ID from tool results
  const toolResults = (data.content || []).filter(b => b.type === 'mcp_tool_result')
  for (const tr of toolResults) {
    const text = tr.content?.[0]?.text || ''
    try {
      const parsed = JSON.parse(text)
      if (parsed.id) return { notionPageId: parsed.id, notionUrl: parsed.url }
    } catch {}
    const match = text.match(/"id"\s*:\s*"([a-f0-9-]{36})"/)
    if (match) return { notionPageId: match[1], notionUrl: `https://notion.so/${match[1].replace(/-/g, '')}` }
  }

  throw new Error('No se pudo obtener el ID de la página creada')
}

// ─── Log check-in a Notion ────────────────────────────────────────────────
export async function logCheckinToNotion(notionPageId, resId) {
  await callClaude({
    system: 'Actualiza páginas de Notion para SOLARA.',
    userMessage: `En la página Notion ${notionPageId} de la reserva ${resId}, marca como completado el ítem "Check-in online" y añade la fecha ${new Date().toLocaleDateString('es-CO')}.`,
    mcpServers: NOTION_MCP,
  })
}

// ─── Log servicios a Notion ───────────────────────────────────────────────
export async function logServicesToNotion(notionPageId, resId, services) {
  const list = services.map(s => `- ${s.icon} ${s.title} (${s.price})`).join('\n')
  await callClaude({
    system: 'Actualiza páginas de Notion para SOLARA.',
    userMessage: `En la página Notion ${notionPageId} de la reserva ${resId}, añade en la sección "Servicios solicitados":\n${list}\nFecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`,
    mcpServers: NOTION_MCP,
  })
}

// ─── Concierge IA ─────────────────────────────────────────────────────────
export async function askConcierge(messages, reservation) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: `Eres el concierge virtual de SOLARA Luxury Hospitality.
Datos del huésped actual (desde Notion):
- Nombre: ${reservation.guestName}
- Propiedad: ${reservation.property}, ${reservation.zone}, Medellín
- Check-in: ${reservation.checkin} | Check-out: ${reservation.checkout} | ${reservation.nights} noches
- ADR: COP ${reservation.adr?.toLocaleString()}/noche
- WiFi: ${reservation.wifiName} / ${reservation.wifiPass}
- Código de acceso: ${reservation.accessCode}
- Plataforma: ${reservation.platform}
- Notas: ${reservation.notes}
Responde en español, cálido y sofisticado. Máximo 3-4 oraciones. Firma como "SOLARA Concierge ✦".
Para emergencias: +57 304 616 0294 · hola@solarahomes.com.co`,
      messages,
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || 'Contáctanos al +57 304 616 0294 🙏'
}
