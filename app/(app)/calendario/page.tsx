import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { brParts, TIME_ZONE, zonedDate } from '@/lib/format'
import { TaskForm } from '@/components/task-form'
import { TaskItem } from '@/components/task-item'

export const dynamic = 'force-dynamic'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function parseMonth(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split('-').map(Number)
    return { year, month: m }
  }
  const now = brParts(new Date())
  return { year: now.year, month: now.month + 1 }
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export default async function CalendarioPage({ searchParams }: { searchParams: Promise<{ month?: string; date?: string }> }) {
  const { month: monthParam, date: dateParam } = await searchParams
  const { year, month } = parseMonth(monthParam)
  const todayParts = brParts(new Date())
  const selectedKey = dateParam ?? dayKey(todayParts.year, todayParts.month + 1, todayParts.day)

  const start = zonedDate(year, month - 1)
  const end = zonedDate(year, month)

  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)

  const [selYear, selMonth, selDay] = selectedKey.split('-').map(Number)
  const selectedDayStart = zonedDate(selYear, selMonth - 1, selDay)
  const selectedDayEnd = new Date(selectedDayStart.getTime() + 24 * 60 * 60 * 1000)

  const [monthTasks, selectedDayTasks] = await Promise.all([
    prisma.task.findMany({ where: { date: { gte: start, lt: end } }, orderBy: [{ date: 'asc' }, { createdAt: 'asc' }] }),
    prisma.task.findMany({
      where: { date: { gte: selectedDayStart, lt: selectedDayEnd } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: TIME_ZONE }).format(start)

  const dayStats = new Map<number, { count: number; pending: number }>()
  for (const task of monthTasks) {
    const day = brParts(task.date).day
    const stat = dayStats.get(day) ?? { count: 0, pending: 0 }
    stat.count += 1
    if (!task.done) stat.pending += 1
    dayStats.set(day, stat)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const isCurrentMonthView = todayParts.year === year && todayParts.month === month - 1
  const selectedDay = selectedKey.startsWith(monthKey(year, month)) ? Number(selectedKey.slice(-2)) : null

  const selectedLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', timeZone: TIME_ZONE })
    .format(selectedDayStart)

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Calendário</h1>
        <p className="section-sub">Veja o que está marcado em cada dia.</p>
      </div>

      <div className="cal-layout">
        <section className="panel">
          <div className="panel-head" style={{ marginBottom: 4 }}>
            <div><h2 style={{ textTransform: 'capitalize' }}>{monthLabel}</h2><p>Clique em um dia para ver o que tem marcado nele</p></div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Link scroll={false} href={`/calendario?month=${monthKey(prev.year, prev.month)}`} aria-label="Mês anterior" style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}>
                <ChevronLeft size={18} />
              </Link>
              <Link scroll={false} href={`/calendario?month=${monthKey(next.year, next.month)}`} aria-label="Próximo mês" style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}>
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div className="cal-grid">
            {WEEKDAYS.map((w, i) => <div className="cal-weekday" key={i}>{w}</div>)}
            {weeks.flatMap((week, wi) => week.map((day, di) => {
              if (day === null) return <div className="cal-day empty" key={`${wi}-${di}`} />
              const stat = dayStats.get(day)
              const isToday = isCurrentMonthView && todayParts.day === day
              const isSelected = selectedDay === day
              return (
                <Link
                  key={`${wi}-${di}`}
                  scroll={false}
                  href={`/calendario?month=${monthKey(year, month)}&date=${dayKey(year, month, day)}`}
                  className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                >
                  <span>{day}</span>
                  {stat && <i className={`cal-dot ${stat.pending > 0 ? 'pending' : 'done'}`}>{stat.count}</i>}
                </Link>
              )
            }))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><h2 style={{ textTransform: 'capitalize' }}>{selectedLabel}</h2><p>{selectedDayTasks.length} tarefa{selectedDayTasks.length === 1 ? '' : 's'} neste dia</p></div></div>
          {selectedDayTasks.length === 0 ? (
            <p className="subtext" style={{ marginTop: 18 }}>Nada marcado neste dia ainda.</p>
          ) : (
            <div style={{ marginTop: 12, marginBottom: 8 }}>
              {selectedDayTasks.map((t) => (
                <TaskItem key={t.id} id={t.id} title={t.title} description={t.description} done={t.done} />
              ))}
            </div>
          )}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <p className="section-sub" style={{ margin: '0 0 12px' }}>Adicionar para este dia</p>
            <TaskForm key={selectedKey} defaultDate={selectedKey} />
          </div>
        </section>
      </div>
    </>
  )
}
