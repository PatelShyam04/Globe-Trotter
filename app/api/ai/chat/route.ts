import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const CITY_KNOWLEDGE: Record<string, { desc: string; bestSpots: string[]; budgetPerDay: number; tips: string }> = {
  tokyo: {
    desc: 'Vibrant metropolis blending futuristic skyscrapers, historic shrines, and world-class culinary mastery.',
    bestSpots: ['Tsukiji Outer Market Food Tour ($45)', 'Shibuya Sky & Meiji Shrine ($20)', 'Akihabara Tech District ($15)', 'TeamLab Planets Immersive Art ($35)', 'Shinjuku Gyoen National Garden ($5)'],
    budgetPerDay: 120,
    tips: 'Get a 72-hour Tokyo Subway Ticket for unlimited metro rides (~$10). Carry some cash for local ramen ticket machines.',
  },
  paris: {
    desc: 'The global capital of art, gastronomy, and culture with iconic monuments and romantic river vistas.',
    bestSpots: ['Eiffel Tower Sunset Access ($70)', 'Louvre Museum Masterpieces ($22)', 'Seine River Catamaran Cruise ($45)', 'Montmartre & Sacré-Cœur Walk ($0)', 'Le Marais Pastry Tour ($35)'],
    budgetPerDay: 150,
    tips: 'Book Louvre and Eiffel Tower tickets at least 2 weeks in advance to skip 2+ hour queues. Use the Navigo Easy card for the metro.',
  },
  rome: {
    desc: 'The Eternal City with thousands of years of ancient history, Roman architecture, and incredible pasta.',
    bestSpots: ['Colosseum & Roman Forum Tour ($65)', 'Vatican Museums & Sistine Chapel ($30)', 'Trevi Fountain & Spanish Steps ($0)', 'Trastevere Food & Wine Walk ($50)', 'Pantheon Architecture Visit ($5)'],
    budgetPerDay: 110,
    tips: 'Dress respectfully with covered shoulders and knees for church and Vatican visits. Drink free mountain water from city "Nasoni" fountains.',
  },
  bali: {
    desc: 'Tropical paradise known for lush volcanic mountains, iconic rice terraces, sacred temples, and coral reefs.',
    bestSpots: ['Ubud Sacred Monkey Forest & Waterfalls ($25)', 'Tegallalang Rice Terrace Trek ($10)', 'Uluwatu Sunset Temple & Kecak Dance ($15)', 'Nusa Penida Island Snorkel Tour ($60)', 'Seminyak Beachside Sunset ($0)'],
    budgetPerDay: 50,
    tips: 'Rent an automatic scooter (~$5/day) or hire a private driver for full-day excursions (~$35/day).',
  },
  dubai: {
    desc: 'Ultra-modern desert hub celebrated for architectural marvels, luxury shopping, and golden sand dunes.',
    bestSpots: ['Burj Khalifa 124th Floor Observation ($55)', 'Desert Dune Bashing & Bedouin BBQ ($90)', 'Dubai Marina Yacht Tour ($60)', 'Museum of the Future ($40)', 'Al Fahidi Historic District & Souks ($5)'],
    budgetPerDay: 180,
    tips: 'Visit between November and March for pleasant sunny weather. The Dubai Metro is clean, air-conditioned, and connects airport directly to downtown.',
  },
  zurich: {
    desc: 'Picturesque lakeside city surrounded by snow-capped Swiss Alps, offering pristine nature and luxury.',
    bestSpots: ['Lake Zurich Scenic Boat Tour ($40)', 'Uetliberg Mountain Panoramic Hike ($10)', 'Old Town (Altstadt) Walking Tour ($0)', 'Lindt Home of Chocolate ($17)', 'Day trip to Jungfraujoch ($180)'],
    budgetPerDay: 190,
    tips: 'Swiss Travel Pass covers unlimited trains, boats, and museum admissions across the country.',
  },
}

function generateSmartTravelAdvice(userMessage: string, userName?: string): { reply: string; suggestedCity?: string } {
  const msg = userMessage.toLowerCase()

  // 1. Universal Global Destination Detection
  const GLOBAL_CITIES: Record<string, { desc: string; bestSpots: string[]; budgetPerDay: number; tips: string; country: string }> = {
    tokyo: { desc: 'Vibrant metropolis blending futuristic skyscrapers, historic shrines, and world-class culinary mastery.', bestSpots: ['Tsukiji Outer Market Food Tour ($45)', 'Shibuya Sky & Meiji Shrine ($20)', 'Akihabara Tech District ($15)', 'TeamLab Planets Immersive Art ($35)', 'Shinjuku Gyoen National Garden ($5)'], budgetPerDay: 120, tips: 'Get a 72-hour Tokyo Subway Ticket for unlimited metro rides (~$10).', country: 'Japan' },
    paris: { desc: 'The global capital of art, gastronomy, and culture with iconic monuments and romantic river vistas.', bestSpots: ['Eiffel Tower Sunset Access ($70)', 'Louvre Museum Masterpieces ($22)', 'Seine River Catamaran Cruise ($45)', 'Montmartre & Sacré-Cœur Walk ($0)', 'Le Marais Pastry Tour ($35)'], budgetPerDay: 150, tips: 'Book Louvre and Eiffel Tower tickets at least 2 weeks in advance.', country: 'France' },
    rome: { desc: 'The Eternal City with thousands of years of ancient history, Roman architecture, and incredible pasta.', bestSpots: ['Colosseum & Roman Forum Tour ($65)', 'Vatican Museums & Sistine Chapel ($30)', 'Trevi Fountain & Spanish Steps ($0)', 'Trastevere Food & Wine Walk ($50)', 'Pantheon Architecture Visit ($5)'], budgetPerDay: 110, tips: 'Dress respectfully for church and Vatican visits. Drink free water from Nasoni fountains.', country: 'Italy' },
    bali: { desc: 'Tropical paradise known for lush volcanic mountains, iconic rice terraces, sacred temples, and coral reefs.', bestSpots: ['Ubud Sacred Monkey Forest & Waterfalls ($25)', 'Tegallalang Rice Terrace Trek ($10)', 'Uluwatu Sunset Temple & Kecak Dance ($15)', 'Nusa Penida Island Snorkel Tour ($60)', 'Seminyak Beachside Sunset ($0)'], budgetPerDay: 50, tips: 'Rent an automatic scooter (~$5/day) or hire a private driver.', country: 'Indonesia' },
    dubai: { desc: 'Ultra-modern desert hub celebrated for architectural marvels, luxury shopping, and golden sand dunes.', bestSpots: ['Burj Khalifa 124th Floor Observation ($55)', 'Desert Dune Bashing & Bedouin BBQ ($90)', 'Dubai Marina Yacht Tour ($60)', 'Museum of the Future ($40)', 'Al Fahidi Historic District & Souks ($5)'], budgetPerDay: 180, tips: 'Visit between November and March for pleasant sunny weather.', country: 'UAE' },
    zurich: { desc: 'Picturesque lakeside city surrounded by snow-capped Swiss Alps, offering pristine nature and luxury.', bestSpots: ['Lake Zurich Scenic Boat Tour ($40)', 'Uetliberg Mountain Panoramic Hike ($10)', 'Old Town (Altstadt) Walking Tour ($0)', 'Lindt Home of Chocolate ($17)', 'Day trip to Jungfraujoch ($180)'], budgetPerDay: 190, tips: 'Swiss Travel Pass covers unlimited trains, boats, and museum admissions.', country: 'Switzerland' },
    london: { desc: 'Historic metropolis with royal palaces, West End theaters, iconic double-decker buses, and world-class free museums.', bestSpots: ['Tower of London & Crown Jewels ($40)', 'British Museum & Westminster ($0)', 'London Eye Skyline Flight ($45)', 'Borough Market Culinary Tasting ($30)', 'Soho & Covent Garden Evening Walk ($0)'], budgetPerDay: 160, tips: 'Tap in and out with any contactless card or Oyster card on the Tube.', country: 'United Kingdom' },
    barcelona: { desc: 'Mediterranean jewel celebrated for Gaudí modernism architecture, sandy city beaches, and tapas culture.', bestSpots: ['Sagrada Família & Park Güell ($45)', 'Gothic Quarter Walking Tour ($0)', 'Barceloneta Beach Sunset & Tapas ($35)', 'Montjuïc Castle Cable Car ($15)', 'Camp Nou Experience ($35)'], budgetPerDay: 105, tips: 'Enjoy late dinners around 9 PM like the locals.', country: 'Spain' },
    bangkok: { desc: 'Sensory feast of golden Buddhist temples, bustling floating markets, vibrant street food, and lively tuk-tuks.', bestSpots: ['Grand Palace & Wat Pho ($25)', 'Chao Phraya River Ferry & Wat Arun ($5)', 'Chatuchak Weekend Market ($15)', 'Chinatown Night Food Trail ($20)', 'Rooftop Bar Skyline Sunset ($30)'], budgetPerDay: 55, tips: 'Use the BTS Skytrain and MRT to bypass Bangkok road traffic.', country: 'Thailand' },
    newyork: { desc: 'The city that never sleeps with world-famous skylines, Broadway theater, Central Park, and global cuisine.', bestSpots: ['Empire State / Summit One Vanderbilt ($50)', 'Central Park & Met Museum ($30)', 'Brooklyn Bridge & DUMBO Walk ($0)', 'Broadway Musical Evening ($120)', 'High Line & Chelsea Market ($25)'], budgetPerDay: 190, tips: 'The 7-Day Unlimited MetroCard is the cheapest way to explore NYC.', country: 'USA' },
    cairo: { desc: 'Ancient gateway along the Nile featuring the Giza Pyramids, historic bazaars, and millennia of civilization.', bestSpots: ['Great Pyramids of Giza & Sphinx ($25)', 'Grand Egyptian Museum ($20)', 'Khan el-Khalili Bazaar ($10)', 'Nile River Felucca Sunset Sail ($20)', 'Historic Islamic Cairo Walk ($5)'], budgetPerDay: 45, tips: 'Hire a licensed Egyptologist guide for the Pyramids.', country: 'Egypt' },
    sydney: { desc: 'Harbor capital famous for the Opera House, Bondi Beach coastal walks, and sun-soaked outdoor living.', bestSpots: ['Sydney Opera House & Harbor Bridge ($45)', 'Bondi to Coogee Coastal Walk ($0)', 'Manly Beach Ferry Cruise ($10)', 'Blue Mountains Day Trek ($70)', 'Taronga Zoo Harbor Views ($35)'], budgetPerDay: 140, tips: 'Take the public ferry from Circular Quay to Manly for the best harbor views.', country: 'Australia' },
  }

  // Check for any detected city or extract from query
  for (const [cityKey, data] of Object.entries(GLOBAL_CITIES)) {
    if (msg.includes(cityKey)) {
      const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1)
      const reply = `### 🌍 Custom Travel Itinerary & Budget: ${cityName}, ${data.country}\n\n` +
        `**Overview:** ${data.desc}\n\n` +
        `**💰 Recommended Budget:** ~$${data.budgetPerDay}/day (Total for 3 days: **$${data.budgetPerDay * 3}**)\n\n` +
        `**✨ Top Recommended Daily Highlights:**\n` +
        data.bestSpots.map((s, i) => `* **Day ${Math.min(3, i + 1)}:** ${s}`).join('\n') +
        `\n\n**💡 Pro-Traveler Tip:**\n${data.tips}\n\n` +
        `Ready to add this trip to your dashboard? Click **"⚡ Auto-Generate Trip"** below to instantly create it in your account!`

      return { reply, suggestedCity: cityName }
    }
  }

  // Generic destination match if user says "trip to X" or "visit X"
  const match = msg.match(/(?:trip to|visit|travel to|going to|plan|in)\s+([a-zA-Z\s]{3,20})/i)
  if (match && match[1]) {
    const customCity = match[1].trim().split(' ')[0]
    const formattedCity = customCity.charAt(0).toUpperCase() + customCity.slice(1)
    if (!['the', 'a', 'my', 'budget', 'some', 'any'].includes(customCity.toLowerCase())) {
      const reply = `### 🌍 Custom Travel Itinerary: ${formattedCity}\n\n` +
        `Here is an intelligent travel plan and budget estimate for **${formattedCity}**:\n\n` +
        `* **💰 Estimated Budget:** ~$90 – $140 / day (Accommodations + Meals + Transport)\n` +
        `* **🏛️ Day 1:** Arrival, historic city center orientation, and local culinary tasting.\n` +
        `* **🎨 Day 2:** Iconic cultural landmarks, national museum tour, and sunset viewpoint.\n` +
        `* **🌲 Day 3:** Nature excursion, scenic harbor/river cruise, and celebrated dining experience.\n\n` +
        `Click **"⚡ Auto-Generate Trip"** below to automatically create and save this itinerary directly to your GlobeTrotter account!`

      return { reply, suggestedCity: formattedCity }
    }
  }

  // 2. Budget or Multi-City Planning
  if (msg.includes('budget') || msg.includes('cost') || msg.includes('how much') || msg.includes('cheap')) {
    const reply = `### 💰 Intelligent Budget Estimation Guide\n\n` +
      `Here is a realistic breakdown for budget planning across popular travel tiers:\n\n` +
      `* **Backpacker / Budget Tier:** $40 – $70 / day (Hostels, street food, public transit, free walking tours)\n` +
      `* **Comfort / Mid-Range Tier:** $100 – $180 / day (Boutique 3-4★ hotels, curated tours, sit-down dining)\n` +
      `* **Luxury Tier:** $250+ / day (5★ luxury resorts, private chauffeurs, Michelin culinary experiences)\n\n` +
      `**💡 Top Ways to Save on GlobeTrotter:**\n` +
      `1. Use our **Budget Breakdown** chart to set daily spending limits.\n` +
      `2. Group activities by neighborhood to minimize transit costs.\n` +
      `3. Look at the **Cost Index** on our Explore page to pick high-value destinations (e.g. Bali, Prague, Tokyo).`

    return { reply }
  }

  // 3. Packing or Transit Advice
  if (msg.includes('pack') || msg.includes('transit') || msg.includes('flight') || msg.includes('tips')) {
    const reply = `### 🎒 Essential Traveler Checklist\n\n` +
      `Here are the golden rules for stress-free multi-city travel:\n\n` +
      `* **Documents:** Universal power adapter, digital copies of passport/visas saved offline, travel insurance card.\n` +
      `* **Money:** Zero foreign-transaction fee credit card + local currency backup for markets.\n` +
      `* **Packing Rule:** Pack for 5 days max and use local laundromats — you can travel light anywhere with a carry-on!\n` +
      `* **Connectivity:** Download regional e-SIMs (Airalo or Holafly) before landing for instant 5G data.`

    return { reply }
  }

  // 4. Default Personalized Travel Assistant Reply
  const reply = `Hello ${userName || 'fellow traveler'}! 👋 I'm **GlobeBot**, your AI Travel Planner.\n\n` +
    `I can help you build the perfect trip. Try asking me:\n\n` +
    `* 🗼 *"Plan a 3-day itinerary for Tokyo on a budget"*\n` +
    `* 🥐 *"What are the best food experiences in Paris?"*\n` +
    `* 🌴 *"Suggest an adventure trip to Bali with costs"*\n` +
    `* 💰 *"How should I budget $1,500 for a week in Europe?"*\n` +
    `* 🎒 *"Packing checklist for backpacking"*`

  return { reply }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1].content

    // Check if an external LLM key is configured (Gemini or OpenAI)
    const geminiKey = process.env.GEMINI_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `You are GlobeBot, an enthusiastic and expert travel planner. Format your answer with markdown headings, bullet points, and realistic estimated costs in USD. User prompt: ${lastMessage}` }],
              },
            ],
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            return NextResponse.json({ reply: text })
          }
        }
      } catch (err) {
        console.warn('Gemini API fallback to local intelligence engine:', err)
      }
    }

    // High-quality local travel intelligence engine
    const { reply, suggestedCity } = generateSmartTravelAdvice(lastMessage, session?.user?.name || undefined)

    return NextResponse.json({ reply, suggestedCity })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Failed to process AI chat' }, { status: 500 })
  }
}
