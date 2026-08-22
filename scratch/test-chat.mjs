async function testQuery(prompt) {
  console.log(`\n========================================`)
  console.log(`Testing Query: "${prompt}"`)
  const res = await fetch('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Suggested City:', data.suggestedCity)
  console.log('Response Snippet:\n' + data.reply?.slice(0, 300) + '...\n')
}

async function runAll() {
  await testQuery('what is use of this')
  await testQuery('compare Paris vs Rome')
  await testQuery('plan 3 days in Ahmedabad')
  await testQuery('trip to Santorini')
  await testQuery('how should I budget $1000 for Thailand')
}

runAll()
