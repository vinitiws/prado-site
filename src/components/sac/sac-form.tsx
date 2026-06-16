'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

// ─── Types ──────────────────────────────────────────────────────────────────

interface FieldErrors {
  nome?: string
  documento?: string
  email?: string
  telefone?: string
  tipo?: string
  linha?: string
  referencia?: string
  pedido?: string
  descricao?: string
  lgpd?: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

const tiposSolicitacao = [
  { value: '', label: 'Selecione…' },
  { value: 'Reclamação', label: 'Reclamação' },
  { value: 'Devolução / Troca', label: 'Devolução / Troca' },
  { value: 'Garantia', label: 'Garantia' },
  { value: 'Informação sobre produto', label: 'Informação sobre produto' },
  { value: 'Sugestão', label: 'Sugestão' },
  { value: 'Elogio', label: 'Elogio' },
  { value: 'Outro', label: 'Outro' },
]

const linhasProduto = [
  { value: '', label: 'Selecione…' },
  { value: 'Safety Prado', label: 'Safety Prado (segurança)' },
  { value: 'Country Prado', label: 'Country Prado (agro/rural)' },
  { value: 'Não sei', label: 'Não sei / Outro' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDocumento(val: string) {
  const digits = val.replace(/\D/g, '')
  if (digits.length <= 11) {
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
}

function formatTelefone(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// ─── Input wrapper ──────────────────────────────────────────────────────────

function FormField({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-azul uppercase tracking-wider">
        {label}
        {required && <span className="text-country ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ─── Main form ──────────────────────────────────────────────────────────────

export function SacForm() {
  const [nome, setNome] = useState('')
  const [documento, setDocumento] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [tipo, setTipo] = useState('')
  const [linha, setLinha] = useState('')
  const [referencia, setReferencia] = useState('')
  const [pedido, setPedido] = useState('')
  const [descricao, setDescricao] = useState('')
  const [avaliacao, setAvaliacao] = useState(0)
  const [avaliacaoHover, setAvaliacaoHover] = useState(0)
  const [lgpd, setLgpd] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const [serverError, setServerError] = useState('')
  const [protocolo, setProtocolo] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File handlers ────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  function removeFile() {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Validation ───────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: FieldErrors = {}
    if (!nome || nome.trim().length < 3) errs.nome = 'Nome deve ter no mínimo 3 caracteres'
    if (!documento || documento.trim().length < 3) errs.documento = 'CPF/CNPJ é obrigatório'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido'
    if (!tipo) errs.tipo = 'Selecione o tipo de solicitação'
    if (!descricao || descricao.trim().length < 10)
      errs.descricao = 'Descreva detalhadamente sua solicitação (mín. 10 caracteres)'
    if (!lgpd) errs.lgpd = 'Você precisa concordar com a LGPD para enviar'
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
      const body: Record<string, unknown> = {
        nome: nome.trim(),
        documento: documento.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        tipo,
        linha,
        referencia: referencia.trim(),
        pedido: pedido.trim(),
        descricao: descricao.trim(),
        avaliacao: avaliacao ? String(avaliacao) : '—',
        lgpd: true,
      }

      if (file) {
        const b64 = await toBase64(file)
        body.arquivo_nome = file.name
        body.arquivo_b64 = b64
      }

      const res = await fetch('/api/sac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          const fieldErrs: FieldErrors = {}
          for (const err of data.errors) {
            const field = err.field as keyof FieldErrors
            fieldErrs[field] = err.message
          }
          setErrors(fieldErrs)
        }
        setServerError(data.error || 'Erro ao enviar formulário.')
        setStatus('error')
        return
      }

      setProtocolo(data.protocolo)
      setStatus('success')
    } catch {
      setServerError('Erro de conexão. Verifique sua internet e tente novamente.')
      setStatus('error')
    }
  }

  function resetForm() {
    setNome('')
    setDocumento('')
    setEmail('')
    setTelefone('')
    setTipo('')
    setLinha('')
    setReferencia('')
    setPedido('')
    setDescricao('')
    setAvaliacao(0)
    setAvaliacaoHover(0)
    setLgpd(false)
    setFile(null)
    setErrors({})
    setStatus('idle')
    setServerError('')
    setProtocolo('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Render: Success ──────────────────────────────────────────────────────

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 sm:py-16"
      >
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-marinho mb-2">Solicitação registrada!</h3>
        <p className="text-bege text-sm mb-4 max-w-md mx-auto">
          Recebemos seu contato e nossa equipe retornará em até <strong>5 dias úteis</strong>.
        </p>
        {protocolo && (
          <div className="inline-block bg-bege/10 border border-bege/30 rounded-lg px-5 py-2 text-sm font-semibold text-country mb-6">
            Protocolo: #{protocolo}
          </div>
        )}
        <br />
        <button
          onClick={resetForm}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-country text-country px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-country hover:text-branco focus:outline-none focus:ring-2 focus:ring-country focus:ring-offset-2"
        >
          Registrar outra solicitação
        </button>
      </motion.div>
    )
  }

  // ── Render: Form ─────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Nome */}
        <FormField id="nome" label="Nome completo" required error={errors.nome}>
          <input
            id="nome"
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={status === 'loading'}
            className="flex h-11 w-full rounded-lg border bg-branco px-4 py-2 text-sm text-marinho placeholder:text-bege/70 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 border-bege focus:ring-country"
          />
        </FormField>

        {/* CPF / CNPJ */}
        <FormField id="documento" label="CPF / CNPJ" required error={errors.documento}>
          <input
            id="documento"
            type="text"
            placeholder="000.000.000-00"
            value={documento}
            onChange={(e) => setDocumento(formatDocumento(e.target.value))}
            disabled={status === 'loading'}
            className="flex h-11 w-full rounded-lg border bg-branco px-4 py-2 text-sm text-marinho placeholder:text-bege/70 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 border-bege focus:ring-country"
          />
        </FormField>

        {/* E-mail */}
        <FormField id="email" label="E-mail" required error={errors.email}>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="flex h-11 w-full rounded-lg border bg-branco px-4 py-2 text-sm text-marinho placeholder:text-bege/70 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 border-bege focus:ring-country"
          />
        </FormField>

        {/* Telefone */}
        <FormField id="telefone" label="Telefone / WhatsApp">
          <input
            id="telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={telefone}
            onChange={(e) => setTelefone(formatTelefone(e.target.value))}
            disabled={status === 'loading'}
            className="flex h-11 w-full rounded-lg border bg-branco px-4 py-2 text-sm text-marinho placeholder:text-bege/70 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 border-bege focus:ring-country"
          />
        </FormField>

        {/* Tipo de solicitação */}
        <FormField id="tipo" label="Tipo de solicitação" required error={errors.tipo}>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            disabled={status === 'loading'}
            className="flex h-11 w-full rounded-lg border bg-branco px-4 py-2 text-sm text-marinho focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 border-bege focus:ring-country appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%3E%3Cpath%20d%3D%22M1%201l5%205%205-5%22%20stroke%3D%22%235c5b57%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_8px] bg-[right_14px_center] bg-no-repeat pr-9"
          >
            {tiposSolicitacao.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Linha do produto */}
        <FormField id="linha" label="Linha do produto">
          <select
            id="linha"
            value={linha}
            onChange={(e) => setLinha(e.target.value)}
            disabled={status === 'loading'}
            className="flex h-11 w-full rounded-lg border bg-branco px-4 py-2 text-sm text-marinho focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 border-bege focus:ring-country appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%3E%3Cpath%20d%3D%22M1%201l5%205%205-5%22%20stroke%3D%22%235c5b57%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_8px] bg-[right_14px_center] bg-no-repeat pr-9"
          >
            {linhasProduto.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Referência / modelo */}
        <FormField id="referencia" label="Referência / modelo">
          <input
            id="referencia"
            type="text"
            placeholder="Ex: SP-2040, CP-1010…"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            disabled={status === 'loading'}
            className="flex h-11 w-full rounded-lg border bg-branco px-4 py-2 text-sm text-marinho placeholder:text-bege/70 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 border-bege focus:ring-country"
          />
        </FormField>

        {/* Número do pedido / NF */}
        <FormField id="pedido" label="Número do pedido / NF">
          <input
            id="pedido"
            type="text"
            placeholder="Ex: 12345 / NF 000123"
            value={pedido}
            onChange={(e) => setPedido(e.target.value)}
            disabled={status === 'loading'}
            className="flex h-11 w-full rounded-lg border bg-branco px-4 py-2 text-sm text-marinho placeholder:text-bege/70 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 border-bege focus:ring-country"
          />
        </FormField>

        {/* Descrição - full width */}
        <div className="sm:col-span-2">
          <FormField id="descricao" label="Descrição detalhada" required error={errors.descricao}>
            <textarea
              id="descricao"
              placeholder="Descreva sua solicitação com o máximo de detalhes: o que aconteceu, quando, em quais condições de uso…"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={status === 'loading'}
              rows={4}
              className="flex w-full rounded-lg border bg-branco px-4 py-3 text-sm text-marinho placeholder:text-bege/70 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 border-bege focus:ring-country resize-y min-h-[100px]"
            />
          </FormField>
        </div>

        {/* Avaliação - full width */}
        <div className="sm:col-span-2">
          <FormField id="avaliacao" label="Avaliação do atendimento anterior (opcional)">
            <div className="flex gap-1 py-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setAvaliacao(star === avaliacao ? 0 : star)}
                  onMouseEnter={() => setAvaliacaoHover(star)}
                  onMouseLeave={() => setAvaliacaoHover(0)}
                  disabled={status === 'loading'}
                  className={`text-2xl transition-all duration-150 focus:outline-none ${
                    (avaliacaoHover || avaliacao) >= star
                      ? 'text-safety scale-110'
                      : 'text-bege/50 hover:text-bege'
                  }`}
                  aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
              {avaliacao > 0 && (
                <span className="ml-3 text-xs text-bege self-center">
                  {['Péssimo', 'Ruim', 'Regular', 'Bom', 'Ótimo'][avaliacao - 1]}
                </span>
              )}
            </div>
          </FormField>
        </div>

        {/* Upload - full width */}
        <div className="sm:col-span-2">
          <FormField id="arquivo" label="Foto / documento (opcional)">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-lg border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-country bg-country/5'
                  : 'border-bege/50 hover:border-country hover:bg-country/[0.03]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={status === 'loading'}
                className="hidden"
              />
              {!file ? (
                <>
                  <div className="text-2xl mb-1">📎</div>
                  <p className="text-sm text-bege">
                    <span className="text-country font-semibold">Clique para anexar</span> ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-bege/60 mt-0.5">JPG, PNG ou PDF · Máx. 5 MB</p>
                </>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg">📄</span>
                  <span className="text-sm text-marinho font-medium truncate max-w-[240px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-bege">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile()
                    }}
                    className="text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
                    aria-label="Remover arquivo"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </FormField>
        </div>

        {/* LGPD - full width */}
        <div className="sm:col-span-2">
          <div className="flex items-start gap-3 py-1">
            <input
              type="checkbox"
              id="lgpd"
              checked={lgpd}
              onChange={(e) => setLgpd(e.target.checked)}
              disabled={status === 'loading'}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-country"
            />
            <label htmlFor="lgpd" className="text-sm text-bege cursor-pointer leading-relaxed">
              Concordo com o tratamento dos meus dados pessoais conforme a{' '}
              <strong>LGPD</strong> (Lei 13.709/2018) para fins de atendimento desta
              solicitação. <span className="text-country font-semibold">*</span>
            </label>
          </div>
          {errors.lgpd && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 ml-7 mt-1"
            >
              {errors.lgpd}
            </motion.p>
          )}
        </div>
      </div>

      <hr className="border-t border-bege/20 my-6" />

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-lg bg-country text-branco px-6 py-3.5 text-base font-semibold transition-all hover:bg-country/90 hover:shadow-lg hover:shadow-country/25 active:scale-[0.99] disabled:bg-bege disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 inline-flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-branco border-t-transparent" />
            Enviando…
          </>
        ) : (
          <>
            <span>📨</span>
            Enviar Solicitação
          </>
        )}
      </button>

      {/* Server error */}
      {status === 'error' && serverError && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700"
        >
          {serverError}
        </motion.div>
      )}
    </form>
  )
}

// ─── Base64 helper ───────────────────────────────────────────────────────────

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
