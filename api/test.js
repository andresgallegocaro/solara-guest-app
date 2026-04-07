const NOTION_DB = '33bf5763e9c380e98236f2d8751803ac'

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const notionToken = process.env.NOTION_TOKEN
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  const result = {
    notionToken: { exists: !!notionToken, length: notionToken?.length || 0, start: notionToken ? notionToken.substring(0, 10) : 'MISSING' },
    anthropicKey: { exists: !!anthropicKey, start: anthropicKey ? anthropicKey.substring(0, 12) : 'MISSING' },
  }

  if (notionToken) {
    try {
      const notionRes = await fetch('https://api.notion.com/v1/databases/' + NOTION_DB + '/query', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + notionToken, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_size: 1 }),
      })
      const notionData = await notionRes.json()
      result.notionTest = { status: notionRes.status, ok: notionRes.ok, error: notionData.code || null, resultsCount: notionData.results?.length ?? null }
    } catch (err) {
      result.notionTest = { error: err.message }
    }
  }

  return res.status(200).json(result)
}
