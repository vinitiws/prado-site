'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirectTo, setRedirectTo] = useState('/admin/dashboard')
  const router = useRouter()

  useEffect(() => {
    // Read redirect param safely without useSearchParams
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
    }
    const urlError = params.get('error')
    if (urlError === 'supabase_not_configured') {
      setError('Supabase não configurado corretamente.')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }

      // Force RSC cache invalidation so server components see the new session
      router.refresh()
      router.push(redirectTo)
    } catch (err) {
      setError('Erro ao fazer login. Verifique sua conexão e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bege/10 px-4">
      <div className="w-full max-w-sm bg-branco rounded-2xl border border-bege/20 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-marinho">Admin Prado</h1>
          <p className="text-sm text-bege mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@prado.com.br"
            required
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
