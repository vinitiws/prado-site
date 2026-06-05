'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ─── Types ───────────────────────────────────────────────────────────────────
interface IBGEEstado {
  id: number
  sigla: string
  nome: string
}

interface IBGEMunicipio {
  id: number
  nome: string
}

interface FieldErrors {
  nome?: string
  email?: string
  whatsapp?: string
  cidade?: string
  estado?: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface TurnstileAPI {
  render: (container: string | HTMLElement, opts: Record<string, unknown>) => string
  remove: (widgetId: string) => void
  reset: (widgetId: string) => void
}

function getTurnstile(): TurnstileAPI | undefined {
  return (window as unknown as { turnstile?: TurnstileAPI }).turnstile
}

// ─── Autocomplete sub-component ──────────────────────────────────────────────
function AutocompleteField<T extends { nome: string }>({
  id,
  label,
  placeholder,
  items,
  value,
  onChange,
  onSelect,
  disabled,
  error,
  loading,
}: {
  id: string
  label: string
  placeholder: string
  items: T[]
  value: string
  onChange: (v: string) => void
  onSelect: (item: T) => void
  disabled?: boolean
  error?: string
  loading?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = useMemo(() => {
    if (!value) return items
    const q = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return items.filter((i) =>
      i.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q)
    )
  }, [items, value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown') {
        setOpen(true)
        e.preventDefault()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        setFocusedIdx((prev) => Math.min(prev + 1, filtered.length - 1))
        e.preventDefault()
        break
      case 'ArrowUp':
        setFocusedIdx((prev) => Math.max(prev - 1, 0))
        e.preventDefault()
        break
      case 'Enter':
        if (focusedIdx >= 0 && filtered[focusedIdx]) {
          onSelect(filtered[focusedIdx])
          setOpen(false)
        }
        e.preventDefault()
        break
      case 'Escape':
        setOpen(false)
        e.preventDefault()
        break
    }
  }

  return (
    <div ref={wrapperRef} className="relative space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-marinho">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setFocusedIdx(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={`flex h-11 w-full rounded-lg border bg-branco px-4 py-2 text-sm text-marinho placeholder:text-bege/70 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-bege focus:ring-safety'
        }`}
      />
      {loading && (
        <div className="absolute right-3 top-9">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-safety border-t-transparent" />
        </div>
      )}
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-bege bg-branco shadow-lg">
          {filtered.map((item, idx) => (
            <li
              key={(item as unknown as { id: number }).id}
              className={`cursor-pointer px-4 py-2 text-sm text-marinho transition-colors hover:bg-safety/20 ${
                idx === focusedIdx ? 'bg-safety/20' : ''
              }`}
              onMouseDown={() => {
                onSelect(item)
                setOpen(false)
              }}
              onMouseEnter={() => setFocusedIdx(idx)}
            >
              {item.nome}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// ─── Main form ───────────────────────────────────────────────────────────────
export function PartnerForm() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cidadeQuery, setCidadeQuery] = useState('')
  const [estadoQuery, setEstadoQuery] = useState('')

  const [selectedEstado, setSelectedEstado] = useState<IBGEEstado | null>(null)
  const [selectedCidade, setSelectedCidade] = useState<IBGEMunicipio | null>(null)

  const [estados, setEstados] = useState<IBGEEstado[]>([])
  const [cidades, setCidades] = useState<IBGEMunicipio[]>([])
  const [loadingEstados, setLoadingEstados] = useState(true)
  const [loadingCidades, setLoadingCidades] = useState(false)

  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const [serverError, setServerError] = useState('')

  const turnstileRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetId = useRef<string | undefined>(undefined)
  const [turnstileToken, setTurnstileToken] = useState('')

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  // ── Load states ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then((r) => r.json())
      .then((data: IBGEEstado[]) => {
        if (!cancelled) setEstados(data)
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoadingEstados(false)
      })
    return () => { cancelled = true }
  }, [])

  // ── Load cities when estado changes ──────────────────────────────────────
  useEffect(() => {
    if (!selectedEstado) {
      setCidades([])
      return
    }
    let cancelled = false
    setLoadingCidades(true)
    setCidadeQuery('')
    setSelectedCidade(null)

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado.sigla}/municipios`
    )
      .then((r) => r.json())
      .then((data: IBGEMunicipio[]) => {
        if (!cancelled) setCidades(data)
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoadingCidades(false)
      })
    return () => { cancelled = true }
  }, [selectedEstado])

  // ── Turnstile ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return

    // Load script if not already loaded
    if (!getTurnstile()) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    // Poll until turnstile is available, then render
    const interval = setInterval(() => {
      const turnstile = getTurnstile()
      if (turnstile && turnstileRef.current) {
        // Clear previous widget
        if (turnstileWidgetId.current) {
          try { turnstile.remove(turnstileWidgetId.current) } catch { /* ignore */ }
        }
        turnstileWidgetId.current = turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
        })
        clearInterval(interval)
      }
    }, 200)

    return () => {
      clearInterval(interval)
      const turnstile = getTurnstile()
      if (turnstile && turnstileWidgetId.current) {
        try { turnstile.remove(turnstileWidgetId.current) } catch { /* ignore */ }
      }
    }
  }, [turnstileSiteKey])

  // ── Validate ─────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: FieldErrors = {}
    if (!nome || nome.trim().length < 3) errs.nome = 'Nome deve ter no mínimo 3 caracteres'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido'
    if (!whatsapp || whatsapp.trim().length === 0) errs.whatsapp = 'WhatsApp é obrigatório'
    if (!selectedEstado) errs.estado = 'Selecione um estado'
    if (!selectedCidade) errs.cidade = 'Selecione uma cidade'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setStatus('loading')
    setServerError('')

    try {
      const res = await fetch('/api/parceiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          cidade: selectedCidade!.nome,
          estado: selectedEstado!.sigla,
          origem: 'Site Prado Calçados',
          turnstileToken: turnstileToken || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          const fieldErrs: FieldErrors = {}
          for (const err of data.errors) {
            if (err.field === 'nome') fieldErrs.nome = err.message
            else if (err.field === 'email') fieldErrs.email = err.message
            else if (err.field === 'whatsapp') fieldErrs.whatsapp = err.message
            else if (err.field === 'cidade') fieldErrs.cidade = err.message
            else if (err.field === 'estado') fieldErrs.estado = err.message
          }
          setErrors(fieldErrs)
        }
        setServerError(data.error || 'Erro ao enviar formulário.')
        setStatus('error')
        return
      }

      setStatus('success')

      // Reset form
      setNome('')
      setEmail('')
      setWhatsapp('')
      setCidadeQuery('')
      setEstadoQuery('')
      setSelectedEstado(null)
      setSelectedCidade(null)
      setTurnstileToken('')
      setErrors({})

      // Reset Turnstile widget
      const turnstile = getTurnstile()
      if (turnstile && turnstileWidgetId.current) {
        turnstile.reset(turnstileWidgetId.current)
      }
    } catch {
      setServerError('Erro de conexão. Verifique sua internet e tente novamente.')
      setStatus('error')
    }
  }

  // ── Format WhatsApp ──────────────────────────────────────────────────────
  function handleWhatsAppChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) {
      setWhatsapp(`(${digits}`)
    } else if (digits.length <= 7) {
      setWhatsapp(`(${digits.slice(0, 2)}) ${digits.slice(2)}`)
    } else {
      setWhatsapp(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`)
    }
  }

  // ── Estados sorted list (memo) ───────────────────────────────────────────
  const estadosSorted = useMemo(
    () => [...estados].sort((a, b) => a.nome.localeCompare(b.nome)),
    [estados]
  )

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        id="nome"
        label="Nome completo"
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        error={errors.nome}
        disabled={status === 'loading'}
      />

      <Input
        id="email"
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        disabled={status === 'loading'}
      />

      <Input
        id="whatsapp"
        label="WhatsApp"
        placeholder="(11) 99999-9999"
        value={whatsapp}
        onChange={(e) => handleWhatsAppChange(e.target.value)}
        error={errors.whatsapp}
        disabled={status === 'loading'}
      />

      <AutocompleteField
        id="estado"
        label="Estado"
        placeholder="Selecione um estado..."
        items={estadosSorted}
        value={estadoQuery}
        onChange={(v) => {
          setEstadoQuery(v)
          // Clear city when estado text changes
          setSelectedEstado(null)
          setSelectedCidade(null)
          setCidadeQuery('')
        }}
        onSelect={(item) => {
          setSelectedEstado(item)
          setEstadoQuery(item.nome)
        }}
        disabled={status === 'loading' || loadingEstados}
        loading={loadingEstados}
        error={errors.estado}
      />

      <AutocompleteField
        id="cidade"
        label="Cidade"
        placeholder={
          selectedEstado
            ? 'Digite para buscar cidades...'
            : 'Selecione um estado primeiro'
        }
        items={cidades}
        value={cidadeQuery}
        onChange={(v) => {
          setCidadeQuery(v)
          setSelectedCidade(null)
        }}
        onSelect={(item) => {
          setSelectedCidade(item)
          setCidadeQuery(item.nome)
        }}
        disabled={status === 'loading' || !selectedEstado || loadingCidades}
        loading={loadingCidades}
        error={errors.cidade}
      />

      {/* Turnstile */}
      {turnstileSiteKey && (
        <div ref={turnstileRef} className="flex justify-center min-h-[65px]" />
      )}

      {/* Submit button */}
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-marinho border-t-transparent" />
            Enviando...
          </>
        ) : (
          'Quero ser parceiro'
        )}
      </Button>

      {/* Server error */}
      {status === 'error' && serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Success */}
      {status === 'success' && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          Recebemos sua solicitação. Nossa equipe comercial entrará em contato em breve.
        </div>
      )}
    </form>
  )
}
