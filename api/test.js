module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  // Test directo a Anthropic con mensaje mínimo
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey ? apiKey.trim() : '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Di solo: OK' }],
      }),
    })

    const data = await response.json()
    
    return res.status(200).json({
      keyExists: !!apiKey,
      keyLength: apiKey ? apiKey.trim().length : 0,
      keyStart: apiKey ? apiKey.trim().substring(0, 12) : 'NONE',
      anthropicStatus: response.status,
      anthropicResponse: data,
    })

  } catch (err) {
    return res.status(200).json({
      keyExists: !!apiKey,
      error: err.message
    })
  }
}
