import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ItineraryViewClient from './ItineraryViewClient'

export default async function ItineraryViewPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      stops: {
        include: {
          activities: {
            orderBy: [{ dayNumber: 'asc' }, { scheduledTime: 'asc' }],
          },
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  })

  if (!trip || trip.userId !== session?.user?.id) notFound()

  return <ItineraryViewClient trip={trip as any} />
}
