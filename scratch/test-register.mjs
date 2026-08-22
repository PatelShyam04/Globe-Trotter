async function test() {
  const res = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Shyam',
      lastName: 'Patel',
      email: 'shyam.test@gmail.com',
      password: 'password123',
      phone: '9429372197',
      city: 'himatnagar',
      country: 'india',
      bio: 'best travel planner',
    }),
  })
  const json = await res.json()
  console.log('Status:', res.status, json)
}
test()
