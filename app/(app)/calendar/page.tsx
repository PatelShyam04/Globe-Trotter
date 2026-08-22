import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CalendarClient from './CalendarClient'

export default async function CalendarPage() {
  const session = await auth()
  const userId = session?.user?.id!

  const trips = await prisma.trip.findMany({
    where: { userId },
    include: {
      stops: {
        include: {
          activities: true,
        },
      },
    },
    orderBy: { startDate: 'asc' },
  })

  return <CalendarClient trips={trips as any} />
}
