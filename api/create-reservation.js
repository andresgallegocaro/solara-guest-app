const NOTION_DB = '33bf5763e9c380e98236f2d8751803ac'
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
    const guestAppUrl = 'https://solara-guest-app.vercel.app/guest?id=' + r.id

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + NOTION_TOKEN,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB },
        properties: {
          'Name': { title: [{ text: { content: r.id + ' | ' + r.guestName + ' | ' + r.property } }] },
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
      reservation: r,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
