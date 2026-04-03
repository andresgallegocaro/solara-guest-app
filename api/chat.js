module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  
  // Debug — muestra info de la key sin revelarla
  console.log('Key exists:', !!apiKey)
  console.log('Key length:', apiKey ? apiKey.length : 0)
  console.log('Key start:', apiKey ? apiKey.substring(0, 10) : 'NONE')
  console.log('Key end:', apiKey ? apiKey.substring(apiKey.length - 4) : 'NONE')

  if (!apiKey) {
    return res.status(500).json({ error: 'No API key found in environment' })
  }

  try {
    const { system, messages, maxTokens } = req.body

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens || 600,
        system: system,
        messages: messages,
      }),
    })

    const data = await response.json()
    console.log('Anthropic status:', response.status)
    console.log('Anthropic response type:', data.type)

    if (!response.ok) {
      console.log('Anthropic error:', JSON.stringify(data.error))
      return res.status(response.status).json({ 
        error: data.error?.message || 'Anthropic error',
        type: data.error?.type,
        status: response.status
      })
    }

    return res.status(200).json({ text: data.content?.[0]?.text || '' })

  } catch (err) {
    console.log('Catch error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
