import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const region = searchParams.get('region') || ''

    const cities = await prisma.city.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { country: { contains: q, mode: 'insensitive' } },
                ],
              }
            : {},
          region ? { region: { contains: region, mode: 'insensitive' } } : {},
        ],
      },
      orderBy: { popularity: 'desc' },
      take: 30,
    })

    return NextResponse.json(cities)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search cities' }, { status: 500 })
  }
}
