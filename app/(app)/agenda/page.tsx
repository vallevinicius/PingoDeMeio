import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { brParts, startOfDayBR, TIME_ZONE, zonedDate } from '@/lib/format'
import { TaskForm } from '@/components/task-form'
import { TaskItem } from '@/components/task-item'

export const dynamic = 'force-dynamic'

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

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: monthParam } = await searchParams
  const { year, month } = parseMonth(monthParam)

  const start = zonedDate(year, month - 1)
  const end = zonedDate(year, month)

  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)

  const todayStart = startOfDayBR(new Date())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const [monthTasks, todayTasks] = await Promise.all([
    prisma.task.findMany({ where: { date: { gte: start, lt: end } }, orderBy: [{ date: 'asc' }, { createdAt: 'asc' }] }),
    prisma.task.findMany({ where: { date: { gte: todayStart, lt: todayEnd } }, orderBy: { createdAt: 'asc' } }),
  ])

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: TIME_ZONE }).format(start)
  const todayLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', timeZone: TIME_ZONE }).format(todayStart)

  const groups = new Map<string, { label: string; tasks: typeof monthTasks }>()
  for (const task of monthTasks) {
    const key = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE }).format(task.date)
    if (!groups.has(key)) {
      const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', timeZone: TIME_ZONE }).format(task.date)
      groups.set(key, { label, tasks: [] })
    }
    groups.get(key)!.tasks.push(task)
  }

  const pendingCount = monthTasks.filter((t) => !t.done).length

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Agenda</h1>
        <p className="section-sub">Organize o que vocês precisam fazer em cada dia.</p>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Hoje</h2><p style={{ textTransform: 'capitalize' }}>{todayLabel}</p></div></div>
        {todayTasks.length === 0 ? (
          <p className="subtext" style={{ marginTop: 18 }}>Nenhuma tarefa para hoje.</p>
        ) : (
          <div style={{ marginTop: 12 }}>
            {todayTasks.map((t) => (
              <TaskItem key={t.id} id={t.id} title={t.title} description={t.description} done={t.done} />
            ))}
          </div>
        )}
      </section>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Nova tarefa</h2><p>Marque o que precisa ser feito e em qual dia</p></div></div>
        <div style={{ marginTop: 16 }}>
          <TaskForm />
        </div>
      </section>

      <div className="inline-form" style={{ marginTop: 0, marginBottom: 20, alignItems: 'center' }}>
        <Link scroll={false} href={`/agenda?month=${monthKey(prev.year, prev.month)}`} aria-label="Mês anterior" style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}>
          <ChevronLeft size={18} />
        </Link>
        <h2 style={{ margin: 0, fontSize: 16, textTransform: 'capitalize', minWidth: 160, textAlign: 'center' }}>{monthLabel}</h2>
        <Link scroll={false} href={`/agenda?month=${monthKey(next.year, next.month)}`} aria-label="Próximo mês" style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}>
          <ChevronRight size={18} />
        </Link>
      </div>

      <section className="panel">
        <div className="panel-head"><div><h2>Tarefas de {monthLabel}</h2><p>{monthTasks.length} tarefas · {pendingCount} pendente{pendingCount === 1 ? '' : 's'}</p></div></div>
        {groups.size === 0 ? (
          <p className="subtext" style={{ marginTop: 18 }}>Nenhuma tarefa marcada neste mês.</p>
        ) : (
          <div style={{ marginTop: 12 }}>
            {[...groups.entries()].map(([key, group]) => (
              <div className="task-day-group" key={key}>
                <div className="task-day-header">{group.label} <small>{key}</small></div>
                {group.tasks.map((t) => (
                  <TaskItem key={t.id} id={t.id} title={t.title} description={t.description} done={t.done} />
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
