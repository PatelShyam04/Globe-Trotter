import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      name,
      email,
      password,
      phone,
      city,
      country,
      bio,
      image,
    } = await request.json()

    const fullName = name || [firstName, lastName].filter(Boolean).join(' ') || 'Traveler'

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: fullName,
        firstName: firstName || null,
        lastName: lastName || null,
        email,
        password: hashedPassword,
        phone: phone || null,
        city: city || null,
        country: country || null,
        bio: bio || null,
        image: image || null,
      },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
