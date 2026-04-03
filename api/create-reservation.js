const NOTION_DB = '3b0b7cac-2a88-4e30-a700-75e3a39e83f7'
const NOTION_TOKEN = process.env.NOTION_TOKEN

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!NOTION_TOKEN) return res.status(500).json({ error: 'NOTION_TOKEN not configured' })

  try {
    const r = req.body
    const guestAppUrl = `https://solara-guest-app.vercel.app/guest?id=${r.id}`

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB },
        properties: {
          'ID Reserva':      { title: [{ text: { content: r.id } }] },
          'Nombre Huésped':  { rich_text: [{ text: { content: r.guestName || '' } }] },
          'Email':           { email: r.guestEmail || null },
          'Teléfono':        { phone_number: r.guestPhone || null },
          'Propiedad':       { select: { name: r.property } },
          'Zona':            { rich_text: [{ text: { content: r.zone || '' } }] },
          'Check-in':        { date: { start: r.checkin } },
          'Check-out':       { date: { start: r.checkout } },
          'Noches':          { number: r.nights },
          'Huéspedes':       { number: r.guests },
          'Código Acceso':   { rich_text: [{ text: { content: r.accessCode || '' } }] },
          'WiFi Red':        { rich_text: [{ text: { content: r.wifiName || '' } }] },
          'WiFi Clave':      { rich_text: [{ text: { content: r.wifiPass || '' } }] },
          'Plataforma':      { select: { name: r.platform } },
          'ADR COP':         { number: r.adr },
          'Total COP':       { number: r.total },
          'Estado':          { select: { name: r.status || 'Confirmada' } },
          'Check-in Completado': { checkbox: false },
          'Notas Operativas':{ rich_text: [{ text: { content: r.notes || '' } }] },
          'Enlace Guest App':{ url: guestAppUrl },
        },
      }),
    })

    const page = await notionRes.json()
    if (!notionRes.ok) return res.status(notionRes.status).json({ error: page.message })

    return res.status(200).json({
      success: true,
      notionPageId: page.id,
      notionUrl: page.url,
      guestAppUrl,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
