import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (adminUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (params.id === session.user.id) return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const newRole = target.role === 'admin' ? 'user' : 'admin'
  const updated = await prisma.user.update({ where: { id: params.id }, data: { role: newRole }, select: { id: true, role: true } })

  return NextResponse.json({ user: updated })
}
