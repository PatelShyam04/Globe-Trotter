async function testCity(destination) {
  console.log(`\n========================================`)
  console.log(`Testing Auto-Trip Generation for: "${destination}"`)
  const res = await fetch('http://localhost:3000/api/ai/generate-trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination,
      days: 3,
      style: 'cultural',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Trip Name:', data.tripName)
  console.log('Budget:', data.suggestedBudget)
  console.log('Activities Generated:')
  data.activities?.forEach((a, i) => {
    console.log(`  ${i + 1}. [Day ${a.dayNumber}] ${a.name} (${a.category}, $${a.cost}, ${a.scheduledTime})`)
  })
}

async function run() {
  await testCity('Jaipur')
  await testCity('Bali')
  await testCity('Paris')
  await testCity('Cairo')
}
run()
