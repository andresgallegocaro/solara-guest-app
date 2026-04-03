// ─── api.js — todas las llamadas al servidor ───────────────────────────────

// ── Leer una reserva desde Notion ─────────────────────────────────────────
export async function fetchReservation(id) {
  const res = await fetch(`/api/reservations?id=${id}`)
  if (!res.ok) throw new Error(`Reserva ${id} no encontrada`)
  return res.json()
}

// ── Leer todas las reservas desde Notion ──────────────────────────────────
export async function fetchAllReservations() {
  const res = await fetch('/api/reservations')
  if (!res.ok) throw new Error('Error cargando reservas')
  return res.json()
}

// ── Crear reserva en Notion ────────────────────────────────────────────────
export async function createReservationInNotion(reservationData) {
  const res = await fetch('/api/create-reservation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error creando reserva')
  }
  return res.json()
}

// ── Concierge IA ───────────────────────────────────────────────────────────
export async function askConcierge(messages, reservation) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      maxTokens: 600,
      system: `Eres el concierge virtual de SOLARA Luxury Hospitality.
Datos del huésped (en tiempo real desde Notion):
- Nombre: ${reservation.guestName}
- Propiedad: ${reservation.property}, ${reservation.zone}, Medellín
- Check-in: ${reservation.checkin} a las 15:00h
- Check-out: ${reservation.checkout} a las 11:00h
- Noches: ${reservation.nights} | Huéspedes: ${reservation.guests}
- WiFi red: ${reservation.wifiName} | WiFi clave: ${reservation.wifiPass}
- Código de acceso: ${reservation.accessCode}
- Plataforma: ${reservation.platform}
- ADR: COP ${reservation.adr?.toLocaleString('es-CO')}/noche
- Notas: ${reservation.notes}
Responde SIEMPRE en español. Tono cálido y sofisticado. Máximo 3 oraciones.
Si preguntan el código di: ${reservation.accessCode}.
Si preguntan el WiFi da red y clave directamente.
Check-out a las 11:00h del ${reservation.checkout}.
Firma: "SOLARA Concierge ✦". Emergencias: +57 304 616 0294.`,
      messages,
    }),
  })
  if (!res.ok) throw new Error('Error en concierge')
  const data = await res.json()
  return data.text || 'Contáctanos al +57 304 616 0294 🙏'
}

// ── Log check-in ───────────────────────────────────────────────────────────
export async function logCheckinToNotion(notionPageId, resId) {
  console.log('Check-in completado:', resId)
}

// ── Log servicios ──────────────────────────────────────────────────────────
export async function logServicesToNotion(notionPageId, resId, services) {
  console.log('Servicios:', resId, services)
}
