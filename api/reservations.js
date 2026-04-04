const NOTION_DB = '201f8d6b-5a24-4289-8d42-4488cd32e293'
const NOTION_TOKEN = process.env.NOTION_TOKEN

function mapPage(page) {
  const p = page.properties
  const get = (key) => {
    const prop = p[key]
    if (!prop) return null
    if (prop.type === 'title') return prop.title?.[0]?.plain_text || ''
    if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || ''
    if (prop.type === 'email') return prop.email || ''
    if (prop.type === 'phone_number') return prop.phone_number || ''
    if (prop.type === 'select') return prop.select?.name || ''
    if (prop.type === 'number') return prop.number ?? null
    if (prop.type === 'checkbox') return prop.checkbox ?? false
    if (prop.type === 'url') return prop.url || ''
    if (prop.type === 'date') return prop.date?.start || ''
    return null
  }
  const checkin = get('Check-in')
  const checkout = get('Check-out')
  let nights = get('Noches')
  if (!nights && checkin && checkout) {
    nights = Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000)
  }
  return {
    id: get('ID Reserva'),
    notionPageId: page.id,
    guestName: get('Nombre Huésped'),
    guestEmail: get('Email'),
    guestPhone: get('Teléfono'),
    property: get('Propiedad'),
    zone: get('Zona'),
    checkin, checkout, nights,
    guests: get('Huéspedes'),
    accessCode: get('Código Acceso'),
    wifiName: get('WiFi Red'),
    wifiPass: get('WiFi Clave'),
    platform: get('Plataforma'),
    adr: get('ADR COP'),
    total: get('Total COP'),
    status: get('Estado'),
    checkinDone: get('Check-in Completado'),
    notes: get('Notas Operativas'),
    guestAppUrl: get('Enlace Guest App'),
    rooms: 3, services: [],
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!NOTION_TOKEN) {
    return res.status(500).json({ error: 'NOTION_TOKEN not configured' })
  }

  const { id } = req.query

  try {
    const body = id
      ? { filter: { property: 'ID Reserva', title: { equals: id } } }
      : { sorts: [{ property: 'Check-in', direction: 'descending' }] }

    const notionRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await notionRes.json()

    if (!notionRes.ok) {
      return res.status(notionRes.status).json({
        error: data.message || 'Notion API error',
        code: data.code,
      })
    }

    if (!data.results) {
      return res.status(500).json({ error: 'No results from Notion', raw: data })
    }

    if (id) {
      if (!data.results.length) return res.status(404).json({ error: `Reserva ${id} no encontrada` })
      return res.status(200).json(mapPage(data.results[0]))
    }

    return res.status(200).json(data.results.map(mapPage))

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
