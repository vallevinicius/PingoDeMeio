import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { zonedDate } from '@/lib/format'

export async function POST(request: NextRequest) {
  const { title, description, date } = await request.json() as {
    title: string
    description?: string
    date: string
  }

  if (!title || !date) {
    return NextResponse.json({ error: 'title e date são obrigatórios' }, { status: 400 })
  }

  const [y, m, d] = date.split('-').map(Number)
  const taskDate = new Date(zonedDate(y, m - 1, d).getTime() + 12 * 60 * 60 * 1000)

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      date: taskDate,
    },
  })

  return NextResponse.json({ task }, { status: 201 })
}
