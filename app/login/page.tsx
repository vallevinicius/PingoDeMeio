'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const logo = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pingo%20de%20meio%20%281%29-VXuSvY2mNyRFLACwO7DcYHOs05nRrt.png'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        setError('Usuário ou senha inválidos.')
        return
      }
      router.push(searchParams.get('from') || '/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <img src={logo} alt="Pingo de Meio" />
          <div><strong>Pingo de</strong><span>MEIO</span></div>
        </div>
        <p className="section-sub" style={{ textAlign: 'center', marginBottom: 24 }}>Entre para acessar o painel de gestão.</p>

        <div className="field-group">
          <label>Usuário</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </div>
        <div className="field-group">
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button className="submit-btn" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        {error && <p style={{ color: '#b2465a', fontSize: 12, marginTop: 12, textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
