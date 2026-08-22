# 🌍 GlobeTrotter — Personalized Travel Planning Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6--Flash-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **GlobeTrotter** is a personalized, intelligent, and collaborative multi-city travel planning web application built for **Hackathon 2026**. Featuring **AI Auto-Trip Generation** powered by **Google Gemini**, dynamic **City vs. Country** location intelligence, real-time itinerary builders, cost analytics, interactive calendars, and public sharing.

---

## 🌟 Key Features

### 1. ✨ AI Magic Auto-Trip Generator
- **Universal Destination Planning**: Enter **ANY** city or sovereign country worldwide.
- **Dynamic Landmark Engine**: Powered by **Google Gemini `gemini-3.6-flash`**, it provides authentic landmarks, monuments, famous local restaurants/dishes, realistic ticket pricing, and daily schedules.
- **1-Click Database Creation**: Automatically generates the trip, stops, and activities in PostgreSQL with zero manual date-entry required.

### 2. 🏙️ vs 🏳️ Smart City vs. Country Intelligence
- **Country Multi-City Tours**: When searching a country (e.g. *India, Japan, Italy, France, USA, Switzerland*), GlobeTrotter automatically divides the duration into a realistic multi-city itinerary (e.g. *Delhi + Jaipur + Mumbai* or *Tokyo + Kyoto + Osaka*).
- **City Deep Dives**: When searching a city (e.g. *Jaipur, Bali, Paris, Cairo*), it resolves the exact sovereign nation and flag (`Jaipur` → `India 🇮🇳`).
- **Country Explorer**: Filter 40+ dynamic curated activities by Country, Region, or Category.

### 3. ✏️ Modular Itinerary Builder
- **Edit Trip Details & Dates**: Modify trip name, start/end dates, total budget ($ USD), and overview notes.
- **Edit Section / City Stops**: Update stop city name, country, and arrival/departure dates.
- **Edit Activities**: Full modal to edit activity title, category tag, cost ($), scheduled time, day number, and description.
- **Reordering & Custom Sections**: Add custom stops, reorder sections with arrows, and manage activities on the fly.

### 4. 🧭 Dual-Column Itinerary View
- **Left Column (Physical Activity Flow)**: Sequential day-by-day activity cards with animated flow arrows (`↓ Next Stop`), category badges, and time slots.
- **Right Column (Expense Breakdown)**: Matching expense cards with live daily totals and currency formatting.

### 5. 📊 Trip Budget & Cost Analytics
- Interactive **Chart.js** Category Breakdown (Pie/Doughnut Chart) and City Spend Distribution (Bar Chart).
- Daily average spend metrics, category budget progress bars, and overbudget warnings.

### 6. 📅 Interactive Calendar & Day Timeline
- Full **Monthly Grid Calendar** (`/calendar`) showing multi-day spanning trip bars.
- Day-by-day expandable timeline (`/trips/[id]/timeline`).

### 7. 👥 Community & Public Trip Sharing
- **Public Itinerary URL** (`/itinerary/[id]`) for friends, family, and social sharing.
- **1-Click "📋 Copy Trip to My Account"**: Clones entire multi-city itineraries and activities into the logged-in user's library.
- 𝕏 Tweet integration & direct link copying.

### 8. 👤 User Profile & Customization
- **Direct File Upload**: Upload custom profile avatars directly from device (`JPG`, `PNG`, `WEBP`) or pick from 6 traveler avatars.
- **Editable User Info**: Update First Name, Last Name, Phone, City, Country, and Bio with live session sync.
- **Preplanned & Previous Trips Showcase**: Visual trip cards with destination cover photos and **"📸 Change Photo"** modal.

### 9. 🛡️ Admin & Analytics Dashboard (`/admin`)
- Protected admin console with 4 dedicated tabs:
  1. **User Trends and Analytics**: Growth KPIs, User Activity Line Chart, Role Distribution Donut Chart, Trip Length Bar Chart.
  2. **Manage Users**: Paginated user table, search filter, view user trips modal, toggle admin/user roles, and delete user.
  3. **Popular Destinations**: Top-ranked cities by user bookings and popularity index.
  4. **Popular Activities**: Highest-rated experiences worldwide.

### 10. 🤖 GlobeBot AI Travel Assistant
- Floating universal AI chatbot with quick prompt suggestions, budget estimates, comparison tools, and instant itinerary generation links.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma 7](https://www.prisma.io/) (`@prisma/client`, `@prisma/adapter-pg`, `pg`) |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) (JWT strategy with bcryptjs) |
| **AI / LLM** | [Google Gemini 3.6 Flash](https://ai.google.dev/) via Google Generative AI REST API |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with custom Dark Mode Travel theme |
| **Charts** | [Chart.js](https://www.chartjs.org/) & [React-Chartjs-2](https://react-chartjs-2.js.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com/) |

---

## 🗄️ Database Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  firstName String?
  lastName  String?
  phone     String?
  city      String?
  country   String?
  bio       String?
  image     String?
  role      String   @default("user") // "user" | "admin"
  trips     Trip[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Trip {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime
  coverPhoto  String?
  isPublic    Boolean  @default(false)
  totalBudget Float?   @default(0)
  stops       Stop[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Stop {
  id            String     @id @default(cuid())
  tripId        String
  trip          Trip       @relation(fields: [tripId], references: [id], onDelete: Cascade)
  cityName      String
  country       String?
  arrivalDate   DateTime
  departureDate DateTime
  orderIndex    Int        @default(0)
  costIndex     Float      @default(1.0)
  activities    Activity[]
}

model Activity {
  id            String   @id @default(cuid())
  stopId        String
  stop          Stop     @relation(fields: [stopId], references: [id], onDelete: Cascade)
  name          String
  category      String   // "sightseeing" | "food" | "adventure" | "transport" | "stay" | "other"
  description   String?
  cost          Float    @default(0)
  durationHours Float?   @default(1)
  scheduledTime String?
  dayNumber     Int      @default(1)
}

model City {
  id          String  @id @default(cuid())
  name        String
  country     String
  region      String
  costIndex   Float   @default(1.0)
  popularity  Int     @default(50)
  imageUrl    String?
  description String?
}
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.18+` or `v20+` / `v22+`
- **PostgreSQL**: Local instance or Cloud DB ([Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app))

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/PatelShyam04/Globe-Trotter.git
cd Globe-Trotter

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):
```bash
cp .env.example .env
```

Fill in your configuration:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/globetrotter?schema=public"

# NextAuth configuration
NEXTAUTH_SECRET="globetrotter-super-secret-jwt-key-hackathon-2026"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini API key
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4. Database Setup & Seed
```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Seed initial global cities
npm run db:seed
```

### 5. Run the Application
```bash
# Start development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📂 Project Structure & Routes

```
GlobeTrotter/
├── app/
│   ├── (app)/                       # Authenticated App Shell
│   │   ├── dashboard/               # Dashboard with Regional Filters & AI Planning
│   │   ├── trips/                   # My Trips List & Creator (/trips/create)
│   │   │   └── [id]/
│   │   │       ├── itinerary/       # Itinerary Builder with Edit Modals
│   │   │       ├── view/            # Dual-Column Physical Activity & Expense Flow
│   │   │       ├── budget/          # Chart.js Cost Analytics
│   │   │       └── timeline/        # Day-by-Day Timeline
│   │   ├── explore/                 # Global Activities with Country/Region Filter
│   │   ├── community/               # Public Trips & Community Feed
│   │   ├── calendar/                # Full Monthly Calendar
│   │   ├── profile/                 # Profile, Photo Upload & Past Trips
│   │   └── admin/                   # Admin Analytics & User Management
│   ├── (auth)/                      # Auth Pages
│   │   ├── login/                   # Login Screen
│   │   └── signup/                  # 2-Column Registration Screen
│   ├── itinerary/[id]/              # Public Sharable Itinerary View + 1-Click Clone
│   └── api/                         # Backend API Routes
│       ├── auth/                    # NextAuth & Registration
│       ├── ai/
│       │   ├── generate-trip/       # Gemini AI Multi-City Trip Generator
│       │   └── chat/                # GlobeBot AI Assistant
│       ├── trips/                   # CRUD & Cloning APIs
│       ├── stops/                   # Stop & Section Management
│       ├── activities/              # Activity Management
│       ├── cities/                  # City Search API
│       ├── profile/                 # Profile & Avatar Update API
│       └── admin/                   # Stats & User Administration
├── components/                      # Reusable UI Components
│   ├── Navbar.tsx                   # Responsive Navigation Bar & Drawer
│   ├── ChatBot.tsx                  # Floating GlobeBot Widget
│   ├── CitySearchModal.tsx          # City & Country Search Modal
│   ├── ActivityModal.tsx            # Activity Search & Add Modal
│   └── PhotoModal.tsx               # Trip Cover Photo Upload Modal
├── lib/                             # Core Logic & Utilities
│   ├── auth.ts                      # NextAuth Configuration & JWT Callbacks
│   ├── prisma.ts                    # PostgreSQL Prisma Client
│   ├── locations.ts                 # 60+ Country Registry & Multi-City Allocator
│   └── helpers.ts                   # Country Flags, Currency & Date Formatters
├── prisma/                          # Database Configuration
│   ├── schema.prisma                # Relational Prisma Models
│   └── seed.ts                      # 30 Seeded Destinations
└── package.json
```

---

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `npm run dev` | Starts Next.js development server on port 3000 |
| `build` | `npm run build` | Builds optimized production bundle |
| `start` | `npm run start` | Starts production server |
| `db:generate` | `npm run db:generate` | Generates Prisma Client types |
| `db:push` | `npm run db:push` | Syncs Prisma schema directly to PostgreSQL |
| `db:seed` | `npm run db:seed` | Seeds 30 global destinations into database |
| `db:studio` | `npm run db:studio` | Opens visual Prisma Studio database GUI |

---

## 🔒 Security & Best Practices
- **Password Hashing**: Bcrypt with salt factor 10.
- **JWT Protection**: Lightweight session tokens preventing HTTP 431 header bloat.
- **Cascade Deletes**: Deleting a trip automatically removes associated stops and activities safely.
- **Role-Based Access Control**: Sensitive routes (`/admin`, `/api/admin/*`) strictly restricted to admin users.

---

## 👥 Authors & Acknowledgments
Built with ❤️ for **Hackathon 2026** by **Shyam Patel** and the GlobeTrotter team.

- **GitHub**: [@PatelShyam04](https://github.com/PatelShyam04)
- **Repository**: [https://github.com/PatelShyam04/Globe-Trotter.git](https://github.com/PatelShyam04/Globe-Trotter.git)

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).