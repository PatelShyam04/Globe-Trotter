import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Global regional heuristics for dynamic cost & activity generation
const REGION_HEURISTICS: Record<string, { multiplier: number; continent: string; currency: string; sampleHighlights: string[] }> = {
  asia: { multiplier: 0.7, continent: 'Asia', currency: 'USD', sampleHighlights: ['Historic Temples & Shrines Tour', 'Vibrant Street Food & Night Market Trail', 'Traditional Floating Market / River Cruise', 'Sacred Nature & Botanical Garden Walk'] },
  europe: { multiplier: 1.3, continent: 'Europe', currency: 'EUR/USD', sampleHighlights: ['Old Town Gothic & Renaissance Architecture Walk', 'National Heritage & Fine Art Museum Guided Tour', 'Scenic River Sunset Catamaran Cruise', 'Celebrated Local Wine & Tapas Tasting'] },
  americas: { multiplier: 1.4, continent: 'Americas', currency: 'USD', sampleHighlights: ['Iconic Skyline Observation Deck & City Tour', 'Cultural District & Modern Art Immersion', 'National Landmark Guided Exploration', 'Celebrated Chef Gastronomy Dinner'] },
  oceania: { multiplier: 1.4, continent: 'Oceania', currency: 'AUD/USD', sampleHighlights: ['Harbor Panoramic Cruise & Coastal Cliff Walk', 'Iconic Opera & Theater District Exploration', 'Scenic Mountain & Wildlife Day Excursion', 'Fresh Seafood & Waterfront Dining'] },
  africa: { multiplier: 0.6, continent: 'Africa', currency: 'USD', sampleHighlights: ['Ancient Citadel & Heritage Souk Walk', 'Desert / Safari Landscape Excursion', 'Traditional Cultural Music & Feast', 'Scenic Coastline & Nature Reserve Trail'] },
  middleeast: { multiplier: 1.4, continent: 'Middle East', currency: 'USD', sampleHighlights: ['Architectural Wonder & Skyline Observation', 'Desert 4x4 Dune Bashing & Stargazing Camp', 'Historic Old Town Spice & Gold Souks', 'Luxury Marina Sunset Yacht Cruise'] },
}

function detectContinent(name: string): string {
  const n = name.toLowerCase()
  if (/tokyo|kyoto|osaka|bali|bangkok|phuket|seoul|beijing|shanghai|delhi|mumbai|singapore|vietnam|hanoi|taipei|manila|ahmedabad|jaipur|goa|india|thailand|japan|korea|indonesia/.test(n)) return 'asia'
  if (/paris|rome|london|barcelona|madrid|berlin|amsterdam|prague|zurich|vienna|milan|florence|venice|santorini|athens|dublin|edinburgh|lisbon|iceland|reykjavik|budapest|munich|italy|france|spain|germany|uk|greece|switzerland/.test(n)) return 'europe'
  if (/new\s?york|nyc|los\s?angeles|la|chicago|san\s?francisco|miami|toronto|vancouver|mexico|cancun|rio|buenos\s?aires|patagonia|hawaii|orlando|las\s?vegas|usa|canada|brazil/.test(n)) return 'americas'
  if (/sydney|melbourne|auckland|queenstown|brisbane|fiji|perth|australia|new\s?zealand/.test(n)) return 'oceania'
  if (/cairo|egypt|cape\s?town|marrakech|morocco|nairobi|kenya|zanzibar|johannesburg|south\s?africa/.test(n)) return 'africa'
  if (/dubai|abu\s?dhabi|doha|qatar|riyadh|muscat|istanbul|turkey|uae|saudi/.test(n)) return 'middleeast'
  return 'europe' // default baseline
}

function extractLocation(msg: string): string | null {
  const clean = msg.replace(/[?!.,]/g, '').trim()
  const patterns = [
    /(?:plan|itinerary|trip|visit|travel|going|exploring|guide|budget|cost|days? in|for)\s+(?:a\s+)?(?:to\s+)?([a-zA-Z\s]{3,25})/i,
    /(?:about|what to do in|recommendations for|things to do in|places in)\s+([a-zA-Z\s]{3,25})/i,
    /([a-zA-Z]{3,20})\s+(?:itinerary|trip|guide|budget|travel)/i,
  ]

  for (const pat of patterns) {
    const match = clean.match(pat)
    if (match && match[1]) {
      let loc = match[1].trim()
      loc = loc.replace(/^(to|a|in|for|the)\s+/i, '').trim()
      const stopWords = ['this', 'that', 'what', 'where', 'how', 'when', 'which', 'here', 'there', 'some', 'any', 'my', 'your', 'budget', 'food', 'packing', 'friends', 'multi', 'platform', 'app', 'website', 'use', 'you']
      if (!stopWords.includes(loc.toLowerCase()) && loc.length >= 3) {
        return loc.charAt(0).toUpperCase() + loc.slice(1)
      }
    }
  }
  return null
}

function generateDynamicResponse(userMessage: string, userName?: string): { reply: string; suggestedCity?: string } {
  const msg = userMessage.toLowerCase().trim()

  // 1. "What is use of this?" / "What can you do?" / Platform Overview
  if (
    msg.includes('use of this') ||
    msg.includes('what is this') ||
    msg.includes('what can you do') ||
    msg.includes('how does this work') ||
    msg.includes('how to use') ||
    msg.includes('features') ||
    msg.includes('help')
  ) {
    const reply = `### 🌟 Welcome to GlobeTrotter & GlobeBot AI! 🌍\n\n` +
      `**GlobeTrotter** is an all-in-one travel planning platform designed to make multi-city travel seamless. Here is everything you can do:\n\n` +
      `1. **⚡ 1-Click AI Auto-Trip Generator:**\n` +
      `   * Ask me for ANY city or country (e.g. *"Plan 4 days in London"* or *"Trip to Tokyo"*), and I will generate a complete day-by-day itinerary and **save it directly to your account**!\n\n` +
      `2. **💰 Intelligent Budget Estimator:**\n` +
      `   * Ask me for budget advice for any destination. Our platform automatically charts your expenses and alerts you if you go over budget.\n\n` +
      `3. **🗺️ Modular Itinerary Builder:**\n` +
      `   * Build multi-city journeys section by section (e.g. Paris ➔ Zurich ➔ Rome) with custom activities and times.\n\n` +
      `4. **👥 Community Hub & 1-Click Trip Cloning:**\n` +
      `   * Explore shared community trips and copy full multi-city itineraries into your account in 1 click!\n\n` +
      `5. **📅 Visual Timeline & Spanning Calendar:**\n` +
      `   * See your trip schedules across a full monthly calendar grid or sequential day-wise timeline.\n\n` +
      `💬 **Try asking me:**\n` +
      `* *"Plan a 3-day itinerary for Tokyo with estimated costs"*\n` +
      `* *"How should I budget $1,200 for a trip to Italy?"*\n` +
      `* *"Compare Paris vs Rome for culture and food"*`

    return { reply }
  }

  // 2. Comparison Queries (e.g. "Paris vs Rome", "Tokyo or Kyoto")
  if (msg.includes(' vs ') || (msg.includes(' or ') && (msg.includes('better') || msg.includes('compare') || msg.includes('which')))) {
    const parts = msg.split(/ vs | or /i)
    if (parts.length >= 2) {
      const cityA = parts[0].replace(/.*(compare|between|which is better:?)/i, '').trim()
      const cityB = parts[1].replace(/(\?|for food|for culture|for budget).*/i, '').trim()
      const capA = cityA.charAt(0).toUpperCase() + cityA.slice(1)
      const capB = cityB.charAt(0).toUpperCase() + cityB.slice(1)

      const reply = `### ⚖️ Travel Comparison: ${capA} vs ${capB}\n\n` +
        `Both **${capA}** and **${capB}** are phenomenal destinations with distinct advantages:\n\n` +
        `| Feature | **${capA}** | **${capB}** |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Primary Vibe** | Iconic culture, scenic highlights & vibrant cuisine | Historic architecture, atmospheric streets & relaxation |\n` +
        `| **Estimated Budget** | ~$110 – $160 / day | ~$90 – $140 / day |\n` +
        `| **Ideal Duration** | 3 to 5 Days | 3 to 4 Days |\n` +
        `| **Best For** | City exploration, food tours & landmarks | Immersive history, walking tours & nightlife |\n\n` +
        `**💡 GlobeBot Recommendation:**\n` +
        `If you have 6–7 days, you can add **both ${capA} and ${capB}** as consecutive stops in our **Itinerary Builder**!\n\n` +
        `Which destination would you like to auto-generate first?`

      return { reply, suggestedCity: capA }
    }
  }

  // 3. Dynamic Location Search / Itinerary Generation for ANY city or country
  const detectedLocation = extractLocation(userMessage)

  if (detectedLocation) {
    const regionKey = detectContinent(detectedLocation)
    const regionData = REGION_HEURISTICS[regionKey]
    const baseDailyCost = Math.round(90 * regionData.multiplier)

    const reply = `### 🌍 Custom Travel Itinerary & Budget: ${detectedLocation}\n\n` +
      `Here is an intelligent travel plan and budget estimate for **${detectedLocation}** (${regionData.continent}):\n\n` +
      `**💰 Estimated Daily Budget:** ~$${baseDailyCost} – $${Math.round(baseDailyCost * 1.5)} / day\n` +
      `* **3-Day Estimated Total:** **$${baseDailyCost * 3}** (Accommodations + Dining + Transport + Activities)\n\n` +
      `**📅 Curated Day-by-Day Activity Highlights:**\n` +
      `* **🏛️ Day 1: City Orientation & Culinary Walk**\n` +
      `  * Morning: Historic center walking tour & architectural landmarks ($0)\n` +
      `  * Afternoon: Authentic local food tasting & traditional market ($35)\n` +
      `  * Evening: Sunset panoramic viewpoint / riverfront experience ($20)\n\n` +
      `* **🎨 Day 2: Cultural Immersion & Iconic Landmarks**\n` +
      `  * Morning: ${regionData.sampleHighlights[0]} ($45)\n` +
      `  * Afternoon: ${regionData.sampleHighlights[1]} ($25)\n` +
      `  * Evening: ${regionData.sampleHighlights[2]} ($50)\n\n` +
      `* **🌲 Day 3: Scenic Excursion & Farewell Experience**\n` +
      `  * Full Day: ${regionData.sampleHighlights[3]} ($65)\n` +
      `  * Night: Celebrated local gastronomy dinner & evening nightlife ($60)\n\n` +
      `**💡 Pro-Traveler Tip for ${detectedLocation}:**\n` +
      `Book popular attraction tickets online to skip queues, and use local transit passes for cost savings.\n\n` +
      `Click **"⚡ Auto-Generate 3-Day ${detectedLocation} Trip"** below to automatically create this plan in your account!`

    return { reply, suggestedCity: detectedLocation }
  }

  // 4. Budget & Finance Inquiries
  if (msg.includes('budget') || msg.includes('cost') || msg.includes('how much') || msg.includes('cheap') || msg.includes('money') || msg.includes('expensive')) {
    const reply = `### 💰 Global Travel Budget Estimator & Tiers\n\n` +
      `Here is a realistic breakdown for budget planning across popular travel tiers worldwide:\n\n` +
      `* **🎒 Backpacker / Budget Tier:** $40 – $75 / day\n` +
      `  * Stay: Hostels & budget guesthouses\n` +
      `  * Meals: Local street food & casual eateries\n` +
      `  * Transport: Metro, buses, and walking tours\n\n` +
      `* **🧳 Comfort / Mid-Range Tier:** $100 – $190 / day\n` +
      `  * Stay: Boutique 3★ & 4★ hotels or cozy Airbnbs\n` +
      `  * Meals: Sit-down dining with regional wine & specialties\n` +
      `  * Transport: Taxis, express trains, and guided tours\n\n` +
      `* **💎 Luxury Tier:** $280+ / day\n` +
      `  * Stay: 5★ luxury resorts & heritage suites\n` +
      `  * Meals: Michelin-starred gastronomy & private chefs\n` +
      `  * Transport: Private airport chauffeurs & chartered experiences\n\n` +
      `**💡 GlobeTrotter Feature Highlight:**\n` +
      `When you build an itinerary on GlobeTrotter, our **Budget Breakdown Chart** tracks your costs per category and alerts you if any single day exceeds your budget!`

    return { reply }
  }

  // 5. Packing & Transit Inquiries
  if (msg.includes('pack') || msg.includes('transit') || msg.includes('flight') || msg.includes('tips') || msg.includes('checklist')) {
    const reply = `### 🎒 Essential Multi-City Travel Checklist\n\n` +
      `Follow these expert rules to keep your journeys organized and stress-free:\n\n` +
      `* **📱 Connectivity:** Install a regional eSIM (e.g. Airalo/Holafly) before departure so you have instant mobile data when you land.\n` +
      `* **💳 Smart Payments:** Use a travel card with 0% foreign transaction fees, plus keep $50 equivalent in local cash for small market vendors.\n` +
      `* **🧳 Carry-On Rule:** Pack maximum 5 days of lightweight, quick-dry clothing and do laundry on longer trips.\n` +
      `* **📄 Offline Backup:** Save digital PDF copies of your flight tickets, hotel reservations, and passport in your phone notes.\n\n` +
      `Tell me where you are traveling, and I can give you customized seasonal advice!`

    return { reply }
  }

  // 6. Natural Language Default
  const reply = `Hello ${userName || 'fellow traveler'}! 👋 I am **GlobeBot**, your AI Travel Planner.\n\n` +
    `I can build customized itineraries, calculate budgets, and plan trips for **ANY city or country in the world**.\n\n` +
    `💬 **Try asking me:**\n` +
    `* 🗼 *"Plan a 3-day trip to Tokyo with budget and activities"*\n` +
    `* 🏛️ *"What are the best attractions in Rome or Athens?"*\n` +
    `* 🌴 *"Suggest an adventure itinerary for Bali or Costa Rica"*\n` +
    `* 💰 *"How should I budget $1,500 for a week in Europe?"*\n` +
    `* ⚖️ *"Compare Paris vs Rome for food and culture"*\n\n` +
    `Where would you like to travel next?`

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
    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `You are GlobeBot, the expert travel planning AI inside the GlobeTrotter platform. Answer this user prompt clearly with markdown formatting, estimated daily budgets in USD, and structured activity recommendations. User: ${lastMessage}` }],
              },
            ],
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            const loc = extractLocation(lastMessage)
            return NextResponse.json({ reply: text, suggestedCity: loc || undefined })
          }
        }
      } catch (err) {
        console.warn('Gemini API fallback to local intelligence engine:', err)
      }
    }

    // High-quality dynamic intelligence engine
    const { reply, suggestedCity } = generateDynamicResponse(lastMessage, session?.user?.name || undefined)

    return NextResponse.json({ reply, suggestedCity })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Failed to process AI chat' }, { status: 500 })
  }
}
