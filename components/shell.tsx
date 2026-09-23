'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell, CalendarCheck, CalendarDays, ChevronDown, CircleDollarSign, ClipboardList,
  HandCoins, LayoutDashboard, ListTree, LogOut, Menu, Package, Plus, Search, ShoppingBag,
  Sparkles, Users, Wallet, X,
} from 'lucide-react'

const logo = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pingo%20de%20meio%20%281%29-VXuSvY2mNyRFLACwO7DcYHOs05nRrt.png'

const navGroups = [
  {
    label: 'GERAL',
    items: [
      { label: 'Visão geral', icon: LayoutDashboard, href: '/' },
    ],
  },
  {
    label: 'VENDAS',
    items: [
      { label: 'Vendas do dia', icon: CircleDollarSign, href: '/vendas-do-dia' },
      { label: 'Terminal PDV', icon: ShoppingBag, href: '/pdv' },
      { label: 'Histórico de pedidos', icon: ClipboardList, href: '/pedidos' },
      { label: 'Clientes', icon: Users, href: '/clientes' },
    ],
  },
  {
    label: 'PRODUTOS E ESTOQUE',
    items: [
      { label: 'Estoque', icon: Package, href: '/estoque' },
      { label: 'Produtos', icon: ListTree, href: '/produtos' },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { label: 'Financeiro', icon: Wallet, href: '/financeiro' },
      { label: 'Retiradas', icon: HandCoins, href: '/retiradas' },
    ],
  },
  {
    label: 'ORGANIZAÇÃO',
    items: [
      { label: 'Agenda', icon: CalendarCheck, href: '/agenda' },
      { label: 'Calendário', icon: CalendarDays, href: '/calendario' },
    ],
  },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date())

  async function logout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X size={20} /></button>
        <div className="brand"><img src={logo} alt="Pingo de Meio" /><div><strong>Pingo de</strong><span>MEIO</span></div></div>
        <Link href="/pdv" onClick={() => setMenuOpen(false)} className="new-order"><Plus size={18} /> Novo pedido</Link>
        <nav aria-label="Navegação principal">
          {navGroups.map((group, i) => (
            <div className="nav-group" key={group.label}>
              <p className={`nav-label ${i > 0 ? 'nav-label-bottom' : ''}`}>{group.label}</p>
              {group.items.map(({ label, icon: Icon, href }) => (
                <Link key={label} href={href} onClick={() => setMenuOpen(false)} className={`nav-item ${pathname === href ? 'active' : ''}`}>
                  <Icon size={18} />{label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-tip"><Sparkles size={17} /><div><b>Fechamento do dia</b><span>Confira seus resultados antes de encerrar.</span></div></div>
        <div className="profile">
          <div className="avatar">PM</div>
          <div><b>Pingo de Meio</b><span>Administrador</span></div>
          <button onClick={logout} aria-label="Sair" title="Sair" style={{ marginLeft: 'auto', background: 'transparent', border: 0, color: '#bcaec4', display: 'flex' }}>
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <section className="content-shell">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu size={22} /></button>
          <div className="search"><Search size={18} /><input aria-label="Buscar" placeholder="Buscar pedidos, produtos..." /></div>
          <div className="top-actions">
            <button className="date-filter"><CalendarDays size={16} /> {today} <ChevronDown size={15} /></button>
            <button className="location"><span className="location-dot" /> Loja principal <ChevronDown size={15} /></button>
            <button className="icon-button" aria-label="Notificações"><Bell size={19} /><i /></button>
            <div className="top-avatar">PM</div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </section>
    </main>
  )
}
