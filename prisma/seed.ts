import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const cities = [
  { name: 'Paris', country: 'France', region: 'Europe', costIndex: 3.2, popularity: 98, description: 'The City of Light' },
  { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 2.8, popularity: 96, description: 'Where tradition meets future' },
  { name: 'New York', country: 'USA', region: 'Americas', costIndex: 4.5, popularity: 95, description: 'The city that never sleeps' },
  { name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 2.6, popularity: 93, description: 'The Eternal City' },
  { name: 'Barcelona', country: 'Spain', region: 'Europe', costIndex: 2.4, popularity: 91, description: 'Gaudí and beaches' },
  { name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 1.2, popularity: 90, description: 'Island of the Gods' },
  { name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 1.1, popularity: 89, description: 'Street food paradise' },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', costIndex: 3.0, popularity: 88, description: 'Canals and culture' },
  { name: 'Dubai', country: 'UAE', region: 'Middle East', costIndex: 3.8, popularity: 87, description: 'City of superlatives' },
  { name: 'Sydney', country: 'Australia', region: 'Oceania', costIndex: 3.5, popularity: 86, description: 'Opera House and harbour' },
  { name: 'Prague', country: 'Czech Republic', region: 'Europe', costIndex: 1.8, popularity: 85, description: 'Fairytale architecture' },
  { name: 'Lisbon', country: 'Portugal', region: 'Europe', costIndex: 2.0, popularity: 84, description: 'City of seven hills' },
  { name: 'Singapore', country: 'Singapore', region: 'Asia', costIndex: 3.4, popularity: 83, description: 'Garden City' },
  { name: 'Istanbul', country: 'Turkey', region: 'Middle East', costIndex: 1.6, popularity: 82, description: 'Between two continents' },
  { name: 'Marrakech', country: 'Morocco', region: 'Africa', costIndex: 1.0, popularity: 81, description: 'Red city of souks' },
  { name: 'Buenos Aires', country: 'Argentina', region: 'Americas', costIndex: 1.4, popularity: 80, description: 'Paris of South America' },
  { name: 'Seoul', country: 'South Korea', region: 'Asia', costIndex: 2.2, popularity: 79, description: 'K-pop and kimchi' },
  { name: 'Vienna', country: 'Austria', region: 'Europe', costIndex: 2.9, popularity: 78, description: 'City of music' },
  { name: 'Cape Town', country: 'South Africa', region: 'Africa', costIndex: 1.5, popularity: 77, description: 'Mother City' },
  { name: 'Kyoto', country: 'Japan', region: 'Asia', costIndex: 2.5, popularity: 76, description: 'Ancient Japanese capital' },
  { name: 'Santorini', country: 'Greece', region: 'Europe', costIndex: 2.8, popularity: 75, description: 'White and blue paradise' },
  { name: 'Mexico City', country: 'Mexico', region: 'Americas', costIndex: 1.3, popularity: 74, description: 'Aztec heritage and art' },
  { name: 'Hanoi', country: 'Vietnam', region: 'Asia', costIndex: 0.9, popularity: 73, description: 'Ancient capital of Vietnam' },
  { name: 'Cairo', country: 'Egypt', region: 'Africa', costIndex: 0.8, popularity: 72, description: 'Gateway to the pyramids' },
  { name: 'Vancouver', country: 'Canada', region: 'Americas', costIndex: 3.3, popularity: 71, description: 'Mountains meet ocean' },
  { name: 'Zurich', country: 'Switzerland', region: 'Europe', costIndex: 5.0, popularity: 70, description: 'Swiss precision and beauty' },
  { name: 'Siem Reap', country: 'Cambodia', region: 'Asia', costIndex: 0.7, popularity: 69, description: 'Gateway to Angkor Wat' },
  { name: 'Auckland', country: 'New Zealand', region: 'Oceania', costIndex: 3.2, popularity: 68, description: 'City of sails' },
  { name: 'Lima', country: 'Peru', region: 'Americas', costIndex: 1.2, popularity: 67, description: 'Gastronomic capital of Americas' },
  { name: 'Berlin', country: 'Germany', region: 'Europe', costIndex: 2.3, popularity: 66, description: 'History and nightlife' },
]

async function main() {
  console.log('🌍 Seeding cities...')
  await prisma.city.deleteMany()

  for (const city of cities) {
    await prisma.city.create({ data: city })
  }

  console.log(`✅ Seeded ${cities.length} cities!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
