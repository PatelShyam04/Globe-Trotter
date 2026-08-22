async function test() {
  const res = await fetch('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Plan a 3-day budget itinerary for Tokyo with costs' }],
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Reply preview:', data.reply?.slice(0, 150))
  console.log('Suggested city:', data.suggestedCity)
}
test()
