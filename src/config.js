// ─── Configuración central SOLARA ────────────────────────────────────────

export const CONFIG = {
  anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  notionReservasPage: import.meta.env.VITE_NOTION_RESERVAS_PAGE || '336f5763-e9c3-817e-938e-c52e8c7dbac7',
  notionRootPage: import.meta.env.VITE_NOTION_ROOT_PAGE || '325f5763-e9c3-8194-8aaa-fffd760bd5b4',
}

// ─── Colores SOLARA ───────────────────────────────────────────────────────
export const C = {
  dark: '#47523e',
  mid: '#919c89',
  light: '#c8d4be',
  cream: '#f5f0e8',
  gold: '#c9a84c',
  white: '#ffffff',
  text: '#2c3027',
  muted: '#6b7566',
  green: '#4caf50',
  greenBg: '#4caf5015',
  blue: '#1976d2',
  blueBg: '#1976d215',
  orange: '#f57200',
  orangeBg: '#f5720015',
  red: '#c0392b',
  redBg: '#c0392b15',
}

// ─── Propiedades disponibles ──────────────────────────────────────────────
export const PROPERTIES = [
  'Casa d\'Artist',
  'SOLARA Manila 1',
  'ALBA Poblado',
  'Manila STR',
  'Belén los Alpes',
]

export const PLATFORMS = ['Airbnb', 'Booking.com', 'Expedia', 'Canal directo', 'Referido']

export const STATUSES = ['Confirmada', 'En curso', 'Check-out', 'Completada', 'Cancelada']

export const STATUS_META = {
  'Confirmada':  { color: '#1976d2', bg: '#1976d215', dot: '#1976d2' },
  'En curso':    { color: '#4caf50', bg: '#4caf5015', dot: '#4caf50' },
  'Check-out':   { color: '#f57200', bg: '#f5720015', dot: '#f57200' },
  'Completada':  { color: '#6b7566', bg: '#9e9e9e15', dot: '#9e9e9e' },
  'Cancelada':   { color: '#c0392b', bg: '#c0392b15', dot: '#c0392b' },
}

// ─── Reservas del sistema ─────────────────────────────────────────────────
export const DEMO_RESERVATIONS = [
  // ── RESERVA DE PRUEBA — SOLARA Manila 1 ──────────────────────────────
  {
    id: 'RES-TEST',
    notionPageId: '337f5763-e9c3-810e-921f-e895d93f90f1',
    guestName: 'Andi Gallego',
    guestEmail: 'hola@solarahomes.com.co',
    guestPhone: '+57 304 616 0294',
    property: 'SOLARA Manila 1',
    zone: 'Manila, El Poblado',
    checkin: '2026-04-05',
    checkout: '2026-04-08',
    nights: 3,
    guests: 2,
    accessCode: '1450',
    wifiName: 'SOLARA_Manila1',
    wifiPass: '(pendiente — se actualiza esta semana)',
    platform: 'Canal directo SOLARA',
    adr: 420000,
    total: 1260000,
    status: 'Confirmada',
    checkinDone: false,
    notes: '⚠️ Reserva de prueba del sistema. Propietario: SOLARA Homes S.A.S. Cocina con encimera de granito y horno Bosch. 2 balcones + patio interior verde. Mecedoras paisas en sala. Smart TV.',
    rooms: 3,
    rating: null,
    services: [],
  },
  // ── RES-001 — Casa d'Artist ───────────────────────────────────────────
  {
    id: 'RES-001',
    notionPageId: '336f5763-e9c3-81e5-8486-e49e60c30146',
    guestName: 'Carlos Méndez',
    guestEmail: 'carlos.mendez@email.com',
    guestPhone: '+57 300 000 0001',
    property: 'Casa d\'Artist',
    zone: 'Provenza, El Poblado',
    checkin: '2026-04-02',
    checkout: '2026-04-05',
    nights: 3,
    guests: 2,
    accessCode: '4729',
    wifiName: 'SOLARA_CasaArtist',
    wifiPass: 'Arte&Lujo2026',
    platform: 'Airbnb',
    adr: 550000,
    total: 1650000,
    status: 'En curso',
    checkinDone: true,
    notes: 'Huésped corporativo. Llega en vuelo desde Bogotá a las 3pm.',
    rooms: 3,
    rating: null,
    services: [],
  },
  // ── RES-002 — Casa d'Artist ───────────────────────────────────────────
  {
    id: 'RES-002',
    notionPageId: '336f5763-e9c3-8155-8a5b-d22a4d6a18d6',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.j@company.com',
    guestPhone: '+1 646 000 0002',
    property: 'Casa d\'Artist',
    zone: 'Provenza, El Poblado',
    checkin: '2026-04-10',
    checkout: '2026-04-14',
    nights: 4,
    guests: 1,
    accessCode: '8315',
    wifiName: 'SOLARA_CasaArtist',
    wifiPass: 'Arte&Lujo2026',
    platform: 'Booking.com',
    adr: 580000,
    total: 2320000,
    status: 'Confirmada',
    checkinDone: false,
    notes: 'Nómada digital, remote work. Solicitar early check-in.',
    rooms: 3,
    rating: null,
    services: [],
  },
]
