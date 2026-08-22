async function test() {
  const res = await fetch('http://localhost:3000/api/ai/generate-trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination: 'Sydney',
      days: 3,
      style: 'adventure',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Generated Trip Name:', data.tripName)
  console.log('Suggested Budget:', data.suggestedBudget)
  console.log('Daily Avg Cost:', data.dailyAvgCost)
  console.log('Activities Count:', data.activities?.length)
}
test()
