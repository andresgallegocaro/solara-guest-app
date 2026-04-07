const NOTION_DB = '33bf5763e9c380e98236f2d8751803ac'
const NOTION_TOKEN = process.env.NOTION_TOKEN

// Reservas de fallback mientras la DB real no tiene todos los campos
const FALLBACK = [
  {
    id: 'RES-TEST', notionPageId: '33bf5763e9c38115b0acf4d643df7635',
    guestName: 'Andi Gallego', guestEmail: 'hola@solarahomes.com.co',
    guestPhone: '+57 304 616 0294', property: 'SOLARA Manila 1',
    zone: 'Manila, El Poblado', checkin: '2026-04-05', checkout: '2026-04-08',
    nights: 3, guests: 2, accessCode: '1450', wifiName: 'SOLARA_Manila1',
    wifiPass: '(pendiente)', platform: 'Canal directo',
    adr: 420000, total: 1260000, status: 'Confirmada', checkinDone: false,
    notes: 'Reserva de prueba. Cocina granito Bosch. 2 balcones. Smart TV.', rooms: 3, services: [],
  },
  {
    id: 'RES-001', notionPageId: '33bf5763e9c38157b2b0daf4f4bb84f3',
    guestName: 'Carlos Méndez', guestEmail: 'carlos.mendez@email.com',
    guestPhone: '+57 300 000 0001', property: "Casa d'Artist",
    zone: 'Provenza, El Poblado', checkin: '2026-04-02', checkout: '2026-04-05',
    nights: 3, guests: 2, accessCode: '4729', wifiName: 'SOLARA_CasaArtist',
    wifiPass: 'Arte&Lujo2026', platform: 'Airbnb',
    adr: 550000, total: 1650000, status: 'En curso', checkinDone: true,
    notes: 'Huésped corporativo. Llega en vuelo desde Bogotá.', rooms: 3, services: [],
  },
  {
    id: 'RES-002', notionPageId: '33bf5763e9c38156aecdeb01b15a0112',
    guestName: 'Sarah Johnson', guestEmail: 'sarah.j@company.com',
    guestPhone: '+1 646 000 0002', property: "Casa d'Artist",
    zone: 'Provenza, El Poblado', checkin: '2026-04-10', checkout: '2026-04-14',
    nights: 4, guests: 1, accessCode: '8315', wifiName: 'SOLARA_CasaArtist',
    wifiPass: 'Arte&Lujo2026', platform: 'Booking.com',
    adr: 580000, total: 2320000, status: 'Confirmada', checkinDone: false,
    notes: 'Nómada digital. Solicitar early check-in.', rooms: 3, services: [],
  },
]

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query

  if (id) {
    const found = FALLBACK.find(r => r.id === id)
    if (found) return res.status(200).json(found)
    return res.status(404).json({ error: 'Reserva no encontrada' })
  }

  return res.status(200).json(FALLBACK)
}
